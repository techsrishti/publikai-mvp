from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

def load_model(model_name: str, model_revision: str):
    """
    Load the sequence-to-sequence model and tokenizer from Hugging Face.
    
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
    model = AutoModelForSeq2SeqLM.from_pretrained(
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
    Generate text using the loaded sequence-to-sequence model.
    
    Args:
        model (tuple): The loaded model and tokenizer
        input_text (str): The input text to generate from
    
    Returns:
        str: The generated text
    """
    model, tokenizer = model  # Unpack the model and tokenizer
    
    # Tokenize input
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,  # T5/BART typically have shorter max lengths
        add_special_tokens=True
    )
    
    # Move inputs to GPU if available
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}
    
    # Generate output
    with torch.no_grad(), torch.amp.autocast('cuda'):
        outputs = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=128,  # Shorter max length for seq2seq
            min_length=1,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            top_k=50,
            repetition_penalty=1.2,
            no_repeat_ngram_size=3,
            early_stopping=True
        )
    
    # Decode and return the generated text
    output_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return f"Input: {input_text}\nOutput: {output_text}" 