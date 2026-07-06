import json
from pathlib import Path

DATA_DIR = Path("data/metadata")
DATA_DIR.mkdir(parents=True, exist_ok=True)


def save_metadata(video_data: dict):

    file = DATA_DIR / f"{video_data['video_id']}.json"

    with open(file, "w", encoding="utf-8") as f:
        json.dump(video_data, f, indent=4)


def get_metadata(video_id: str):

    print(f"Requested video_id: '{video_id}'")

    file = DATA_DIR / f"{video_id}.json"

    print(f"Looking for file: {file}")

    print(f"Exists: {file.exists()}")

    if not file.exists():
        return None

    with open(file, encoding="utf-8") as f:
        return json.load(f)


def list_metadata():

    videos = []

    for file in DATA_DIR.glob("*.json"):
        print("Found:", file.name)

        with open(file, encoding="utf-8") as f:
            videos.append(json.load(f))

    return videos


def delete_metadata(video_id: str):

    file = DATA_DIR / f"{video_id}.json"

    if file.exists():
        file.unlink()


