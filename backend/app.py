import os
import torch
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import AutoTokenizer, AutoConfig
import modal
from huggingface_hub import HfApi
from huggingface_hub.utils import RepositoryNotFoundError
from fastapi.middleware.cors import CORSMiddleware
    
def get_gpu_type(param_count: int) -> str:
    param_count = param_count * 1000000000
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
    .pip_install(
        "torch>=2.1.0",  # Use latest compatible version
        "transformers",
        "fastapi",
        "uvicorn",
        "pydantic",
        "huggingface_hub",
        "optimum",
        "compressed-tensors",
        "accelerate",
        "auto-gptq",
        "bitsandbytes"  # For quantization support
    )
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
            print(f"Using device: {self.device}")

            # Load tokenizer with proper padding token
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                revision=self.model_revision,
                padding_side="left",  # Ensure padding is on the left
                use_fast=True  # Use fast tokenizer
            )
            
            # Set padding token if not set
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                self.tokenizer.pad_token_id = self.tokenizer.eos_token_id

            # Load model with proper configuration
            ModelClass = self.get_correct_model_class(self.model_name)
            self.model = ModelClass.from_pretrained(
                self.model_name,
                revision=self.model_revision,
                device_map="auto",
                torch_dtype=torch.bfloat16,
                trust_remote_code=True,
                use_cache=True,
                low_cpu_mem_usage=True,
                offload_folder=None  # Enable model offloading
            ).eval()

            # Enable model optimizations
            if hasattr(self.model, "enable_input_require_grads"):
                self.model.enable_input_require_grads()
            if hasattr(self.model, "enable_gradient_checkpointing"):
                self.model.enable_gradient_checkpointing()
            if hasattr(self.model, "enable_model_cpu_offload"):
                self.model.enable_model_cpu_offload()

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

                # Tokenize with proper attention mask
                inputs = self.tokenizer(
                    input_text,
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                    max_length=512,
                    add_special_tokens=True
                )

                # Ensure attention mask is set
                if "attention_mask" not in inputs:
                    inputs["attention_mask"] = torch.ones_like(inputs["input_ids"])

                # Move to device
                inputs = {k: v.to(self.device) for k, v in inputs.items()}

                try:
                    if not hasattr(self.model, "generate"):
                        return {"error": "This model does not support text generation."}

                    with torch.no_grad(), torch.cuda.amp.autocast():  # Enable automatic mixed precision
                        outputs = self.model.generate(
                            inputs["input_ids"],
                            attention_mask=inputs["attention_mask"],
                            max_length=50,
                            min_length=1,
                            num_return_sequences=1,
                            pad_token_id=self.tokenizer.pad_token_id,
                            eos_token_id=self.tokenizer.eos_token_id,
                            do_sample=True,
                            temperature=0.7,
                            top_p=0.9,
                            top_k=50,
                            repetition_penalty=1.2,
                            no_repeat_ngram_size=3,
                            early_stopping=True,
                            use_cache=True  # Enable KV cache
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
deploy_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Or ["POST"] if you want to be strict
    allow_headers=["*"],
)
class DeploymentRequest(BaseModel):
    org_name: str
    model_name: str
    model_revision: str = "main"

@deploy_app.post("/check_if_model_exists")
async def check_if_model_exists(request: Request) -> bool:
    try:
        body = await request.json()
        org = body.get("org_name")
        model_name = org + "/" + body.get("model_name")
        model_revision = body.get("model_revision", "main")
        api = HfApi()
        api.model_info(model_name, revision=model_revision)
        return True
    except RepositoryNotFoundError:
        return False
    except Exception as e:
        print(f"Error checking model: {e}")
        return False

@deploy_app.post("/deploy")
async def deploy_model(request: Request):
    print(await request.json())
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