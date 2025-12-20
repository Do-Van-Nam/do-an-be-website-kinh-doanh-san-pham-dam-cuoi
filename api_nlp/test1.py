import spacy
from spacy.language import Language
from underthesea import pos_tag
from spacy.matcher import Matcher

# 1. Khởi tạo pipeline trống cho tiếng Việt
nlp = spacy.blank("vi")

# 2. Tạo một component tùy chỉnh để gán nhãn POS bằng underthesea
@Language.component("vietnamese_pos_tagger")
def vietnamese_pos_tagger(doc):
    # Lấy văn bản thô từ doc
    text = doc.text
    # Sử dụng underthesea để gán nhãn từ loại
    tags = pos_tag(text)
    
    # Gán nhãn POS vào từng token trong spaCy
    # Lưu ý: Cần xử lý khớp token giữa 2 thư viện
    for i, token in enumerate(doc):
        if i < len(tags):
            # tags[i][1] là nhãn POS (VD: 'N', 'V', 'CH',...)
            # Map nhãn của underthesea sang chuẩn của spaCy (đơn giản hóa)
            raw_tag = tags[i][1]
            if raw_tag.startswith('N'):
                token.pos_ = "NOUN"
            elif raw_tag.startswith('V'):
                token.pos_ = "VERB"
            else:
                token.pos_ = "PROPN" # Hoặc các loại khác tùy nhu cầu
    return doc

# 3. Thêm component vào pipeline
nlp.add_pipe("vietnamese_pos_tagger", last=True)

def parse_prompt_nlp(prompt):
    doc = nlp(prompt)

    budget = None
    style = []
    items = []
    guests = None

    matcher = Matcher(nlp.vocab)

    # Pattern cho budget (giữ nguyên)
    budget_pattern = [{"LIKE_NUM": True}, {"LOWER": {"IN": ["triệu", "tr", "milion", "vnd"]}}]
    matcher.add("BUDGET", [budget_pattern])

    # Pattern cho style (Sửa lại POS khớp với NOUN đã gán ở trên)
    style_pattern = [{"LOWER": {"IN": ["phong cách", "style", "theme"]}}, {"POS": "NOUN", "OP": "+"}]
    matcher.add("STYLE", [style_pattern])

    # Pattern cho items
    items_pattern = [{"LOWER": {"IN": ["có", "bao gồm", "cần"]}}, {"POS": "NOUN", "OP": "+"}, {"LOWER": ",", "OP": "*"}]
    matcher.add("ITEMS", [items_pattern])

    # Pattern cho Guests
    guests_pattern = [{"LIKE_NUM": True}, {"LOWER": {"IN": ["khách", "người"]}}]
    matcher.add("GUESTS", [guests_pattern])

    matches = matcher(doc)
    for match_id, start, end in matches:
        label = nlp.vocab.strings[match_id]
        span = doc[start:end]
        
        if label == "BUDGET":
            # Xử lý số
            num_text = span[0].text.replace(',', '.')
            try:
                val = float(num_text)
                budget = int(val * 1000000) if "triệu" in span.text or "tr" in span.text else int(val)
            except: pass
        elif label == "STYLE":
            style.extend([t.text for t in span[1:] if t.pos_ == "NOUN"])
        elif label == "ITEMS":
            items.extend([t.text for t in span[1:] if t.pos_ == "NOUN" and t.text != ","])
        elif label == "GUESTS":
            try:
                guests = int(span[0].text)
            except: pass

    return {'budget': budget, 'style': style, 'items': items, 'guests': guests}

# Test
result = parse_prompt_nlp("giúp tôi xây dựng kế hoạch đám cưới với 100 triệu với phong cách cổ điển, có dj, hoa,...")
print(result)