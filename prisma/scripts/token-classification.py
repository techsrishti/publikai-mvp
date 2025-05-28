from transformers import AutoModelForTokenClassification, AutoTokenizer
import torch

def load_model(model_name: str, model_revision: str):
    """
    Load the token classification model and tokenizer from Hugging Face.
    
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
    model = AutoModelForTokenClassification.from_pretrained(
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
    Perform token classification on the input text.
    
    Args:
        model (tuple): The loaded model and tokenizer
        input_text (str): The input text to classify tokens for
    
    Returns:
        str: The token classification results
    """
    model, tokenizer = model  # Unpack the model and tokenizer
    
    # Tokenize input
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,
        add_special_tokens=True,
        return_offsets_mapping=True
    )
    
    # Move inputs to GPU if available
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}
    
    # Get predictions
    with torch.no_grad(), torch.amp.autocast('cuda'):
        outputs = model(**inputs)
        logits = outputs.logits
        predictions = torch.argmax(logits, dim=-1)
    
    # Get offset mappings for aligning predictions with original text
    offset_mapping = inputs["offset_mapping"][0]
    
    # Process predictions
    results = []
    current_entity = None
    current_text = ""
    
    for idx, (pred, (start, end)) in enumerate(zip(predictions[0], offset_mapping)):
        if start == 0 and end == 0:  # Skip special tokens
            continue
            
        label = model.config.id2label[pred.item()]
        token_text = input_text[start:end]
        
        if label.startswith("B-"):  # Beginning of entity
            if current_entity:
                results.append(f"{current_entity}: {current_text.strip()}")
            current_entity = label[2:]
            current_text = token_text
        elif label.startswith("I-"):  # Inside entity
            if current_entity and current_entity == label[2:]:
                current_text += " " + token_text
        else:  # O (Outside) or other
            if current_entity:
                results.append(f"{current_entity}: {current_text.strip()}")
                current_entity = None
                current_text = ""
    
    # Add the last entity if exists
    if current_entity:
        results.append(f"{current_entity}: {current_text.strip()}")
    
    return f"Input: {input_text}\nEntities:\n" + "\n".join(results) 