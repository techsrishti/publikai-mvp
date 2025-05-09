import os
import logging
from dotenv import load_dotenv
import modal
import fastapi
from pydantic import BaseModel, ConfigDict
from fastapi import HTTPException
from typing import List, Dict, Any

# FastAPI for external deployment
fastapp = fastapi.FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MODAL_TOKEN_ID = os.getenv("MODAL_TOKEN_ID")
MODAL_TOKEN_SECRET = os.getenv("MODAL_TOKEN_SECRET")

client = modal.Client.from_credentials(MODAL_TOKEN_ID, MODAL_TOKEN_SECRET)

# Modal setup
app = modal.App("hf-model-fastapi")
image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")

volume = modal.Volume.from_name("model-storage", create_if_missing=True)

# Defaults
DEFAULT_MODEL_ORG = None
DEFAULT_MODEL_NAME = "distilgpt2"

# Request schema
class InferenceRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    text: str | None = None
    context: str | None = None
    organization: str | None = None
    model_name: str | None = None

# Globals to persist model across requests
model_pipeline = None
task_type = None

# Load model once per container lifecycle
def load_model(organization: str | None = DEFAULT_MODEL_ORG, model_name: str = DEFAULT_MODEL_NAME):
    logger.info(f"Loading model: {model_name} from organization: {organization if organization else 'default'}")
    
    from transformers import (
        pipeline, AutoConfig, AutoTokenizer, AutoFeatureExtractor, AutoProcessor,
        AutoModelForSequenceClassification, AutoModelForCausalLM, AutoModelForSeq2SeqLM,
        AutoModelForTokenClassification, AutoModelForQuestionAnswering,
        AutoModelForMaskedLM, AutoModelForMultipleChoice, AutoModelForNextSentencePrediction,
        AutoModelForImageClassification, AutoModelForObjectDetection,
        AutoModelForImageSegmentation, AutoModelForAudioClassification,
        AutoModelForCTC, AutoModelForSpeechSeq2Seq, AutoModelForTextToSpectrogram,
        AutoModelForTextToWaveform
    )

    model_id = f"{organization}/{model_name}" if organization else model_name
    config = AutoConfig.from_pretrained(model_id)

    model_task_map = {
        "BertForSequenceClassification": (AutoModelForSequenceClassification, "text-classification"),
        "RobertaForSequenceClassification": (AutoModelForSequenceClassification, "text-classification"),
        "DistilBertForSequenceClassification": (AutoModelForSequenceClassification, "text-classification"),
        "GPT2LMHeadModel": (AutoModelForCausalLM, "text-generation"),
        "T5ForConditionalGeneration": (AutoModelForSeq2SeqLM, "text2text-generation"),
        "BertForTokenClassification": (AutoModelForTokenClassification, "token-classification"),
        "RobertaForTokenClassification": (AutoModelForTokenClassification, "token-classification"),
        "BertForQuestionAnswering": (AutoModelForQuestionAnswering, "question-answering"),
        "RobertaForQuestionAnswering": (AutoModelForQuestionAnswering, "question-answering"),
        "BertForMaskedLM": (AutoModelForMaskedLM, "fill-mask"),
        "RobertaForMaskedLM": (AutoModelForMaskedLM, "fill-mask"),
        "BertForMultipleChoice": (AutoModelForMultipleChoice, "multiple-choice"),
        "RobertaForMultipleChoice": (AutoModelForMultipleChoice, "multiple-choice"),
        "BertForNextSentencePrediction": (AutoModelForNextSentencePrediction, "next-sentence-prediction"),
        "ViTForImageClassification": (AutoModelForImageClassification, "image-classification"),
        "DetrForObjectDetection": (AutoModelForObjectDetection, "object-detection"),
        "SegformerForImageSegmentation": (AutoModelForImageSegmentation, "image-segmentation"),
        "Wav2Vec2ForCTC": (AutoModelForCTC, "automatic-speech-recognition"),
        "WhisperForConditionalGeneration": (AutoModelForSpeechSeq2Seq, "automatic-speech-recognition"),
        "Wav2Vec2ForSequenceClassification": (AutoModelForAudioClassification, "audio-classification"),
        "Speech2TextForConditionalGeneration": (AutoModelForSpeechSeq2Seq, "automatic-speech-recognition"),
        "SpeechT5ForTextToSpeech": (AutoModelForTextToSpectrogram, "text-to-speech"),
        "VitsModel": (AutoModelForTextToWaveform, "text-to-speech"),
    }

    model_class, task = model_task_map.get(config.architectures[0], (AutoModelForCausalLM, "text-generation"))
    model = model_class.from_pretrained(model_id)

    if task in ["image-classification", "object-detection", "image-segmentation"]:
        processor = AutoFeatureExtractor.from_pretrained(model_id)
        pipe = pipeline(task, model=model, feature_extractor=processor)
    elif task in ["automatic-speech-recognition", "audio-classification", "text-to-speech"]:
        processor = AutoProcessor.from_pretrained(model_id)
        pipe = pipeline(task, model=model, processor=processor)
    else:
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        pipe = pipeline(task, model=model, tokenizer=tokenizer)

    return pipe, task

# Modal startup function: loads model once
@app.function(image=image, scaledown_window=300, volumes={"/root/model": volume})
def startup(organization: str | None = DEFAULT_MODEL_ORG, model_name: str = DEFAULT_MODEL_NAME):
    global model_pipeline, task_type
    logger.info(f"Preloading model: {model_name} from organization: {organization if organization else 'default'}")
    model_pipeline, task_type = load_model(organization, model_name)

# Inference endpoint
@app.function(image=image, scaledown_window=300, volumes={"/root/model": volume})
@modal.fastapi_endpoint(method="POST")
def inference(request: InferenceRequest):
    global model_pipeline, task_type

    # Dynamically reload model based on request parameters
    if model_pipeline is None or request.organization != DEFAULT_MODEL_ORG or request.model_name != DEFAULT_MODEL_NAME:
        logger.info(f"Reloading model based on request: {request.model_name} from organization: {request.organization}")
        model_pipeline, task_type = load_model(request.organization, request.model_name or DEFAULT_MODEL_NAME)

    try:
        if task_type == "question-answering":
            if not request.context:
                raise HTTPException(status_code=400, detail="Context is required for question-answering tasks.")
            result = model_pipeline(question=request.text, context=request.context)
            return {
                "answer": result["answer"],
                "confidence": round(result["score"] * 100, 2),
                "response": f"The answer is: {result['answer']}"
            }
        else:
            result = model_pipeline(request.text, max_length=100, num_return_sequences=1)
            return format_response(result, task_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

# Format responses
def format_response(result: List[Dict[str, Any]], task: str):
    if task == "text-classification":
        label = result[0]["label"].lower()
        score = result[0]["score"]
        label_map = {
            "label_0": "negative",
            "label_1": "positive"
        }
        friendly = label_map.get(label, label)
        return {
            "sentiment": friendly,
            "confidence": round(score * 100, 2),
            "response": f"The text expresses a {friendly} sentiment",
            "raw_score": score
        }
    elif task == "text-generation":
        return {
            "generated_text": result[0]["generated_text"],
            "response": "Here's the generated answer"
        }
    else:
        return {
            "label": result[0]["label"],
            "confidence": round(result[0]["score"] * 100, 2),
            "response": f"The text is classified as: {result[0]['label']}"
        }

# Deployment trigger from FastAPI
@fastapp.post("/deploy")
def deploy(request: InferenceRequest):
    organization = request.organization or DEFAULT_MODEL_ORG
    model_name = request.model_name or DEFAULT_MODEL_NAME

    with modal.enable_output():
        app.deploy(client=client)
        startup.remote(organization, model_name)  # preload selected model into container
        return {"endpoint_url": inference.get_web_url()}
