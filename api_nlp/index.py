from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import spacy
from spacy.language import Language
from underthesea import pos_tag
from spacy.matcher import Matcher
import uvicorn

app = FastAPI(title="Wedding Planner NLP Service")

# 1. Khởi tạo pipeline spaCy tiếng Việt
# Đảm bảo đã cài pyvi để không bị lỗi khởi tạo blank("vi")
nlp = spacy.blank("vi")

# 2. Custom component gán nhãn POS bằng underthesea
@Language.component("vietnamese_pos_tagger")
def vietnamese_pos_tagger(doc):
    tags = pos_tag(doc.text)
    for i, token in enumerate(doc):
        if i < len(tags):
            raw_tag = tags[i][1]
            if raw_tag.startswith('N'):
                token.pos_ = "NOUN"
            elif raw_tag.startswith('V'):
                token.pos_ = "VERB"
            else:
                token.pos_ = "PROPN"
    return doc

nlp.add_pipe("vietnamese_pos_tagger", last=True)

# Schema cho request từ ExpressJS
class PromptRequest(BaseModel):
    prompt: str

def process_nlp(prompt: str):
    doc = nlp(prompt)
    budget = None
    style = []
    items = []
    guests = None

    matcher = Matcher(nlp.vocab)

    # Patterns
    matcher.add("BUDGET", [[{"LIKE_NUM": True}, {"LOWER": {"IN": ["triệu", "tr", "milion", "vnd"]}}]])
    matcher.add("STYLE", [[{"LOWER": {"IN": ["phong cách", "style", "theme"]}}, {"POS": "NOUN", "OP": "+"}]])
    matcher.add("ITEMS", [[{"LOWER": {"IN": ["có", "bao gồm", "cần"]}}, {"POS": "NOUN", "OP": "+"}, {"LOWER": ",", "OP": "*"}]])
    matcher.add("GUESTS", [[{"LIKE_NUM": True}, {"LOWER": {"IN": ["khách", "người"]}}]])

    matches = matcher(doc)
    for match_id, start, end in matches:
        label = nlp.vocab.strings[match_id]
        span = doc[start:end]
        
        if label == "BUDGET":
            num_text = span[0].text.replace(',', '.')
            try:
                val = float(num_text)
                budget = int(val * 1000000) if any(x in span.text.lower() for x in ["triệu", "tr"]) else int(val)
            except: pass
        elif label == "STYLE":
            style.extend([t.text for t in span[1:] if t.pos_ == "NOUN"])
        elif label == "ITEMS":
            items.extend([t.text for t in span[1:] if t.pos_ == "NOUN" and t.text != ","])
        elif label == "GUESTS":
            try:
                guests = int(span[0].text)
            except: pass

    return {
        "budget": budget,
        "style": list(set(style)), # Xóa trùng lặp
        "items": list(set(items)),
        "guests": guests
    }

@app.post("/parse")
async def parse_endpoint(req: PromptRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    return process_nlp(req.prompt)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)