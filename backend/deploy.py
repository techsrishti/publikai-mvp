from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import modal
import os
import logging
import requests
import json
from huggingface_hub import HfApi
from huggingface_hub.utils import RepositoryNotFoundError
from app import create_app, get_gpu_type
import dotenv


dotenv.load_dotenv()
model_token_id = os.getenv("MODAL_TOKEN_ID")
model_token_secret = os.getenv("MODAL_TOKEN_SECRET")
account_name = os.getenv("MODAL_ACCOUNT_NAME")
client = modal.Client.from_credentials(model_token_id, model_token_secret)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
deploy_app = FastAPI()

class DeploymentRequest(BaseModel):
    org_name: str
    model_name: str
    model_revision: str = "main"
    custom_script: str  # Base64 encoded script content

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

@deploy_app.post("/deploy")
async def deploy_model(request: Request):
    try:
        body = await request.json()
        print(body)
        org = body.get("org_name")
        model = body.get("model_name")
        revision = body.get("model_revision", "main")
        label = body.get("model_unique_name", "web")
        param_count = body.get("param_count")
        custom_script = body.get("custom_script")  # Get base64 encoded script

        if not org or not model:
            raise HTTPException(status_code=400, detail="org_name and model_name are required")
        
        if not custom_script:
            raise HTTPException(status_code=400, detail="custom_script is required")

        gpu_type = get_gpu_type(param_count) + ":1"
        model_id = f"{org}/{model}"
        deployment_name = f"{label}"

        app = create_app(model_id, revision, label, gpu_type, custom_script)

        with modal.enable_output():
            app.deploy(name=deployment_name, client=client)

        deployment_url = f"https://{os.getenv('MODAL_ACCOUNT_NAME')}--{label}.modal.run"

        response = requests.get(f"{deployment_url}/health")
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Health check failed")

        return {
            "status": "success",
            "message": "Model deployed successfully",
            "deployment_name": deployment_name,
            "model_name": model,
            "model_revision": revision,
            "gpu_type": gpu_type,
            "deployment_url": f"https://{os.getenv('MODAL_ACCOUNT_NAME')}--{label}.modal.run/generate"
        }

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Deployment failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
