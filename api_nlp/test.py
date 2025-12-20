import spacy

# nlp = spacy.load("vi_core_news_lg")  # Model tiếng Việt
nlp = spacy.load("xx_sent_ud_sm")  # Model tiếng Việt

def parse_prompt_nlp(prompt):
    doc = nlp(prompt)

    budget = None
    style = []
    items = []
    guests = None

    # Rule-based matching cho entity
    from spacy.matcher import Matcher
    matcher = Matcher(nlp.vocab)

    # Pattern cho budget
    budget_pattern = [{"LIKE_NUM": True}, {"LOWER": {"IN": ["triệu", "tr", "milion", "vnd"]}}]
    matcher.add("BUDGET", [budget_pattern])

    # Pattern cho style
    style_pattern = [{"LOWER": {"IN": ["phong cách", "style", "theme"]}}, {"POS": "NOUN", "OP": "+"}]
    matcher.add("STYLE", [style_pattern])

    # Pattern cho items
    items_pattern = [{"LOWER": {"IN": ["có", "bao gồm", "cần"]}}, {"POS": "NOUN", "OP": "+"}, {"LOWER": ",", "OP": "*"}]
    matcher.add("ITEMS", [items_pattern])

    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        if nlp.vocab.strings[match_id] == "BUDGET":
            budget = int(span[0].text) * 1000000 if "triệu" in span.text else int(span[0].text)
        elif nlp.vocab.strings[match_id] == "STYLE":
            style.extend([t.text for t in span[1:] if t.pos_ == "NOUN"])
        elif nlp.vocab.strings[match_id] == "ITEMS":
            items.extend([t.text for t in span[1:] if t.pos_ == "NOUN" and t.text != ","])

    # Guests tương tự
    guests_pattern = [{"LIKE_NUM": True}, {"LOWER": {"IN": ["khách", "người"]}}]
    matcher.add("GUESTS", [guests_pattern])
    # ... (thêm match)

    return {'budget': budget, 'style': style, 'items': items, 'guests': guests}

# Test
result = parse_prompt_nlp("giúp tôi xây dựng kế hoạch đám cưới với 100 triệu với phong cách cổ điển, có dj, hoa,...")
print(result)