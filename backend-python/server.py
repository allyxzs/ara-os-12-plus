"""
ARA OS 12+ v3 — Servidor PyTorch Hugging Face Transformers (Streaming SSE)
Uso no Kali Linux / Ubuntu / Windows:
    cd backend-python
    pip install -r requirements.txt
    python3 server.py
"""

import json
import threading
from typing import List

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

app = FastAPI(title="Ara OS 12+ PyTorch Transformers Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache = {"model_id": None, "tokenizer": None, "model": None}


class Message(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    model: str = "Qwen/Qwen2.5-1.5B-Instruct"
    messages: List[Message]
    temperature: float = 0.65
    top_p: float = 0.9
    max_new_tokens: int = 1024
    repetition_penalty: float = 1.12


def get_model(model_id: str):
    if _cache["model_id"] == model_id and _cache["model"] is not None:
        return _cache["tokenizer"], _cache["model"]

    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    dtype = torch.float16 if device != "cpu" else torch.float32

    print(f"[Ara OS PyTorch Transformers] Carregando {model_id} em {device} ({dtype})...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=dtype,
        device_map="auto" if device == "cuda" else None,
    )
    if device != "cuda":
        model = model.to(device)

    _cache["model_id"] = model_id
    _cache["tokenizer"] = tokenizer
    _cache["model"] = model
    print(f"[Ara OS PyTorch Transformers] Modelo {model_id} pronto!")
    return tokenizer, model


@app.get("/health")
def health():
    return {
        "status": "online",
        "loaded_model": _cache["model_id"],
        "cuda": torch.cuda.is_available(),
    }


@app.post("/v1/chat/stream")
def chat_stream(req: ChatStreamRequest):
    tokenizer, model = get_model(req.model)
    formatted = [{"role": m.role, "content": m.content} for m in req.messages]

    prompt_text = tokenizer.apply_chat_template(
        formatted,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer([prompt_text], return_tensors="pt").to(model.device)
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

    gen_kwargs = dict(
        **inputs,
        streamer=streamer,
        max_new_tokens=req.max_new_tokens,
        do_sample=req.temperature > 0.05,
        temperature=max(0.05, req.temperature),
        top_p=req.top_p,
        repetition_penalty=req.repetition_penalty,
    )

    thread = threading.Thread(target=model.generate, kwargs=gen_kwargs)
    thread.start()

    def event_gen():
        for chunk in streamer:
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
