import os
import time
import torch
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List
from transformers import AutoTokenizer, AutoModelForCausalLM
import modal

# Modal app definition
app = modal.App("transformers-chat")

# Config
MODEL_NAME = os.environ.get("MODEL_NAME", "gpt2")
MODEL_REVISION = os.environ.get("MODEL_REVISION", "main")

# Shared volume for Hugging Face model cache
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

# Base image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install("transformers", "torch", "fastapi", "uvicorn", "pydantic")
)

@app.cls(
    image=image,
    gpu="A10G:1",
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=900
)
class ModelWorker:
    @modal.enter()
    def load_model(self):
        start = time.time()
        print("🔧 Starting model and tokenizer load...")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, revision=MODEL_REVISION)
        self.model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME, revision=MODEL_REVISION
        ).to(self.device).eval()

        # Ensure the tokenizer has a padding token
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token  # Use eos_token as pad_token

        duration = time.time() - start
        print(f"✅ Model loaded in {duration:.2f} seconds")

    # Replaces @modal.web_server
    @modal.asgi_app()
    def fastapi_app(self):
        web_app = FastAPI()

        @web_app.get("/health")
        def health():
            return {"status": "ok"}

        @web_app.post("/generate")
        async def generate(request: Request):
            body = await request.json()
            # Get the content of the user message
            messages = body.get("messages", [])
            
            if not messages or "content" not in messages[0]:
                return {"error": "Message content is required."}
            
            input_text = messages[0]["content"]

            # Tokenize and generate model output
            inputs = self.tokenizer(input_text, return_tensors="pt", padding=True, truncation=True).to(self.device)

            # Ensure attention mask is set
            inputs["attention_mask"] = inputs.get("attention_mask", torch.ones_like(inputs["input_ids"]))
            inputs["pad_token_id"] = self.tokenizer.pad_token_id

            print(f"Input tensor: {inputs['input_ids']}")  # Debugging: Check input tensor

            with torch.no_grad():
                outputs = self.model.generate(inputs["input_ids"], max_length=50)

            output_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return {"generated_text": output_text}

        return web_app