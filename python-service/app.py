from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal

app = FastAPI(
    title='Python AI Service',
    description='Smart reply, spam/toxicity detection, and simple chatbot replies for Node.js chat backend.',
    version='1.0.0',
)

TOXIC_KEYWORDS = [
    'stupid',
    'idiot',
    'hate',
    'dumb',
    'kill',
    'shut up',
]

SPAM_KEYWORDS = [
    'buy now',
    'free money',
    'click here',
    'visit',
    'earn cash',
]

SMART_REPLY_MAP = {
    'hello': 'Hello! How can I help you today?',
    'hi': 'Hi there! Want a quick reply suggestion?',
    'how are you': 'I am fine, thanks! How can I support your chat flow?',
    'bye': 'Goodbye! Talk again soon 😊',
}

class MessageRequest(BaseModel):
    message: str

class MessageAnalysis(BaseModel):
    toxic: bool
    spam: bool
    reason: str

class ReplyResponse(BaseModel):
    reply: str
    suggestion: str
    toxic: bool
    spam: bool
    reason: str


def normalize_text(message: str) -> str:
    return message.strip().lower()


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'python-ai-service'}


@app.post('/ai/detect', response_model=MessageAnalysis)
def detect_toxicity(payload: MessageRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail='message is required')

    text = normalize_text(payload.message)
    toxic_matches = [word for word in TOXIC_KEYWORDS if word in text]
    spam_matches = [word for word in SPAM_KEYWORDS if word in text]

    toxic = bool(toxic_matches)
    spam = bool(spam_matches)
    reason_parts = []
    if toxic:
        reason_parts.append('toxic language detected')
    if spam:
        reason_parts.append('spam pattern detected')

    return {
        'toxic': toxic,
        'spam': spam,
        'reason': ' and '.join(reason_parts) or 'message looks safe',
    }


@app.post('/ai/suggest', response_model=ReplyResponse)
def smart_reply(payload: MessageRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail='message is required')

    text = normalize_text(payload.message)
    suggestion = SMART_REPLY_MAP.get(text)
    if not suggestion:
        suggestion = 'Try something like: "I am looking for help with chat features."'

    analysis = detect_toxicity(payload)
    return {
        'reply': suggestion,
        'suggestion': suggestion,
        'toxic': analysis['toxic'],
        'spam': analysis['spam'],
        'reason': analysis['reason'],
    }


@app.post('/ai/reply', response_model=ReplyResponse)
def chatbot_reply(payload: MessageRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail='message is required')

    text = normalize_text(payload.message)
    if 'hello' in text or 'hi' in text:
        reply = 'Hello User 😊 I am your chat assistant.'
    elif 'how are you' in text:
        reply = 'I am a Python AI service ready to help.'
    elif 'bye' in text or 'goodbye' in text:
        reply = 'Goodbye! Come back anytime.'
    else:
        reply = f'I heard: "{payload.message}". Here is a friendly response.'

    analysis = detect_toxicity(payload)
    return {
        'reply': reply,
        'suggestion': reply,
        'toxic': analysis['toxic'],
        'spam': analysis['spam'],
        'reason': analysis['reason'],
    }
