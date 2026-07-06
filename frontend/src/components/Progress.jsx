import { useEffect, useRef } from "react";
import useTheme from "../hooks/useTheme";

const STEPS = [
  { id: "queued",       label: "Queued",        icon: "⏱" },
  { id: "downloading",  label: "Downloading",   icon: "⬇" },
  { id: "transcribing", label: "Transcribing",  icon: "🎙" },
  { id: "summarizing",  label: "Summarizing",   icon: "📄" },
  { id: "extracting",   label: "Extracting",    icon: "🗄" },
  { id: "building_rag", label: "Building index",icon: "🔗" },
  { id: "completed",    label: "Completed",     icon: "✓" },
];

/* ─── tiny spinner ─── */
function Spinner() {
  return (
    <svg
      className="progress-spinner"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path
        d="M6 1.5 A4.5 4.5 0 0 1 10.5 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── checkmark ─── */
function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <polyline
        className="progress-check"
        points="2,6 5,9 9,3"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Progress = ({ status }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const currentIndex = STEPS.findIndex((s) => s.id === status);
  const pct = currentIndex < 0 ? 0 : Math.round(((currentIndex + 1) / STEPS.length) * 100);
  const barRef = useRef(null);

  /* re-trigger bar animation on status change */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.animation = "none";
    void bar.offsetHeight; // reflow
    bar.style.animation = "";
  }, [status]);

  return (
    <>
      <style>{`
        @keyframes progress-slide-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to   { width: ${pct}%; }
        }
        @keyframes progress-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes progress-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(59,130,246,.45); }
          70%  { box-shadow: 0 0 0 7px rgba(59,130,246,0);   }
          100% { box-shadow: 0 0 0 0   rgba(59,130,246,0);   }
        }
        @keyframes progress-check {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset: 0;  }
        }

        .progress-row        { animation: progress-slide-in .3s ease both; }
        .progress-bar-fill   { animation: progress-fill .65s cubic-bezier(.4,0,.2,1) both; }
        .progress-spinner    { animation: progress-spin .9s linear infinite; }
        .progress-pulse      { animation: progress-pulse 1.4s ease-out infinite; }
        .progress-check      { stroke-dasharray: 20; animation: progress-check .4s ease .1s both; }
      `}</style>

      <div
        style={{
          background: isDark ? "#111827" : "#fff",
          border: `0.5px solid ${isDark ? "#1f2937" : "#e5e7eb"}`,
          borderRadius: 12,
          padding: "1.5rem",
          marginTop: "1.5rem",
          maxWidth: 460,
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: isDark ? "#6b7280" : "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
              Processing status
            </p>
            <p style={{ fontSize: 18, fontWeight: 500, color: isDark ? "#f3f4f6" : "#111827", margin: 0 }}>
              {STEPS[currentIndex]?.label ?? "—"}
            </p>
          </div>
          <span
            style={{
              fontSize: 12, fontWeight: 500, padding: "4px 10px",
              borderRadius: 6, border: `0.5px solid ${isDark ? "#1e40af" : "#bfdbfe"}`,
              color: isDark ? "#93c5fd" : "#1d4ed8", background: isDark ? "#1e3a8a33" : "#eff6ff",
            }}
          >
            {currentIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div
          style={{
            height: 4, background: isDark ? "#1f2937" : "#f3f4f6", borderRadius: 2,
            overflow: "hidden", marginBottom: "1.25rem",
          }}
        >
          <div
            ref={barRef}
            className="progress-bar-fill"
            style={{
              height: "100%", background: "#3b82f6",
              borderRadius: 2, width: `${pct}%`,
            }}
          />
        </div>

        {/* ── Step rows ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STEPS.map((step, i) => {
            const done    = i < currentIndex;
            const active  = i === currentIndex;
            const pending = i > currentIndex;

            return (
              <div
                key={step.id}
                className="progress-row"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 10px", borderRadius: 8,
                  background: active
                    ? (isDark ? "#1e3a8a33" : "#eff6ff")
                    : done
                    ? (isDark ? "#14532d33" : "#f0fdf4")
                    : "transparent",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* dot */}
                <div
                  className={active ? "progress-pulse" : ""}
                  style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#22c55e" : active ? "#3b82f6" : "transparent",
                    border: pending ? `1.5px solid ${isDark ? "#4b5563" : "#d1d5db"}` : "none",
                  }}
                >
                  {done   && <Check />}
                  {active && <Spinner />}
                </div>

                {/* label */}
                <span
                  style={{
                    fontSize: 14, flex: 1,
                    fontWeight: done || active ? 500 : 400,
                    color: done
                      ? (isDark ? "#4ade80" : "#15803d")
                      : active
                      ? (isDark ? "#93c5fd" : "#1d4ed8")
                      : (isDark ? "#6b7280" : "#9ca3af"),
                  }}
                >
                  {step.label}
                </span>

                {/* badge */}
                <span
                  style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                    background: done
                      ? (isDark ? "#14532d66" : "#dcfce7")
                      : active
                      ? (isDark ? "#1e3a8a66" : "#dbeafe")
                      : (isDark ? "#1f2937" : "#f3f4f6"),
                    color: done
                      ? (isDark ? "#4ade80" : "#15803d")
                      : active
                      ? (isDark ? "#93c5fd" : "#1d4ed8")
                      : (isDark ? "#6b7280" : "#9ca3af"),
                  }}
                >
                  {done ? "done" : active ? "running" : "waiting"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Progress;