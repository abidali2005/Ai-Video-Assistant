import json
from pathlib import Path

STATUS_DIR = Path("data/status")
STATUS_DIR.mkdir(parents=True, exist_ok=True)


def save_status(video_id: str, status: str, error: str = None):

    file = STATUS_DIR / f"{video_id}.json"

    data = {
        "video_id": video_id,
        "status": status,
        "error": error,
    }

    with open(file, "w") as f:
        json.dump(data, f, indent=4)


def get_status(video_id: str):

    file = STATUS_DIR / f"{video_id}.json"

    if not file.exists():
        return None

    with open(file) as f:
        return json.load(f)