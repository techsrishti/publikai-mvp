from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

def load_model(model_name: str, model_revision: str):
    """
    Load the text classification model and tokenizer from Hugging Face.
    
    Args:
        model_name (str): The name of the model on Hugging Face
        model_revision (str): The revision/branch of the model
    
    Returns:
        tuple: (model, tokenizer)
    """
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        revision=model_revision,
        use_fast=True,
        trust_remote_code=True
    )
    
    # Load model
    model = AutoModelForSequenceClassification.from_pretrained(
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
    
    return model, tokenizer

def generate(model, input_text: str) -> str:
    """
    Classify the input text using the loaded model.
    
    Args:
        model (tuple): The loaded model and tokenizer
        input_text (str): The input text to classify
    
    Returns:
        str: The classification results with confidence scores
    """
    model, tokenizer = model  # Unpack the model and tokenizer
    
    # Tokenize input
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,
        add_special_tokens=True
    )
    
    # Move inputs to GPU if available
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}
    
    # Get predictions
    with torch.no_grad(), torch.amp.autocast('cuda'):
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
    
    # Get top 3 predictions
    top_3_prob, top_3_indices = torch.topk(probabilities[0], 3)
    
    # Format results
    results = []
    for prob, idx in zip(top_3_prob, top_3_indices):
        label = model.config.id2label[idx.item()]
        results.append(f"{label}: {prob.item():.2%}")
    
    return f"Input: {input_text}\nPredictions:\n" + "\n".join(results) 