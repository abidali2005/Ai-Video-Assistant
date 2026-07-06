from dotenv import load_dotenv
from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarize import summarize, get_title
from core.extractor import extract_actions, extract_decisions, extract_questions
from app.services.metadata_services import save_metadata
from app.services.status_service import save_status
import uuid
from core.rag_engine import build_rage_pipeline

load_dotenv()

def run_pipeline(source: str, video_id: str , owner_id,
    owner_email) -> dict:
    print("Starting AI Video Assistant")

    save_status(video_id, "downloading")
    chunks = process_input(source)

    save_status(video_id, "transcribing")
    transcript = transcribe_all(chunks)
    print(f"Raw transcription (first 300 chars): {transcript[:300]}")

    save_status(video_id, "summarizing")
    title = get_title(transcript)
    summary = summarize(transcript)

    save_status(video_id, "extracting")
    action_item = extract_actions(transcript)
    decisions = extract_decisions(transcript)
    questions = extract_questions(transcript)

    save_status(video_id, "building_rag")
    build_rage_pipeline(
        transcript,
        video_id
    )

    result = {
        "video_id": video_id,
        "owner_id": owner_id,
        "owner_email": owner_email,
        "title": title,
        "transcript": transcript,
        "summary": summary,
        "action_items": action_item,
        "key_decisions": decisions,
        "open_questions": questions,
    }

    save_status(video_id, "saving")
    save_metadata(result)

    save_status(video_id, "completed")

    return result


if __name__ == "__main__":
    # CLI entry point
    source = input("Enter YouTube URL or local file path: ").strip()
    result = run_pipeline(source)

    print("\n" + "=" * 60)
    print(f"📌 Title: {result['title']}")
    print(f"\n📋 Summary:\n{result['summary']}")
    print(f"\n✅ Action Items:\n{result['action_items']}")
    print(f"\n🔑 Key Decisions:\n{result['key_decisions']}")
    print(f"\n❓ Open Questions:\n{result['open_questions']}")
    print("=" * 60)

