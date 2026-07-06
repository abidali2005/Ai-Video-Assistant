import json
from pathlib import Path

CHAT_DIR = Path("data/chats")
CHAT_DIR.mkdir(parents=True, exist_ok=True)


def save_message(video_id: str, sender: str, text: str):

    file = CHAT_DIR / f"{video_id}.json"

    messages = []

    if file.exists():
        with open(file, encoding="utf-8") as f:
            messages = json.load(f)

    messages.append({
        "sender": sender,
        "text": text
    })

    with open(file, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=4)


def get_chat(video_id: str):

    file = CHAT_DIR / f"{video_id}.json"

    if not file.exists():
        return []

    with open(file, encoding="utf-8") as f:
        return json.load(f)


def clear_chat(video_id: str):

    file = CHAT_DIR / f"{video_id}.json"

    if file.exists():
        file.unlink()