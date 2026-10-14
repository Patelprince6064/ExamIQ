import React, { useState, useRef, useEffect, useCallback } from "react";
import "./AIPractice.css";
import {
  apiChat,
  apiExplain,
  apiStudyPlan,
  apiWeakTopics,
} from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineChatAlt2,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlinePaperAirplane,
  HiOutlineClipboardCopy,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineSparkles,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { SharedSidebar } from "../components/layout/SharedLayout";

const QUICK_PROMPTS = [
  "Explain Deadlock in OS",
  "Generate 5 MCQs on Binary Trees",
  "What is TCP 3-way handshake?",
  "Explain SQL Joins with examples",
  "What is process scheduling?",
];

const WELCOME_PROMPTS = [
  { text: "Explain binary trees with an example", action: "send" },
  { text: "Generate five MCQs on DBMS", action: "send" },
  { text: "Explain the TCP three-way handshake", action: "send" },
  { text: "Create a study plan for my next exam", action: "plan" },
];

const GREETING =
  "Hi! I'm your AI Tutor. Ask me anything about DSA, OS, DBMS, CN or AI — or try a suggested prompt below.";

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ── Markdown-ish renderer (preserves existing format, adds fenced code) ── */
const formatText = (text) => {
  if (!text) return null;

  const cleaned = text.replace(/^#{1,6}\s+/gm, "").replace(/###+/g, "");

  // Split out fenced code blocks first so their content isn't re-formatted
  const chunks = cleaned.split(/```/);

  const renderInline = (str) => {
    const codeParts = str.split("`");
    return codeParts.map((codePart, cIdx) => {
      if (cIdx % 2 === 1) {
        return (
          <code key={cIdx} className="chat-inline-code">
            {codePart}
          </code>
        );
      }
      const boldParts = codePart.split("**");
      return boldParts.map((bPart, bIdx) =>
        bIdx % 2 === 1 ? (
          <strong key={`${cIdx}-${bIdx}`} className="chat-strong">
            {bPart}
          </strong>
        ) : (
          bPart
        )
      );
    });
  };

  const renderLines = (block, keyPrefix) => {
    const lines = block.split("\n");
    return lines.map((line, lineIdx) => {
      const key = `${keyPrefix}-${lineIdx}`;
      const trimmed = line.trim();

      if (!trimmed) return <div key={key} className="chat-spacer" />;
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        return <hr key={key} className="chat-divider" />;
      }

      const isHeading =
        (trimmed.startsWith("📌") ||
          trimmed.startsWith("🔹") ||
          trimmed.startsWith("⚙️") ||
          trimmed.startsWith("💡") ||
          trimmed.startsWith("⚖️") ||
          trimmed.startsWith("📝") ||
          trimmed.startsWith("🎯") ||
          trimmed.startsWith("📋") ||
          trimmed.startsWith("🤝") ||
          trimmed.startsWith("🔒") ||
          trimmed.startsWith("📊") ||
          trimmed.startsWith("🤖") ||
          trimmed.startsWith("📘") ||
          trimmed.startsWith("📆")) &&
        trimmed.length < 120;

      if (isHeading) {
        return (
          <div key={key} className="chat-heading">
            {renderInline(trimmed)}
          </div>
        );
      }

      if (/^[-*•]\s+/.test(trimmed)) {
        return (
          <div key={key} className="chat-bullet-item">
            <span className="chat-bullet-dot" aria-hidden="true">
              •
            </span>
            <span className="chat-bullet-text">
              {renderInline(trimmed.replace(/^[-*•]\s+/, ""))}
            </span>
          </div>
        );
      }

      const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
      if (numMatch) {
        return (
          <div key={key} className="chat-numbered-item">
            <span className="chat-numbered-badge">{numMatch[1]}</span>
            <span className="chat-numbered-text">
              {renderInline(numMatch[2])}
            </span>
          </div>
        );
      }

      return (
        <div key={key} className="chat-paragraph">
          {renderInline(line)}
        </div>
      );
    });
  };

  return chunks.map((chunk, i) =>
    i % 2 === 1 ? (
      <pre key={`code-${i}`} className="chat-code">
        {chunk.replace(/^\n/, "")}
      </pre>
    ) : (
      <React.Fragment key={`txt-${i}`}>
        {renderLines(chunk, `t${i}`)}
      </React.Fragment>
    )
  );
};

/* ── Animated AI orb (CSS-driven, sm/md/lg, state-aware) ── */
function AIOrb({ size = "md", state = "idle" }) {
  return (
    <span
      className={`ai-orb ai-orb-${size} is-${state}`}
      aria-hidden="true"
    >
      <span className="ai-orb-halo" />
      <span className="ai-orb-ring" />
      <span className="ai-orb-core" />
    </span>
  );
}

function AIPractice() {
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: uid(), sender: "ai", text: GREETING },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [explainTopic, setExplainTopic] = useState("");
  const [explainSubject, setExplainSubject] = useState("DSA");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [examDate, setExamDate] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [connState, setConnState] = useState("checking"); // checking | online | offline
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chatboxRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const nearBottomRef = useRef(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  /* Real connectivity check: an authed ping proves the serving path is alive.
     (The offline fallback engine answers when the backend is reachable.) */
  useEffect(() => {
    let cancelled = false;
    const base = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
    fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(() => {
        if (!cancelled) setConnState("online");
      })
      .catch(() => {
        if (!cancelled) setConnState("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (location.state?.weakTopic) {
      const topic = location.state.weakTopic;
      setInput(`Explain ${topic} and generate 5 practice questions`);
      setExplainTopic(topic);
      if (location.state?.subject) setExplainSubject(location.state.subject);
    }
  }, [location.state]);

  /* Autoscroll only when the user is already near the bottom */
  const handleScroll = useCallback(() => {
    const el = chatboxRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = gap < 120;
    setShowScrollDown(gap >= 120);
  }, []);

  useEffect(() => {
    if (nearBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loading]);

  /* Textarea grows naturally up to a cap */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input, activeTab]);

  const sendMessage = useCallback(
    async (text) => {
      const msg = (text ?? input).trim();
      if (!msg || loading) return;
      const userMsg = { id: uid(), sender: "user", text: msg };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      nearBottomRef.current = true;
      setLoading(true);
      try {
        const data = await apiChat(msg);
        setConnState("online");
        setMessages((prev) => [
          ...prev,
          { id: uid(), sender: "ai", text: data.reply || "No response." },
        ]);
      } catch {
        setConnState("offline");
        setMessages((prev) => [
          ...prev,
          { id: uid(), sender: "ai", text: "Couldn't reach the tutor. Check your connection and try again.", error: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const retryLast = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last?.error) return prev;
      const userText = [...prev].reverse().find((m) => m.sender === "user")?.text;
      if (!userText) return prev.slice(0, -1);
      // Drop the error bubble, resend through the normal flow
      setTimeout(() => sendMessage(userText), 0);
      return prev.slice(0, -1);
    });
  }, [sendMessage]);

  const regenerateLast = useCallback(() => {
    if (loading) return;
    const lastUser = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const cut = [...prev];
      const last = cut[cut.length - 1];
      if (last?.sender === "ai" && !last.error) cut.pop();
      return cut;
    });
    setTimeout(() => sendMessage(lastUser.text), 0);
  }, [loading, messages, sendMessage]);

  const clearChat = useCallback(() => {
    if (loading) return;
    if (messages.length <= 1) return;
    if (window.confirm("Clear this conversation and start fresh?")) {
      setMessages([{ id: uid(), sender: "ai", text: GREETING }]);
    }
  }, [loading, messages.length]);

  const copyText = useCallback(async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const handleExplain = async () => {
    if (!explainTopic.trim() || explainLoading) return;
    setExplainLoading(true);
    setExplanation("");
    try {
      const data = await apiExplain(explainTopic.trim(), explainSubject);
      setConnState("online");
      setExplanation(data.explanation || "No explanation returned.");
    } catch {
      setConnState("offline");
      setExplanation("Couldn't reach the tutor. Check your connection and try again.");
    } finally {
      setExplainLoading(false);
    }
  };

  const handleStudyPlan = async () => {
    if (!examDate || planLoading) return;
    setPlanLoading(true);
    setStudyPlan("");
    try {
      // Feed the planner your real weak topics when available (existing contract)
      let weak = [];
      try {
        const w = await apiWeakTopics();
        if (Array.isArray(w?.weakTopics)) weak = w.weakTopics.slice(0, 8);
      } catch {
        /* planner still works without them */
      }
      const data = await apiStudyPlan(startDate, examDate, weak);
      setConnState("online");
      setStudyPlan(data.studyPlan || "No plan returned.");
    } catch {
      setConnState("offline");
      setStudyPlan("Couldn't reach the tutor. Check your connection and try again.");
    } finally {
      setPlanLoading(false);
    }
  };

  const TABS = [
    { id: "chat", icon: HiOutlineChatAlt2, label: "AI Chat", desc: "Ask questions and explore concepts" },
    { id: "explain", icon: HiOutlineBookOpen, label: "Deep Explain", desc: "Break complex topics into steps" },
    { id: "studyplan", icon: HiOutlineCalendar, label: "Study Planner", desc: "Build a personalized study plan" },
  ];
  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  const isWelcome = messages.length <= 1 && !loading;
  const orbState = loading || explainLoading || planLoading ? "thinking" : connState === "offline" ? "offline" : "idle";

  const connLabel =
    connState === "online" ? "AI Online" : connState === "checking" ? "Connecting…" : "Offline";

  return (
    <div className="dashboard ai-page">
      <SharedSidebar />

      <div className="main ai-tutor-main">
        {/* ══ HEADER ══ */}
        <header className="ai-tutor-header ai-enter">
          <div className="ai-tutor-title">
            <AIOrb size="sm" state={orbState} />
            <div>
              <h1>AI Practice Tutor</h1>
              <p>{activeTabMeta.desc}</p>
            </div>
          </div>
          <div className={`ai-conn ai-conn-${connState}`} role="status">
            <span className="ai-conn-dot" aria-hidden="true" />
            {connLabel}
          </div>
        </header>

        {/* ══ MODE SELECTOR ══ */}
        <div className="ai-modes ai-enter ai-enter-1" role="tablist" aria-label="Tutor modes">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`ai-mode${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="ai-mode-icon" aria-hidden="true">
                <t.icon size={18} />
              </span>
              <span className="ai-mode-copy">
                <span className="ai-mode-label">{t.label}</span>
                <span className="ai-mode-desc">{t.desc}</span>
              </span>
              {activeTab === t.id && (
                <span className="ai-mode-check" aria-hidden="true">
                  <HiOutlineCheck size={13} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ CHAT MODE ══ */}
        {activeTab === "chat" && (
          <section className="ai-chat" aria-label="AI chat">
            {isWelcome ? (
              <div className="ai-welcome">
                <div className="ai-welcome-orb ai-enter ai-enter-1">
                  <AIOrb size="lg" state={orbState} />
                </div>
                <h2 className="ai-enter ai-enter-2">Your AI Study Partner</h2>
                <p className="ai-enter ai-enter-3">
                  Ask questions, understand difficult concepts, and build a
                  smarter study plan.
                </p>
                <div className="ai-welcome-grid">
                  {WELCOME_PROMPTS.map((p, i) => (
                    <button
                      key={p.text}
                      className={`ai-welcome-card ai-enter ai-enter-${Math.min(4 + i, 6)}`}
                      onClick={() =>
                        p.action === "plan"
                          ? setActiveTab("studyplan")
                          : sendMessage(p.text)
                      }
                    >
                      <HiOutlineSparkles size={15} aria-hidden="true" />
                      <span>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="ai-toolbar">
                  <div className="ai-chips">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        className="ai-chip"
                        onClick={() => sendMessage(p)}
                        disabled={loading}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="ai-toolbar-actions">
                    <button
                      className="ai-icon-btn"
                      onClick={regenerateLast}
                      disabled={loading || messages.length <= 1}
                      title="Regenerate last response"
                      aria-label="Regenerate last response"
                    >
                      <HiOutlineRefresh size={16} />
                    </button>
                    <button
                      className="ai-icon-btn danger"
                      onClick={clearChat}
                      disabled={loading || messages.length <= 1}
                      title="Clear conversation"
                      aria-label="Clear conversation"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="ai-chatbox"
                  ref={chatboxRef}
                  onScroll={handleScroll}
                  role="log"
                  aria-live="polite"
                  aria-label="Conversation"
                >
                  {messages.map((msg) => (
                    <div key={msg.id} className={`ai-msg ${msg.sender}`}>
                      {msg.sender === "ai" && (
                        <span className="ai-msg-avatar">
                          <AIOrb size="xs" state={msg.error ? "error" : "idle"} />
                        </span>
                      )}
                      <div className="ai-bubble">
                        {formatText(msg.text)}
                        {msg.sender === "ai" && !msg.error && (
                          <button
                            className="ai-copy"
                            onClick={() => copyText(msg.id, msg.text)}
                            title={copiedId === msg.id ? "Copied" : "Copy response"}
                            aria-label={copiedId === msg.id ? "Copied" : "Copy response"}
                          >
                            {copiedId === msg.id ? (
                              <HiOutlineCheck size={13} />
                            ) : (
                              <HiOutlineClipboardCopy size={13} />
                            )}
                          </button>
                        )}
                        {msg.error && (
                          <button className="ai-retry" onClick={retryLast}>
                            <HiOutlineRefresh size={13} aria-hidden="true" /> Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="ai-msg ai">
                      <span className="ai-msg-avatar">
                        <AIOrb size="xs" state="thinking" />
                      </span>
                      <div className="ai-bubble ai-thinking">
                        <span className="ai-dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                        <span className="ai-thinking-text">
                          Thinking through your question…
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {showScrollDown && (
                  <button
                    className="ai-scrolldown"
                    onClick={() =>
                      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                    title="Scroll to latest"
                    aria-label="Scroll to latest message"
                  >
                    <HiOutlineChevronDown size={16} />
                  </button>
                )}
              </>
            )}

            {/* ══ COMPOSER ══ */}
            <div className="ai-composer">
              <div className="ai-composer-box">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything about DSA, OS, DBMS, CN, AI..."
                  disabled={loading}
                  aria-label="Message the AI tutor"
                />
                <button
                  className="ai-send"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  title="Send message"
                  aria-label="Send message"
                >
                  <HiOutlinePaperAirplane size={17} />
                </button>
              </div>
              <p className="ai-composer-hint">
                Enter to send · Shift+Enter for a new line
              </p>
            </div>
          </section>
        )}

        {/* ══ DEEP EXPLAIN MODE ══ */}
        {activeTab === "explain" && (
          <section className="ai-panel ai-enter" aria-label="Deep explain">
            <div className="ai-panel-head">
              <span className="ai-panel-icon tint-cyan" aria-hidden="true">
                <HiOutlineBookOpen size={22} />
              </span>
              <div>
                <h2>Deep Topic Explanation</h2>
                <p>Structured, exam-focused breakdowns with examples</p>
              </div>
            </div>

            <div className="ai-controls">
              <div className="ai-field">
                <label htmlFor="explain-subject">Subject</label>
                <select
                  id="explain-subject"
                  value={explainSubject}
                  onChange={(e) => setExplainSubject(e.target.value)}
                >
                  {["DSA", "OS", "DBMS", "CN", "AI"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="ai-field ai-field-grow">
                <label htmlFor="explain-topic">Topic</label>
                <input
                  id="explain-topic"
                  type="text"
                  placeholder="e.g. Deadlock, SQL Joins, Binary Trees…"
                  value={explainTopic}
                  onChange={(e) => setExplainTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplain()}
                />
              </div>
              <button
                className="ai-btn primary"
                onClick={handleExplain}
                disabled={explainLoading || !explainTopic.trim()}
              >
                {explainLoading ? (
                  <>
                    <span className="btn-spin" aria-hidden="true" /> Explaining…
                  </>
                ) : (
                  <>
                    <HiOutlineBookOpen size={15} aria-hidden="true" /> Explain
                  </>
                )}
              </button>
            </div>

            {explainLoading && (
              <div className="ai-msg ai">
                <span className="ai-msg-avatar">
                  <AIOrb size="xs" state="thinking" />
                </span>
                <div className="ai-bubble ai-thinking">
                  <span className="ai-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="ai-thinking-text">
                    Building your explanation…
                  </span>
                </div>
              </div>
            )}

            {explanation && !explainLoading && (
              <div className="ai-result">
                <div className="ai-result-head">
                  <span>
                    <HiOutlineSparkles size={14} aria-hidden="true" /> Explanation:{" "}
                    {explainTopic}
                  </span>
                  <button
                    className="ai-copy-btn"
                    onClick={() => copyText("explain", explanation)}
                  >
                    {copiedId === "explain" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="ai-result-body">{formatText(explanation)}</div>
              </div>
            )}

            {!explanation && !explainLoading && (
              <div className="ai-panel-empty">
                <AIOrb size="md" state="idle" />
                <p>Enter a topic above and hit Explain for a detailed breakdown</p>
              </div>
            )}
          </section>
        )}

        {/* ══ STUDY PLANNER MODE ══ */}
        {activeTab === "studyplan" && (
          <section className="ai-panel ai-enter" aria-label="Study planner">
            <div className="ai-panel-head">
              <span className="ai-panel-icon tint-violet" aria-hidden="true">
                <HiOutlineCalendar size={22} />
              </span>
              <div>
                <h2>Personalized Study Planner</h2>
                <p>
                  Day-by-day schedule for your exam date — weighted toward your
                  weak topics when quiz history exists
                </p>
              </div>
            </div>

            <div className="ai-controls">
              <div className="ai-field">
                <label htmlFor="plan-start">Start Date</label>
                <input
                  id="plan-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="ai-field">
                <label htmlFor="plan-exam">Exam Date</label>
                <input
                  id="plan-exam"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={startDate}
                />
              </div>
              <button
                className="ai-btn primary"
                onClick={handleStudyPlan}
                disabled={planLoading || !examDate}
              >
                {planLoading ? (
                  <>
                    <span className="btn-spin" aria-hidden="true" /> Generating…
                  </>
                ) : (
                  <>
                    <HiOutlineCalendar size={15} aria-hidden="true" /> Generate Plan
                  </>
                )}
              </button>
            </div>

            {planLoading && (
              <div className="ai-msg ai">
                <span className="ai-msg-avatar">
                  <AIOrb size="xs" state="thinking" />
                </span>
                <div className="ai-bubble ai-thinking">
                  <span className="ai-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="ai-thinking-text">
                    Drafting your study plan…
                  </span>
                </div>
              </div>
            )}

            {studyPlan && !planLoading && (
              <div className="ai-result">
                <div className="ai-result-head">
                  <span>
                    <HiOutlineSparkles size={14} aria-hidden="true" /> Your Study Plan
                  </span>
                  <button
                    className="ai-copy-btn"
                    onClick={() => copyText("plan", studyPlan)}
                  >
                    {copiedId === "plan" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="ai-result-body">{formatText(studyPlan)}</div>
              </div>
            )}

            {!studyPlan && !planLoading && (
              <div className="ai-panel-empty">
                <AIOrb size="md" state="idle" />
                <p>Pick your exam date to get a personalized daily schedule</p>
              </div>
            )}
          </section>
        )}

        {connState === "offline" && (
          <p className="ai-offline-note" role="alert">
            <HiOutlineExclamationCircle size={14} aria-hidden="true" />
            Connection lost — responses may fail until you&apos;re back online.
          </p>
        )}
      </div>
    </div>
  );
}

export default AIPractice;
