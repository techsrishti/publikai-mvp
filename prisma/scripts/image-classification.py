from transformers import AutoModelForImageClassification, AutoImageProcessor
import torch
from PIL import Image
import io
import base64

def load_model(model_name: str, model_revision: str):
    """
    Load the image classification model and processor from Hugging Face.
    
    Args:
        model_name (str): The name of the model on Hugging Face
        model_revision (str): The revision/branch of the model
    
    Returns:
        tuple: (model, processor)
    """
    # Load processor
    processor = AutoImageProcessor.from_pretrained(
        model_name,
        revision=model_revision,
        trust_remote_code=True
    )
    
    # Load model
    model = AutoModelForImageClassification.from_pretrained(
        model_name,
        revision=model_revision,
        device_map="auto",
        torch_dtype=torch.float16,
        trust_remote_code=True,
        low_cpu_mem_usage=True
    ).eval()
    
    # Move model to GPU if available
    if torch.cuda.is_available():
        model = model.to("cuda")
    
    return model, processor

def generate(model, input_text: str) -> str:
    """
    Classify an image from base64 encoded string.
    
    Args:
        model (tuple): The loaded model and processor
        input_text (str): Base64 encoded image string
    
    Returns:
        str: The classification results
    """
    model, processor = model  # Unpack the model and processor
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(input_text)
        image = Image.open(io.BytesIO(image_data))
        
        # Process image
        inputs = processor(
            images=image,
            return_tensors="pt",
            do_resize=True,
            size={"height": 224, "width": 224}
        )
        
        # Move inputs to GPU if available
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad(), torch.amp.autocast('cuda'):
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        # Get top 5 predictions
        top_5_prob, top_5_indices = torch.topk(probabilities[0], 5)
        
        # Format results
        results = []
        for prob, idx in zip(top_5_prob, top_5_indices):
            label = model.config.id2label[idx.item()]
            results.append(f"{label}: {prob.item():.2%}")
        
        return "Image Classification Results:\n" + "\n".join(results)
        
    except Exception as e:
        return f"Error processing image: {str(e)}" 