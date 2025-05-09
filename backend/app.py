import sys
import os
from dotenv import load_dotenv
import modal
import fastapi
from pydantic import BaseModel

fastapp = fastapi.FastAPI()

class RequestBody(BaseModel):
    text: str

# Load environment variables from .env file
load_dotenv()

client = modal.Client.from_credentials(os.getenv("MODAL_TOKEN_ID"), os.getenv("MODAL_TOKEN_SECRET"))

app = modal.App("hf-sentiment-fastapi")
image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")

@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def classify(request: RequestBody):
    print(request)
    if not hasattr(classify, "model"):
        from transformers import pipeline
        classify.model = pipeline("sentiment-analysis")
    result = classify.model(request.text)
    return result

@fastapp.post("/deploy")
def deploy():
    with modal.enable_output():
        app.deploy(client=client)
