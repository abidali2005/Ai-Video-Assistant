import whisper
import os

WHISPER_MODEL = os.getenv("WHISPER_MODEL" , "tiny")
model = None

def load_model():
    global model
    if model is None:
        print(f"Loading Whisper model {WHISPER_MODEL}")
        model = whisper.load_model(WHISPER_MODEL)
        print("Model Loaded Successfully")
    return model

def transcribe_chunk(chunk_path : str )->str:
    model = load_model()
    result = model.transcribe(chunk_path)

    return result["text"]

def transcribe_all(chunks : list)->str:
    final_string = ""
    for i , chunk in enumerate(chunks):
        print(f"Transcribing chunk {i + 1}/{len(chunks)}...")
        text = transcribe_chunk(chunk)
        final_string += text + " "
    print('Transcribtion Complete')
    return final_string.strip()
