import { useEffect, useState, useRef } from "react";
import { getVideos, uploadVideo } from "../api/api";
import { useNavigate } from "react-router-dom";
import usePolling from "../hooks/usePolling";
import Progress from "../components/Progress";
import { deleteVideo } from "../api/api";
import { uploadLocalFile } from "../api/api";
import { useTheme } from "../context/ThemeContext";

const VideoCard = ({ video, onOpen, onDelete, index }) => {
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(video.video_id);
  };

  const initials = video.title
    ? video.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "VD";

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
      className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-200 ${deleting ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
            {video.title || "Untitled video"}
          </h3>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
            {video.video_id}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onOpen(video.video_id)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-95 text-white rounded-xl py-2 px-3 transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
          </svg>
          Open
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-100 dark:border-red-900/60 hover:border-red-200 dark:hover:border-red-800 rounded-xl py-2 px-3 transition-all duration-150 active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
  </svg>
);

const Home = () => {
  const [source, setSource] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [file, setFile] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  usePolling(processingId, setStatus, () => {
    fetchVideos();
    setProcessingId(null);
    setStatus("");
  });

  const handleUpload = async () => {
    try {
      setLoading(true);
      let response;
      if (file) {
        response = await uploadLocalFile(file);
      } else {
        response = await uploadVideo(source);
      }
      setProcessingId(response.video_id);
      setSource("");
      setFile(null);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Upload failed. Try a smaller file or check your connection.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video?");
    if (!confirmDelete) return;
    try {
      await deleteVideo(videoId);
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const canUpload = (source.trim() || file) && !loading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Top bar */}
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 transition-colors duration-200">        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">AI Video Assistant</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="relative w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-150 active:scale-95"
            >
              <svg
                className={`w-4 h-4 absolute transition-all duration-300 ${theme === "dark" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg
                className={`w-4 h-4 absolute transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900 rounded-xl py-2 px-3 transition-all duration-150 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 pt-28">
        {/* Hero */}
        <div className="mb-10"
          style={{ animation: "fadeSlideIn 0.45s ease both" }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Ask anything about your videos
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
            Upload a video or paste a YouTube URL — transcription and AI search happen automatically.
          </p>
        </div>

        {/* Upload card */}
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-10 transition-colors duration-200"
          style={{ animation: "fadeSlideIn 0.5s 0.08s ease both" }}
        >
          {/* URL input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Paste a YouTube URL…"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                if (e.target.value) setFile(null);
              }}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs text-gray-300 dark:text-gray-600 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 py-7 px-4 text-center
              ${dragOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"}
              ${file ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/30" : ""}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${file || dragOver ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"}`}>
              {file ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <UploadIcon />
              )}
            </div>
            {file ? (
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">{file.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drop a video or audio file here</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">or click to browse</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setSource("");
              }}
            />
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${canUpload
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 active:scale-[0.98] text-white shadow-sm shadow-indigo-200 dark:shadow-none"
                : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"}`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M12 2a10 10 0 0110 10" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <UploadIcon />
                Upload video
              </>
            )}
          </button>

          {processingId && (
            <div className="mt-4">
              <Progress status={status} />
            </div>
          )}
        </div>

        {/* Library section */}
        <div style={{ animation: "fadeSlideIn 0.5s 0.16s ease both" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Your videos</h2>
            {videos.length > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full px-2.5 py-0.5 font-medium">
                {videos.length}
              </span>
            )}
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No videos yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload your first video to get started</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {videos.map((video, i) => (
                <VideoCard
                  key={video.video_id}
                  video={video}
                  index={i}
                  onOpen={(id) => navigate(`/video/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;