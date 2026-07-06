import { useEffect } from "react";
import { getStatus } from "../api/api";

const usePolling = (videoId, setStatus, onCompleted) => {
  useEffect(() => {
    if (!videoId) return;

    const interval = setInterval(async () => {
      try {
        const response = await getStatus(videoId);

        // Update progress on every poll
        setStatus(response.status);

        if (response.status === "completed") {
          clearInterval(interval);
          onCompleted();
        }

        if (response.status === "failed") {
          clearInterval(interval);
          alert("Video processing failed.");
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [videoId]);
};

export default usePolling;