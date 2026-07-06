import { useState, useRef, useEffect } from "react";
import { chatWithVideo, getChatHistory, clearChatHistory } from "../api/api";
import ReactMarkdown from "react-markdown";
import CopyButton from "./CopyButton";
import useTheme from "../hooks/useTheme";

const TypingDots = ({ dotColor }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 2px" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dotColor,
          display: "inline-block",
          animation: "typingBounce 1.2s infinite ease-in-out",
          animationDelay: `${i * 0.18}s`,
        }}
      />
    ))}
  </div>
);

const Avatar = ({ sender, isDark }) => {
  const isUser = sender === "You";
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: isUser ? (isDark ? "#f3f4f6" : "#111827") : "#6366f1",
        color: isUser && isDark ? "#111827" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {isUser ? "You" : "AI"}
    </div>
  );
};

const Message = ({ msg, isNew, isDark }) => {
  const isUser = msg.sender === "You";
  const [hovered, setHovered] = useState(false);

  const bubbleBg = isUser ? (isDark ? "#f3f4f6" : "#111827") : (isDark ? "#1f2937" : "#f3f4f6");
  const bubbleColor = isUser ? (isDark ? "#111827" : "#fff") : (isDark ? "#e5e7eb" : "#1f2937");
  const bubbleBorder = isUser ? "none" : `1px solid ${isDark ? "#374151" : "#e5e7eb"}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 16,
        animation: isNew ? "msgSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar sender={msg.sender} isDark={isDark} />

      <div
        style={{
          maxWidth: "72%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 3,
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            color: isDark ? "#6b7280" : "#9ca3af",
            fontWeight: 500,
            paddingInline: 4,
          }}
        >
          {msg.sender}
        </span>

        {/* Bubble + copy button sit side by side on the same row */}
        <div
          style={{
            display: "flex",
            flexDirection: isUser ? "row-reverse" : "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: bubbleBg,
              color: bubbleColor,
              fontSize: "0.9rem",
              lineHeight: 1.65,
              wordBreak: "break-word",
              border: bubbleBorder,
            }}
          >
            {msg.isTyping ? (
              <TypingDots dotColor={isDark ? "#6b7280" : "#9ca3af"} />
            ) : msg.sender === "Assistant" ? (
              <div className="chat-prose">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ) : (
              msg.text
            )}
          </div>

          {/* Copy button — appears on hover, never during typing */}
          {!msg.isTyping && msg.text && (
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? "scale(1)" : "scale(0.85)",
                transition: "opacity 0.15s ease, transform 0.15s ease",
                pointerEvents: hovered ? "auto" : "none",
                flexShrink: 0,
              }}
            >
              <CopyButton text={msg.text} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ isDark }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: 12,
      color: isDark ? "#6b7280" : "#9ca3af",
      animation: "fadeIn 0.4s ease both",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: isDark ? "#1f2937" : "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#6b7280" : "#9ca3af"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
    <p style={{ fontSize: "0.9rem", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
      Ask anything about this video.<br />
      <span style={{ fontSize: "0.8rem", color: isDark ? "#4b5563" : "#c4c9d4" }}>Summaries, decisions, action items — all fair game.</span>
    </p>
  </div>
);

const ChatBox = ({ videoId }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsgIndex, setNewMsgIndex] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

useEffect(() => {
  const loadHistory = async () => {
    if (!videoId) return;

    console.log("Loading history for:", videoId);

    try {
      const data = await getChatHistory(videoId);

      console.log("History received:", data);

      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  loadHistory();
}, [videoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearChatHistory(videoId);
      setMessages([]);
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  const sendMessage = async () => {
    if (!question.trim() || loading) return;

    const userMessage = { sender: "You", text: question };
    const typingMessage = { sender: "Assistant", text: "", isTyping: true };

    setMessages((prev) => {
      setNewMsgIndex(prev.length);
      return [...prev, userMessage, typingMessage];
    });

    const sentQuestion = question;
    setQuestion("");
    setLoading(true);

    try {
      const response = await chatWithVideo(videoId, sentQuestion);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "Assistant",
          text: response.answer,
        };
        setNewMsgIndex(updated.length - 1);
        return updated;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "Assistant",
          text: "Something went wrong. Please try again.",
        };
        return updated;
      });
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        background: isDark ? "#111827" : "#fff",
        borderRadius: 16,
        border: `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}`,
        boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.04)",
        marginTop: "1.5rem",
        overflow: "hidden",
        animation: "fadeSlideUp 0.45s ease both",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chat-prose p { margin: 0 0 0.5em; }
        .chat-prose p:last-child { margin-bottom: 0; }
        .chat-prose ul, .chat-prose ol { padding-left: 1.3em; margin: 0.25em 0 0.5em; }
        .chat-prose li { margin-bottom: 0.2em; }
        .chat-prose strong { font-weight: 600; }
        .chat-prose code {
          background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"};
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: monospace;
        }
        .chat-send-btn:hover:not(:disabled) { background: ${isDark ? "#e5e7eb" : "#1f2937"} !important; }
        .chat-send-btn:active:not(:disabled) { transform: scale(0.97); }
        .chat-send-btn { transition: background 0.15s, transform 0.1s !important; }
        .chat-input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: isDark ? "#f3f4f6" : "#111827" }}>
            Video Assistant
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: isDark ? "#6b7280" : "#9ca3af" }}>
            Powered by your video's content
          </p>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {messages.length > 0 && (
            <span
              style={{
                fontSize: "0.72rem",
                color: isDark ? "#6b7280" : "#9ca3af",
                background: isDark ? "#1f2937" : "#f9fafb",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              {messages.filter((m) => !m.isTyping).length} messages
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              title="Clear chat history"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 8,
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                background: clearing ? (isDark ? "#1f2937" : "#f9fafb") : (isDark ? "#111827" : "#fff"),
                cursor: clearing ? "not-allowed" : "pointer",
                fontSize: "0.75rem",
                color: clearing ? (isDark ? "#6b7280" : "#9ca3af") : "#ef4444",
                fontWeight: 500,
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!clearing) {
                  e.currentTarget.style.background = isDark ? "#450a0a" : "#fef2f2";
                  e.currentTarget.style.borderColor = isDark ? "#7f1d1d" : "#fca5a5";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? "#111827" : "#fff";
                e.currentTarget.style.borderColor = isDark ? "#374151" : "#e5e7eb";
              }}
            >
              {clearing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              )}
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          height: 360,
          overflowY: "auto",
          padding: "1.25rem 1.25rem 0.5rem",
          scrollbarWidth: "thin",
          scrollbarColor: isDark ? "#374151 transparent" : "#e5e7eb transparent",
        }}
      >
        {messages.length === 0 ? (
          <EmptyState isDark={isDark} />
        ) : (
          messages.map((msg, index) => (
            <Message key={index} msg={msg} isNew={index === newMsgIndex} isDark={isDark} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "0.875rem 1.25rem 1.125rem",
          borderTop: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}`,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about this video…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="chat-input"
          style={{
            flex: 1,
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            borderRadius: 12,
            padding: "0.65rem 1rem",
            fontSize: "0.9rem",
            color: isDark ? "#f3f4f6" : "#111827",
            background: isDark ? "#1f2937" : "#f9fafb",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !question.trim()}
          className="chat-send-btn"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: loading || !question.trim() ? (isDark ? "#374151" : "#e5e7eb") : (isDark ? "#f3f4f6" : "#111827"),
            border: "none",
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          aria-label="Send message"
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#6b7280" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={!question.trim() ? (isDark ? "#6b7280" : "#9ca3af") : (isDark ? "#111827" : "#fff")} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;