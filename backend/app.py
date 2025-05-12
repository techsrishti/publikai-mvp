import os
import torch
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import AutoTokenizer, AutoConfig
import modal
from huggingface_hub import HfApi
from huggingface_hub.utils import RepositoryNotFoundError

# ✅ Check model existence on Hugging Face Hub
def check_if_model_exists(model_name: str, model_revision: str = "main") -> bool:
    try:
        api = HfApi()
        api.model_info(model_name, revision=model_revision)
        return True
    except RepositoryNotFoundError:
        return False
    except Exception as e:
        print(f"Error checking model: {e}")
        return False
    
def get_gpu_type(param_count: int) -> str:
    if param_count < 100_000_000:
        return "T4"
    elif param_count < 500_000_000:
        return "L4"
    elif param_count < 2_000_000_000:
        return "A10G"
    elif param_count < 7_000_000_000:
        return "A100-40GB"
    elif param_count < 20_000_000_000:
        return "A100-80GB"
    elif param_count < 50_000_000_000:
        return "L40S"
    else:
        return "H100"

# Shared HF cache
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

# Base image
base_image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install("transformers", "torch", "fastapi", "uvicorn", "pydantic", "huggingface_hub", "optimum", "compressed-tensors", "accelerate", "auto-gptq")
)

# ✅ Modal App Builder
def create_app(model_name: str, model_revision: str = "main", label: str = "web", gpu_type: str = "A10G:1") -> modal.App:
    app_name = f"{label}-transformers-chat"
    app = modal.App(app_name)

    @app.cls(
        image=base_image,
        gpu=gpu_type,
        volumes={"/root/.cache/huggingface": hf_cache_vol},
        scaledown_window=900,
        serialized=True
    )
    class ModelWorker:
        def __init__(self):
            self.model_name = model_name
            self.model_revision = model_revision
            self.label = label

        def get_correct_model_class(self, model_id_or_path: str):
            config = AutoConfig.from_pretrained(model_id_or_path)
            arch = " ".join(config.architectures or []).lower()

            if config.model_type in ["gpt2", "gpt_neo", "gpt_neox", "opt", "bloom", "mpt"]:
                from transformers import AutoModelForCausalLM
                return AutoModelForCausalLM

            if "causallm" in arch:
                from transformers import AutoModelForCausalLM
                return AutoModelForCausalLM
            elif "maskedlm" in arch:
                from transformers import AutoModelForMaskedLM
                return AutoModelForMaskedLM
            elif "seq2seqlm" in arch or config.is_encoder_decoder:
                from transformers import AutoModelForSeq2SeqLM
                return AutoModelForSeq2SeqLM
            elif "questionanswering" in arch:
                from transformers import AutoModelForQuestionAnswering
                return AutoModelForQuestionAnswering
            elif "tokenclassification" in arch:
                from transformers import AutoModelForTokenClassification
                return AutoModelForTokenClassification
            elif "sequenceclassification" in arch and not config.is_encoder_decoder:
                from transformers import AutoModelForSequenceClassification
                return AutoModelForSequenceClassification
            else:
                from transformers import AutoModel
                return AutoModel

        @modal.enter()
        def load_model(self):
            print(f"🔧 Loading model: {self.model_name} [{self.model_revision}]")

            if not self.model_name:
                raise ValueError("Model name must be provided")

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, revision=self.model_revision)
            ModelClass = self.get_correct_model_class(self.model_name)
            self.model = ModelClass.from_pretrained(self.model_name, revision=self.model_revision).to(self.device).eval()

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            print(f"✅ Model {ModelClass.__name__} loaded successfully")

        @modal.asgi_app(label=label)
        def fastapi_app(self):
            web_app = FastAPI()

            @web_app.get("/health")
            def health():
                return {"status": "ok"}

            @web_app.post("/generate")
            async def generate(request: Request):
                body = await request.json()
                messages = body.get("messages", [])

                if not messages or "content" not in messages[0]:
                    return {"error": "Message content is required."}

                input_text = messages[0]["content"]
                inputs = self.tokenizer(
                    input_text,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512
                ).to(self.device)

                try:
                    if not hasattr(self.model, "generate"):
                        return {"error": "This model does not support text generation."}

                    with torch.no_grad():
                        outputs = self.model.generate(
                            inputs["input_ids"],
                            max_length=50,
                            pad_token_id=self.tokenizer.pad_token_id,
                            eos_token_id=self.tokenizer.eos_token_id
                        )

                    output_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    return {"generated_text": output_text}

                except Exception as e:
                    print(f"❌ Error generating: {e}")
                    return {"error": "Text generation failed"}

            return web_app

    return app

# ✅ Deployment entrypoint
deploy_app = FastAPI()

class DeploymentRequest(BaseModel):
    org_name: str
    model_name: str
    model_revision: str = "main"

@deploy_app.post("/deploy")
async def deploy_model(request: Request):
    try:
        body = await request.json()
        org = body.get("org_name")
        model = body.get("model_name")
        revision = body.get("model_revision", "main")
        label = body.get("model_unique_name", "web")
        param_count = body.get("param_count")
        gpu_type = get_gpu_type(param_count)  + ":1"

        if not org or not model:
            raise HTTPException(status_code=400, detail="org_name and model_name are required")

        model_id = f"{org}/{model}"
        if not check_if_model_exists(model_id, revision):
            raise HTTPException(status_code=400, detail="Model does not exist on Hugging Face")

        app = create_app(model_id, revision, label, gpu_type)
        deployment_name = f"{label}-transformers-chat"

        with modal.enable_output():
            app.deploy(name=deployment_name)

        return {
            "status": "success",
            "message": "Model deployed successfully",
            "deployment_name": deployment_name,
            "model_name": model,
            "model_revision": revision,
            "deployment_url": f"https://leeladhar20042004--{label}.modal.run"
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))