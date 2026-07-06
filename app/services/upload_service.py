import threading
import traceback

from app.services.status_service import save_status


def process_video(
    source: str,
    video_id: str,
    owner_id,
    owner_email
):
    try:
        from pipeline import run_pipeline

        print(f"Starting pipeline for {video_id}")

        save_status(video_id, "processing")

        run_pipeline(
            source,
            video_id,
            owner_id, owner_email
        )

        save_status(video_id, "completed")

    except Exception as e:
        print("=" * 60)
        print("PIPELINE ERROR:")
        traceback.print_exc()
        print("=" * 60)

        save_status(
            video_id,
            "failed",
            str(e)
        )


def start_processing(
    source: str,
    video_id: str,
    owner_id,
    owner_email
):
    thread = threading.Thread(
        target=process_video,
        args=(
            source,
            video_id,
            owner_id,
    owner_email
        ),
        daemon=True,
    )

    thread.start()