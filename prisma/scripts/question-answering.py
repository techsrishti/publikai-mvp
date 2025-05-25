from transformers import AutoModelForQuestionAnswering, AutoTokenizer
import torch

def load_model(model_name: str, model_revision: str):
    """
    Load the question answering model and tokenizer from Hugging Face.
    
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
    model = AutoModelForQuestionAnswering.from_pretrained(
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
    Answer questions based on the input text.
    The input text should be in the format: "question: [question] context: [context]"
    
    Args:
        model (tuple): The loaded model and tokenizer
        input_text (str): The input text containing question and context
    
    Returns:
        str: The answer to the question
    """
    model, tokenizer = model  # Unpack the model and tokenizer
    
    # Parse input text
    try:
        question, context = input_text.split("context:", 1)
        question = question.replace("question:", "").strip()
        context = context.strip()
    except ValueError:
        return "Error: Input must be in format 'question: [question] context: [context]'"
    
    # Tokenize input
    inputs = tokenizer(
        question,
        context,
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
        start_logits = outputs.start_logits
        end_logits = outputs.end_logits
    
    # Get the most likely start and end positions
    start_idx = torch.argmax(start_logits)
    end_idx = torch.argmax(end_logits)
    
    # Get the answer span
    answer_start = inputs["offset_mapping"][0][start_idx][0].item()
    answer_end = inputs["offset_mapping"][0][end_idx][1].item()
    
    # Extract the answer
    answer = context[answer_start:answer_end]
    
    # Get confidence scores
    start_score = torch.nn.functional.softmax(start_logits, dim=-1)[0][start_idx].item()
    end_score = torch.nn.functional.softmax(end_logits, dim=-1)[0][end_idx].item()
    confidence = (start_score + end_score) / 2
    
    return f"Question: {question}\nContext: {context}\nAnswer: {answer}\nConfidence: {confidence:.2%}" 