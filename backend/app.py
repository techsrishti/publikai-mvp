import os
import torch
from fastapi import FastAPI, Request, HTTPException
import modal
import logging
import tempfile
import importlib.util
import sys
import base64
import ast
import inspect
import requests
import inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API URL from environment variable with fallback
API_BASE_URL = os.getenv("API_BASE_URL", "https://1774-203-115-69-190.ngrok-free.app")

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
        "torch>=2.1.0",
        "transformers",
        "fastapi",
        "uvicorn",
        "pydantic",
        "huggingface_hub",
        "optimum",
        "compressed-tensors",
        "accelerate",
        "auto-gptq",
        "bitsandbytes",
        "dotenv"
    )
)

# ✅ Modal App Builder
def create_app(modelName: str, modelRevision: str = "main", Label: str = "web", gpu_type: str = "A10G:1", customScript: str = None) -> modal.App:
    app_name = f"{Label}"
    app = modal.App(app_name)

    @app.cls(
        image=base_image,
        gpu=gpu_type,
        volumes={"/root/.cache/huggingface": hf_cache_vol},
        scaledown_window=900,
        serialized=True
    )
    class ModelWorker:
        model_name: str = modal.parameter(default=modelName)
        model_revision: str = modal.parameter(default=modelRevision)
        label: str = modal.parameter(default=Label)
        custom_script: str = modal.parameter(default=customScript)

        def validate_python_syntax(self, script_content: str) -> bool:
            try:
                ast.parse(script_content)
                return True
            except SyntaxError as e:
                logger.error(f"Syntax error in custom script: {str(e)}")
                raise ValueError(f"Invalid Python syntax in custom script: {str(e)}")

        def load_custom_script(self, script_content: str):
            # Validate Python syntax first
            self.validate_python_syntax(script_content)

            # Create a temporary file to store the script
            with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
                temp_file.write(script_content.encode())
                temp_file_path = temp_file.name

            try:
                # Load the script as a module
                spec = importlib.util.spec_from_file_location("custom_script", temp_file_path)
                custom_module = importlib.util.module_from_spec(spec)
                sys.modules["custom_script"] = custom_module
                spec.loader.exec_module(custom_module)
                
                # Check if required functions exist
                if not hasattr(custom_module, 'load_model'):
                    raise ValueError("Custom script must contain a 'load_model' function")
                if not hasattr(custom_module, 'generate'):
                    raise ValueError("Custom script must contain a 'generate' function")
                
                # Validate function signatures
                load_model_sig = inspect.signature(custom_module.load_model)
                generate_sig = inspect.signature(custom_module.generate)
                
                if len(load_model_sig.parameters) != 2:
                    raise ValueError("load_model function must accept exactly two parameters: model_name and model_revision")
                if len(generate_sig.parameters) != 2:
                    raise ValueError("generate function must accept exactly two parameters: model and input_text")
                
                self.custom_script = custom_module
                return True
            finally:
                # Clean up the temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)

        @modal.enter()
        def load_model(self):
            try:
                model_name = self.model_name
                model_revision = self.model_revision or "main"
                custom_script = self.custom_script
                logger.info(f"🔧 Loading model: {model_name} [{model_revision}]")

                if not model_name:
                    raise ValueError("Model name must be provided")
                
                if not custom_script:
                    raise ValueError("Custom script is required for model loading")

                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                logger.info(f"Using device: {self.device}")

                # Decode base64 script content
                script_content = base64.b64decode(custom_script).decode('utf-8')
                self.load_custom_script(script_content)
                # Use the custom load_model function and store both model and tokenizer
                self.model, self.tokenizer = self.custom_script.load_model(model_name, model_revision)

                logger.info(f"✅ Model loaded successfully")
            except Exception as e:
                logger.error(f"Error in load_model: {e}")
                try:
                    requests.post(
                        f"{API_BASE_URL}/stop-app/{self.label}",
                        json={
                            "error": str(e),
                            "context": {
                                "function": "load_model",
                                "input": f"{model_name} {model_revision} not loaded"
                            }
                        }
                    )
                except Exception as stop_err:
                    logger.error(f"Failed to report error during generate: {stop_err}")
                raise HTTPException(status_code=500, detail=str(e))

        @modal.asgi_app(label=Label)
        def fastapi_app(self):
            web_app = FastAPI()

            @web_app.get("/health")
            def health():
                return {"status": "ok"}

            @web_app.post("/generate")
            async def generate(request: Request):
                try:
                    body = await request.json()
                    if not isinstance(body, dict) or "messages" not in body or not body["messages"]:
                        raise HTTPException(status_code=400, detail="Invalid input format. 'messages' field is required.")

                    input_text = body["messages"][0].get("content", "")
                    if not input_text:
                        raise HTTPException(status_code=400, detail="Message content is required.")

                    # Call generate using self
                    output_text = self.custom_script.generate((self.model, self.tokenizer), input_text)
                    return {"generated_text": output_text}

                except Exception as e:
                    logger.error(f"Error in generate endpoint: {e}")
                    try:
                        requests.post(
                            f"{API_BASE_URL}/stop-app/{self.label}",
                            json={
                                "error": str(e),
                                "context": {
                                    "function": "generate",
                                    "input": body
                                }
                            }
                        )
                    except Exception as stop_err:
                        logger.error(f"Failed to report error during generate: {stop_err}")
                    raise HTTPException(status_code=500, detail=str(e))

            return web_app

    return app
