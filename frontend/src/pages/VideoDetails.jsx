import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getVideo } from "../api/api";
import ChatBox from "../components/ChatBot";
import CopyButton from "../components/CopyButton";
import Highlighter from "react-highlight-words";

const BrandHeader = ({ navigate, scrolled }) => (
  <header
    className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20 transition-shadow duration-300 ${
      scrolled ? "shadow-sm border-b border-gray-100 dark:border-gray-800" : "border-b border-transparent"
    }`}
  >
    <div className="max-w-4xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">AI Video Assistant</span>
      </div>
      {navigate && (
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 transition-all duration-150 active:scale-95"
        >
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Library
        </button>
      )}
    </div>
  </header>
);

const SectionCard = ({ icon, title, action, children, defaultOpen = true, delay = 0 }) => {
  const [open, setOpen] = useState(defaultOpen);
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(defaultOpen ? "none" : "0px");

  useEffect(() => {
    if (!innerRef.current) return;
    if (open) {
      const h = innerRef.current.scrollHeight;
      setMaxHeight(h + "px");
      const t = setTimeout(() => setMaxHeight("none"), 250);
      return () => clearTimeout(t);
    } else {
      const h = innerRef.current.scrollHeight;
      setMaxHeight(h + "px");
      requestAnimationFrame(() => setMaxHeight("0px"));
    }
  }, [open]);

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-black/20 overflow-hidden transition-shadow duration-300"
      style={{ animation: `fadeSlideIn 0.45s ${delay}s ease both` }}
    >
      <div className="w-full flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left group"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
            {icon}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          <svg
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 ml-1 ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {action && <div className="flex-shrink-0 ml-3">{action}</div>}
      </div>
      <div
        style={{
          maxHeight,
          transition: "max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div ref={innerRef} className="px-6 pb-6 pt-1 border-t border-gray-50 dark:border-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

const icons = {
  summary: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  actions: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  decisions: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  ),
  questions: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 21h.01M12 17h.01" />
    </svg>
  ),
  transcript: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
};

const SkeletonBlock = ({ className }) => (
  <div className={`rounded-lg bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${className}`}>
    <div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
        animation: "shimmer 1.4s ease-in-out infinite",
      }}
    />
  </div>
);

const VideoDetails = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const transcriptRef = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getVideo(videoId);
        setVideo(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (!search) return;

    setTimeout(() => {
      const highlight = transcriptRef.current?.querySelector("mark");
      if (highlight) {
        highlight.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }, [search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
        <BrandHeader scrolled={false} />
        <main className="max-w-4xl mx-auto px-6 py-10 w-full">
          <SkeletonBlock className="h-8 w-2/3 mb-3" />
          <SkeletonBlock className="h-4 w-1/3 mb-8" />
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <SkeletonBlock className="w-8 h-8 rounded-lg" />
                  <SkeletonBlock className="h-4 w-32" />
                </div>
                <SkeletonBlock className="h-3 w-full mb-2" />
                <SkeletonBlock className="h-3 w-5/6 mb-2" />
                <SkeletonBlock className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </main>
        <style>{`
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
        <BrandHeader scrolled={false} />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex flex-col items-center gap-3 text-center"
            style={{ animation: "fadeSlideIn 0.4s ease both" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Video not found</p>
            <button onClick={() => navigate("/")} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1">← Back to library</button>
          </div>
        </div>
      </div>
    );
  }

  const matchCount = search
    ? (video.transcript.match(new RegExp(search, "gi")) || []).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <BrandHeader navigate={navigate} scrolled={scrolled} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title block */}
        <div className="mb-8" style={{ animation: "fadeSlideIn 0.4s ease both" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
              Ready
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
            {video.title}
          </h1>
          <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 font-mono">{video.video_id}</p>
        </div>

        {/* Insight sections */}
        <div className="flex flex-col gap-4">
          <SectionCard
            icon={icons.summary}
            title="Summary"
            action={<CopyButton text={video.summary} />}
            delay={0.05}
          >
            <div className="prose prose-sm prose-gray dark:prose-invert max-w-none pt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              <ReactMarkdown>{video.summary}</ReactMarkdown>
            </div>
          </SectionCard>

          <SectionCard
            icon={icons.actions}
            title="Action items"
            action={<CopyButton text={video.action_items} />}
            delay={0.1}
          >
            <div className="prose prose-sm prose-gray dark:prose-invert max-w-none pt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              <ReactMarkdown>{video.action_items}</ReactMarkdown>
            </div>
          </SectionCard>

          <SectionCard
            icon={icons.decisions}
            title="Key decisions"
            defaultOpen={false}
            action={<CopyButton text={video.key_decisions} />}
            delay={0.15}
          >
            <p className="pt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {video.key_decisions}
            </p>
          </SectionCard>

          <SectionCard
            icon={icons.questions}
            title="Open questions"
            defaultOpen={false}
            action={<CopyButton text={video.open_questions} />}
            delay={0.2}
          >
            <p className="pt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {video.open_questions}
            </p>
          </SectionCard>

          {/* Transcript - kept expanded by default since it has search */}
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-shadow duration-300 overflow-hidden"
            style={{ animation: "fadeSlideIn 0.45s 0.25s ease both" }}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0">
                  {icons.transcript}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Transcript</span>
              </div>
              <CopyButton text={video.transcript} />
            </div>

            <div className="px-6 pb-6 pt-1 border-t border-gray-50 dark:border-gray-800">
              {/* Search input */}
              <div className="relative mt-4 mb-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search transcript…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all placeholder-gray-300 dark:placeholder-gray-600"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div
                style={{
                  maxHeight: search ? "40px" : "0px",
                  opacity: search ? 1 : 0,
                  transition: "max-height 0.25s ease, opacity 0.2s ease",
                  overflow: "hidden",
                }}
              >
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
                    {matchCount}
                  </span>
                  {matchCount === 1 ? "match found" : "matches found"}
                </p>
              </div>

              <div
                ref={transcriptRef}
                className="whitespace-pre-wrap leading-7 text-sm text-gray-600 dark:text-gray-300 max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/40 dark:bg-gray-800/40 font-mono scroll-smooth"
              >
                <Highlighter
                  searchWords={[search]}
                  autoEscape={true}
                  textToHighlight={video.transcript}
                  highlightTag="mark"
                  highlightClassName="bg-amber-200 dark:bg-amber-500/40 px-0.5 rounded text-gray-900 dark:text-gray-100 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div style={{ animation: "fadeSlideIn 0.45s 0.3s ease both" }}>
          <ChatBox videoId={video.video_id} />
        </div>
      </main>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
        .prose p { margin-bottom: 0.75rem; }
        .prose ul { padding-left: 1.25rem; list-style-type: disc; }
        .prose li { margin-bottom: 0.4rem; }
      `}</style>
    </div>
  );
};

export default VideoDetails;