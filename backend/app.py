import os
import time
import torch
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List
from transformers import AutoTokenizer, AutoModelForCausalLM
import modal
from huggingface_hub import model_info, HfApi
from huggingface_hub.utils import RepositoryNotFoundError
from pathlib import Path

def check_model_exists(model_id: str) -> bool:
    try:
        api = HfApi()
        api.model_info(model_id)
        return True
    except RepositoryNotFoundError:
        return False
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise

# Shared HF cache volume
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

# Base image
base_image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install("transformers", "torch", "fastapi", "uvicorn", "pydantic", "compressed-tensors", "accelerate", "huggingface_hub[hf_transfer]", "bitsandbytes")
    .env({
        "HF_HUB_ENABLE_HF_TRANSFER": "1"
    })
)

def create_app(model_name: str, model_revision: str = "main", lable: str = "web") -> modal.App:
    app_name = f"{model_name.replace('/', '-')}-transformers-chat"
    app = modal.App(app_name)

    @app.cls(
        image=base_image,
        volumes={"/root/.cache/huggingface": hf_cache_vol},
        scaledown_window=900,
        serialized=True,
        gpu="H100"
    )
    class ModelWorker:
        def __init__(self):
            self.model_name = model_name
            self.model_revision = model_revision
            self.lable = lable

        def download_model(self, model_name: str, model_revision: str = "main"):
            model_path = Path("/root/.cache/huggingface")
            print(f"Cache directory: {model_path}")
            from huggingface_hub import snapshot_download
            downloaded_path = snapshot_download(
                repo_id=model_name,
                revision=model_revision,
                cache_dir=model_path,
                local_files_only=False
            )
            print(f"Downloaded model path: {downloaded_path}")
            for item in Path(downloaded_path).iterdir():
                print(f"  - {item.name}")
            return downloaded_path

        @modal.enter()
        def load_model(self):
            print(f"\U0001f527 Loading model: {self.model_name} [{self.model_revision}]")

            if not self.model_name:
                raise ValueError("Model name must be provided")

            model_dir = self.download_model(self.model_name, self.model_revision)

            for root, dirs, files in os.walk(model_dir):
                level = root.replace(str(model_dir), '').count(os.sep)
                indent = ' ' * 4 * level
                print(f"{indent}{os.path.basename(root)}/")
                subindent = ' ' * 4 * (level + 1)
                for f in files:
                    print(f"{subindent}{f}")

            if not Path(model_dir).exists():
                raise ValueError(f"Model directory not found at {model_dir}")

            if torch.cuda.is_available():
                print("\U0001f680 Using GPU for inference")
                device_map = "auto"
                dtype = torch.float16
            else:
                print("⚠️ GPU not available, falling back to CPU")
                device_map = "cpu"
                dtype = torch.float32

            print(f"\nLoading tokenizer from: {model_dir}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_dir)

            print(f"Loading model from: {model_dir}")
            self.model = AutoModelForCausalLM.from_pretrained(
                model_dir,
                device_map=device_map,
                torch_dtype=dtype
            ).eval()

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            print("✅ Model loaded successfully")

        @modal.asgi_app(label="web")
        def fastapi_app(self):
            web_app = FastAPI()

            @web_app.get("/health")
            def health():
                return {"status": "ok"}

            @web_app.post("/generate")
            async def generate(request: Request):
                try:
                    body = await request.json()
                    messages = body.get("messages", [])

                    if not messages or "content" not in messages[0]:
                        return {"error": "Message content is required."}

                    input_text = messages[0]["content"]

                    try:
                        if torch.cuda.is_available():
                            print("\U0001f680 Using GPU for inference")
                            device_map = "cuda"
                        else:
                            print("⚠️ GPU not available, falling back to CPU")
                            device_map = "cpu"
                        inputs = self.tokenizer(
                            input_text,
                            return_tensors="pt",
                            padding=True,
                            truncation=True,
                            max_length=512
                        )
                    except Exception as e:
                        print(f"Tokenization error: {str(e)}")
                        return {"error": "Error processing input text"}

                    try:
                        with torch.no_grad():
                            outputs = self.model.generate(
                                inputs["input_ids"].to(device_map),
                                attention_mask=inputs["attention_mask"].to(device_map),
                                max_length=50,
                                pad_token_id=self.tokenizer.pad_token_id,
                                eos_token_id=self.tokenizer.eos_token_id
                            )
                    except Exception as e:
                        print(f"Generation error: {str(e)}")
                        return {"error": "Error generating response"}

                    try:
                        output_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    except Exception as e:
                        print(f"Decoding error: {str(e)}")
                        return {"error": "Error decoding response"}

                    return {"generated_text": output_text}

                except Exception as e:
                    print(f"Unexpected error in generate: {str(e)}")
                    return {"error": "An unexpected error occurred"}

            return web_app

    return app

# Deployment FastAPI app
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

        if not org or not model:
            raise HTTPException(status_code=400, detail="org_name and model_name are required")

        if not check_model_exists(org + "/" + model):
            raise HTTPException(status_code=400, detail="Model does not exist")

        app = create_app(org + "/" + model, revision, "web")
        deployment_name = f"{org}-transformers-chat"
        with modal.enable_output():
            app.deploy(name=deployment_name)

        return {
            "status": "success",
            "message": "Model deployed successfully",
            "deployment_name": deployment_name,
            "model_name": model,
            "model_revision": revision,
            "deployment_url": "https://leeladhar20042004--web.model.run"
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))