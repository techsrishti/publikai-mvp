from transformers import AutoModelForMaskedLM, AutoTokenizer
import torch

def load_model(model_name: str, model_revision: str):
    """
    Load the masked language model and tokenizer from Hugging Face.
    
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
    model = AutoModelForMaskedLM.from_pretrained(
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
    Generate predictions for masked tokens in the input text.
    
    Args:
        model (tuple): The loaded model and tokenizer
        input_text (str): The input text with [MASK] tokens
    
    Returns:
        str: The text with predictions for masked tokens
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
        predictions = outputs.logits
    
    # Get the top 5 predictions for each masked token
    mask_token_indices = torch.where(inputs["input_ids"] == tokenizer.mask_token_id)[1]
    top_5_predictions = []
    
    for mask_idx in mask_token_indices:
        mask_logits = predictions[0, mask_idx]
        top_5_tokens = torch.topk(mask_logits, 5)
        top_5_predictions.append([
            (tokenizer.decode([token_id]), score.item())
            for token_id, score in zip(top_5_tokens.indices, top_5_tokens.values)
        ])
    
    # Replace [MASK] tokens with predictions
    result_text = input_text
    for i, predictions in enumerate(top_5_predictions):
        # Replace the first [MASK] with the top prediction
        result_text = result_text.replace("[MASK]", predictions[0][0], 1)
        
        # Add alternative predictions as a comment
        alternatives = ", ".join([f"{pred[0]} ({pred[1]:.2f})" for pred in predictions[1:]])
        result_text += f" [Alternatives: {alternatives}]"
    
    return result_text 