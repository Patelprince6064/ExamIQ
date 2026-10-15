import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  apiGetSubjects, apiGenerateQuiz, apiSubmitQuiz, apiGenerateDescriptive, apiGetTopicNotes,
  apiQuizHistory, apiWeakTopics,
} from "../services/api";
import { SharedSidebar } from "../components/layout/SharedLayout";
import {
  HiOutlineDocumentText,
  HiOutlineClipboardCheck,
  HiOutlinePlay,
  HiOutlineNewspaper,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineBookOpen,
} from "react-icons/hi";
import "./Subjects.css";

const DIFFICULTY_CONFIG = {
  easy:   { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", label: "Easy" },
  medium: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Medium" },
  hard:   { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Hard" },
};

// Tiny markdown renderer for AI notes
function renderNotes(md) {
  if (!md) return null;
  const lines = md.split("\n");
  const elements = [];
  let list = [];
  let listType = null;
  let key = 0;

  const flushList = () => {
    if (!list.length) return;
    const items = list.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />);
    elements.push(listType === "ol" ? <ol key={key++}>{items}</ol> : <ul key={key++}>{items}</ul>);
    list = [];
    listType = null;
  };

  const inline = (t) =>
    t
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); return; }
    if (/^#{1,4}\s/.test(trimmed)) {
      flushList();
      const lvl = trimmed.match(/^#+/)[0].length;
      const Tag = lvl === 1 ? "h2" : lvl === 2 ? "h3" : "h4";
      elements.push(<Tag key={key++} dangerouslySetInnerHTML={{ __html: inline(trimmed.replace(/^#+\s*/, "")) }} />);
    } else if (/^[-*]\s/.test(trimmed)) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      list.push(inline(trimmed.replace(/^[-*]\s/, "")));
    } else if (/^\d+[.)]\s/.test(trimmed)) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      list.push(inline(trimmed.replace(/^\d+[.)]\s/, "")));
    } else {
      flushList();
      elements.push(<p key={key++} dangerouslySetInnerHTML={{ __html: inline(trimmed) }} />);
    }
  });
  flushList();
  return elements;
}

const noClipboard = (e) => e.preventDefault();

function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [history, setHistory]             = useState([]);
  const [weakTopics, setWeakTopics]       = useState([]);
  const [selected, setSelected]           = useState(null);
  const [section, setSection]             = useState("topics"); // topics | notes | test | video | quiz | result
  const [activeTopic, setActiveTopic]     = useState(null);

  const [notes, setNotes]                 = useState("");
  const [notesLoading, setNotesLoading]   = useState(false);

  // Descriptive (Google-Forms) flow
  const [descQ, setDescQ]                 = useState([]);
  const [descLoading, setDescLoading]     = useState(false);
  const [qIndex, setQIndex]               = useState(0);
  const [userAnswers, setUserAnswers]     = useState({});
  const [qSubmitted, setQSubmitted]       = useState(false);

  const [quiz, setQuiz]                   = useState(null);
  const [quizLoading, setQuizLoading]     = useState(false);
  const [answers, setAnswers]             = useState({});
  const [result, setResult]               = useState(null);
  const [difficulty, setDifficulty]       = useState("medium");

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectCode, setNewSubjectCode]   = useState("");
  const [newSubjectName, setNewSubjectName]   = useState("");
  const [newSubjectTopics, setNewSubjectTopics] = useState("");

  // Discovery toolbar (subject grid only — real filtering, no fake controls)
  const [query, setQuery]                 = useState("");
  const [statusFilter, setStatusFilter]   = useState("all"); // all | progress | fresh
  const [sortBy, setSortBy]               = useState("name"); // name | practiced | score | recent
  const [gridIn, setGridIn]               = useState(false);

  const [isAddingTopic, setIsAddingTopic]     = useState(false);
  const [newTopicName, setNewTopicName]       = useState("");

  const videoUrlFor = (subjectName, topic) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} ${subjectName} lecture in depth`)}`;

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    let cancelled = false;
    Promise.allSettled([apiGetSubjects(), apiQuizHistory(20), apiWeakTopics()]).then(
      ([subRes, histRes, weakRes]) => {
        if (cancelled) return;
        if (subRes.status === "fulfilled") {
          const fetched = subRes.value.subjects || [];
          const savedCustom = JSON.parse(localStorage.getItem("custom_subjects_v1") || "[]");
          const fetchedCodes = new Set(fetched.map((s) => s.code));
          const customToAppend = savedCustom.filter((cs) => !fetchedCodes.has(cs.code));
          const savedTopicMap = JSON.parse(localStorage.getItem("custom_topics_map_v1") || "{}");
          const merged = [...fetched, ...customToAppend].map((s) => {
            if (savedTopicMap[s.code]) {
              const existingNames = new Set(s.topics.map((t) => t.name));
              const newTopics = savedTopicMap[s.code].filter((t) => !existingNames.has(t.name));
              return { ...s, topics: [...s.topics, ...newTopics] };
            }
            return s;
          });
          setSubjects(merged);
        } else {
          console.error(subRes.reason);
        }
        if (histRes.status === "fulfilled" && Array.isArray(histRes.value?.results)) {
          setHistory(histRes.value.results);
        }
        if (weakRes.status === "fulfilled" && Array.isArray(weakRes.value?.weakTopics)) {
          setWeakTopics(weakRes.value.weakTopics);
        }
        setLoading(false);
      }
    );
    return () => { cancelled = true; };
  }, [navigate]);

  // Entrance: cards fade-rise once when the grid first appears
  useEffect(() => {
    if (loading || selected) return undefined;
    setGridIn(false);
    const raf = requestAnimationFrame(() => setGridIn(true));
    return () => cancelAnimationFrame(raf);
  }, [loading, selected]);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectCode.trim() || !newSubjectName.trim()) return;

    const code = newSubjectCode.trim().toUpperCase();
    const name = newSubjectName.trim();
    const topicList = newSubjectTopics
      ? newSubjectTopics.split(",").map((t) => t.trim()).filter(Boolean)
      : ["General Concepts", "Overview & Fundamentals"];

    const newSub = {
      code,
      name,
      icon: "📚",
      topics: topicList.map((t) => ({
        name: t,
        videoUrl: videoUrlFor(name, t),
      })),
      quizzesTaken: 0,
      avgScore: 0,
      isCustom: true,
    };

    const updatedSubjects = [...subjects, newSub];
    setSubjects(updatedSubjects);

    const existingCustom = JSON.parse(localStorage.getItem("custom_subjects_v1") || "[]");
    localStorage.setItem("custom_subjects_v1", JSON.stringify([...existingCustom, newSub]));

    setNewSubjectCode("");
    setNewSubjectName("");
    setNewSubjectTopics("");
    setIsAddingSubject(false);
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selected) return;

    const tName = newTopicName.trim();
    const newTopicObj = {
      name: tName,
      videoUrl: videoUrlFor(selected.name, tName),
    };

    const updatedTopics = [...selected.topics, newTopicObj];
    const updatedSelected = { ...selected, topics: updatedTopics };
    setSelected(updatedSelected);

    const updatedSubjects = subjects.map((s) => (s.code === selected.code ? updatedSelected : s));
    setSubjects(updatedSubjects);

    const savedTopicMap = JSON.parse(localStorage.getItem("custom_topics_map_v1") || "{}");
    const currentSubjectCustomTopics = savedTopicMap[selected.code] || [];
    savedTopicMap[selected.code] = [...currentSubjectCustomTopics, newTopicObj];
    localStorage.setItem("custom_topics_map_v1", JSON.stringify(savedTopicMap));

    const existingCustom = JSON.parse(localStorage.getItem("custom_subjects_v1") || "[]");
    if (existingCustom.some((s) => s.code === selected.code)) {
      const updatedCustom = existingCustom.map((s) => (s.code === selected.code ? updatedSelected : s));
      localStorage.setItem("custom_subjects_v1", JSON.stringify(updatedCustom));
    }

    setNewTopicName("");
    setIsAddingTopic(false);
  };

  const openSubject = (subject) => {
    setSelected(subject);
    setSection("topics");
    setActiveTopic(null);
    setQuiz(null); setAnswers({}); setResult(null);
    setNotes(""); setDescQ([]); setQSubmitted(false); setUserAnswers({}); setQIndex(0);
    setIsAddingTopic(false);
  };

  const openSection = (sec, topic) => {
    setActiveTopic(topic);
    setQuiz(null); setAnswers({}); setResult(null);
    setDescQ([]); setQSubmitted(false); setUserAnswers({}); setQIndex(0);
    setSection(sec);
    if (sec === "notes") {
      setNotesLoading(true);
      setNotes("");
      apiGetTopicNotes(selected.code, topic.name, selected.name)
        .then((data) => setNotes(data.notes || "Notes could not be generated."))
        .catch(() => setNotes("Failed to load notes. Please try again."))
        .finally(() => setNotesLoading(false));
    }
  };

  const loadDescriptive = async (topic) => {
    setDescLoading(true);
    setDescQ([]);
    setUserAnswers({});
    setQSubmitted(false);
    setQIndex(0);
    try {
      const data = await apiGenerateDescriptive(selected.code, topic.name, 5);
      setDescQ(data.questions || []);
    } catch { alert("Failed to generate questions"); }
    finally { setDescLoading(false); }
  };

  const generateQuiz = async (topic, count = 20) => {
    setQuizLoading(true);
    setQuiz(null); setAnswers({}); setResult(null);
    try {
      const data = await apiGenerateQuiz(selected.code, topic.name, count, difficulty);
      if (!data.questions || data.questions.length === 0) {
        alert("Failed to generate quiz. Please try again.");
      } else {
        setQuiz({ questions: data.questions, topic: topic.name, subject: selected.code });
        setSection("quiz");
      }
    } catch { alert("Failed to generate quiz"); }
    finally { setQuizLoading(false); }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    setQuizLoading(true);
    const questions = quiz.questions.map((q, i) => ({
      question: q.question,
      userAnswer: answers[i] || "",
      correctAnswer: q.correctAnswer,
      isCorrect: answers[i] === q.correctAnswer,
      topic: q.topic || quiz.topic,
      explanation: q.explanation || `The correct answer is "${q.correctAnswer}". Key concept: ${q.topic || quiz.topic}.`,
    }));
    try {
      const data = await apiSubmitQuiz({ subject: quiz.subject, topic: quiz.topic, questions, timeTaken: 0, mode: "practice" });
      setResult(data);
      setSection("result");
    } catch {
      alert("Failed to submit quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const SUBJECT_COLORS = ["#2563eb","#06b6d4","#10b981","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#6366f1","#0ea5e9","#a855f7","#ef4444"];

  /* ── Discovery: real search / filter / sort over actual subjects ── */
  const lastPracticed = {};
  history.forEach((r) => {
    if (!r?.subject) return;
    const t = new Date(r.createdAt).getTime();
    if (!lastPracticed[r.subject] || t > lastPracticed[r.subject]) {
      lastPracticed[r.subject] = t;
    }
  });

  const visibleSubjects = subjects
    .filter((s) => {
      const q = query.trim().toLowerCase();
      if (q && !`${s.code} ${s.name}`.toLowerCase().includes(q)) return false;
      if (statusFilter === "progress" && !(s.quizzesTaken > 0)) return false;
      if (statusFilter === "fresh" && s.quizzesTaken > 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "practiced") return (b.quizzesTaken || 0) - (a.quizzesTaken || 0);
      if (sortBy === "score") return (b.avgScore || 0) - (a.avgScore || 0);
      if (sortBy === "recent")
        return (lastPracticed[b.code] || 0) - (lastPracticed[a.code] || 0);
      return a.name.localeCompare(b.name);
    });

  const filtersActive =
    query.trim() !== "" || statusFilter !== "all" || sortBy !== "name";
  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setSortBy("name");
  };

  // Continue Learning: most recent real quiz → its subject (never fabricated)
  const lastQuiz = history.length > 0 ? history[0] : null;
  const featuredSubject = lastQuiz
    ? subjects.find((s) => s.code === lastQuiz.subject) || null
    : null;

  // Recommended: weakest real topic (existing weak-topics analysis)
  const recommendation = weakTopics.length > 0 ? weakTopics[0] : null;

  const backToTopics = () => {
    setSection("topics");
    setActiveTopic(null);
    setQuiz(null); setAnswers({}); setResult(null);
    setNotes(""); setDescQ([]); setQSubmitted(false); setUserAnswers({}); setQIndex(0);
  };

  const colorOf = (code) => {
    const idx = subjects.findIndex((s) => s.code === code);
    return SUBJECT_COLORS[(idx < 0 ? 0 : idx) % SUBJECT_COLORS.length];
  };

  const badge = (code, size = "lg") => (
    <div className={`subject-badge ${size}`} style={{ background: `${colorOf(code)}1a`, color: colorOf(code) }}>
      {code.charAt(0)}
    </div>
  );

  return (
    <div className="dashboard">
      <SharedSidebar />
      <div className="main subjects-main">
        <div className="subjects-header">
          <div className="subjects-title">
            <span className="subjects-spark" aria-hidden="true">
              <HiOutlineSparkles size={18} />
            </span>
            <div>
              <h1>
                Subjects{" "}
                {!loading && (
                  <span className="subjects-count">
                    {subjects.length} subject{subjects.length === 1 ? "" : "s"}
                  </span>
                )}
              </h1>
              <p>Explore your subjects, strengthen your concepts, and track your progress.</p>
            </div>
          </div>
          {selected && (
            <button className="s-back-btn" onClick={() => openSubject(null)}>
              ← All Subjects
            </button>
          )}
        </div>

        {loading ? (
          <div className="subjects-loading"><div className="loading-ring"></div><p>Loading subjects…</p></div>
        ) : !selected ? (
          <>
            {/* ── CONTINUE LEARNING ── */}
            {featuredSubject && lastQuiz ? (
              <section className={`sj-featured${gridIn ? " sj-in" : ""}`} aria-label="Continue learning">
                <span className="sj-featured-icon" aria-hidden="true">
                  <HiOutlineBookOpen size={22} />
                </span>
                <div className="sj-featured-copy">
                  <p className="sj-eyebrow">Continue learning</p>
                  <h2>{featuredSubject.name}</h2>
                  <p>
                    Last quiz{lastQuiz.topic ? ` on ${lastQuiz.topic}` : ""} — you scored{" "}
                    <strong>{lastQuiz.score}%</strong>. Pick up right where you left off.
                  </p>
                </div>
                <button
                  className="sj-btn primary"
                  onClick={() => openSubject(featuredSubject)}
                >
                  Continue Learning <HiOutlineArrowRight size={15} aria-hidden="true" />
                </button>
              </section>
            ) : (
              <section className={`sj-featured sj-welcome${gridIn ? " sj-in" : ""}`} aria-label="Get started">
                <span className="sj-featured-icon" aria-hidden="true">
                  <HiOutlineSparkles size={22} />
                </span>
                <div className="sj-featured-copy">
                  <p className="sj-eyebrow">Welcome to your learning space</p>
                  <h2>Choose a subject to begin your preparation</h2>
                  <p>Study notes, take quizzes and watch your averages grow here.</p>
                </div>
              </section>
            )}

            {/* ── RECOMMENDED ── */}
            {recommendation && (
              <section className={`sj-reco${gridIn ? " sj-in" : ""}`} aria-label="Recommended for you">
                <span className="sj-reco-icon" aria-hidden="true">
                  <HiOutlineSparkles size={16} />
                </span>
                <p className="sj-reco-text">
                  <strong>Recommended for you:</strong> revisit{" "}
                  <strong>{recommendation.topic}</strong>
                  {recommendation.subject ? ` in ${recommendation.subject}` : ""} ({recommendation.accuracy}%
                  accuracy) and practise a short quiz to strengthen your understanding.
                </p>
                <Link
                  to="/practice"
                  state={{
                    weakTopic: recommendation.topic,
                    subject: recommendation.subject,
                  }}
                  className="sj-reco-btn"
                >
                  Practise now <HiOutlineArrowRight size={14} aria-hidden="true" />
                </Link>
              </section>
            )}

            {/* ── DISCOVERY TOOLBAR ── */}
            <div className={`sj-toolbar${gridIn ? " sj-in" : ""}`} role="search">
              <div className="sj-search">
                <HiOutlineSearch size={16} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search subjects"
                />
                {query && (
                  <button
                    className="sj-clear-q"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <HiOutlineX size={14} />
                  </button>
                )}
              </div>
              <div className="sj-filters" role="group" aria-label="Filter subjects">
                {[
                  { id: "all", label: "All Subjects" },
                  { id: "progress", label: "In Progress" },
                  { id: "fresh", label: "Not Started" },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={`sj-filter${statusFilter === f.id ? " active" : ""}`}
                    onClick={() => setStatusFilter(f.id)}
                    aria-pressed={statusFilter === f.id}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <select
                className="sj-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort subjects"
              >
                <option value="name">Name A–Z</option>
                <option value="practiced">Most practiced</option>
                <option value="score">Highest score</option>
                {history.length > 0 && (
                  <option value="recent">Recently practiced</option>
                )}
              </select>
              {filtersActive && (
                <button className="sj-reset" onClick={resetFilters}>
                  Reset
                </button>
              )}
            </div>

            <div className="subject-grid">
              {visibleSubjects.map((s, idx) => {
                const started = s.quizzesTaken > 0;
                const color = SUBJECT_COLORS[subjects.findIndex((x) => x.code === s.code) % SUBJECT_COLORS.length];
                return (
                  <div
                    key={s.code}
                    className={`subject-card${gridIn ? " sj-in" : ""}`}
                    style={{ transitionDelay: gridIn ? `${Math.min(idx, 11) * 45}ms` : "0ms" }}
                    onClick={() => openSubject(s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSubject(s);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${s.name}: ${s.quizzesTaken} quizzes${s.avgScore > 0 ? `, ${s.avgScore}% average` : ""}. ${started ? "Continue learning" : "Start learning"}`}
                  >
                    <div className="subject-card-accent" style={{ background: color }}></div>
                    {badge(s.code)}
                    <div className="subject-code" style={{ color }}>{s.code}</div>
                    <div className="subject-name">{s.name}</div>
                    <div className="subject-stats-row">
                      <span className="s-stat-pill">{s.quizzesTaken} quiz{s.quizzesTaken === 1 ? "" : "zes"}</span>
                      {s.avgScore > 0 && <span className="s-stat-pill green">{s.avgScore}% avg</span>}
                      {s.topics?.length > 0 && <span className="s-stat-pill">{s.topics.length} topics</span>}
                    </div>
                    {started && s.avgScore > 0 && (
                      <div className="sj-progress" aria-hidden="true">
                        <div
                          className="sj-progress-fill"
                          style={{ width: gridIn ? `${s.avgScore}%` : "0%", background: color }}
                        />
                      </div>
                    )}
                    <div className="subject-arrow">
                      {started ? "Continue Learning" : "Start Learning"}
                      <HiOutlineArrowRight size={14} aria-hidden="true" />
                    </div>
                  </div>
                );
              })}

              {visibleSubjects.length === 0 && (
                <div className="sj-no-results">
                  <p>No subjects match your search</p>
                  <span>Try a different keyword or reset the filters.</span>
                  <button className="sj-btn ghost sm" onClick={resetFilters}>Reset filters</button>
                </div>
              )}

            {/* ADD SUBJECT CARD */}
            {!isAddingSubject ? (
              <div
                className="subject-card add-card"
                onClick={() => setIsAddingSubject(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsAddingSubject(true);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Add a new subject"
              >
                <div className="subject-card-accent add-accent"></div>
                <div className="subject-badge add-badge">
                  <HiOutlinePlus size={24} />
                </div>
                <div className="subject-code add-title">Add Subject</div>
                <div className="subject-name">Create a new subject & topics</div>
                <div className="subject-stats-row">
                  <span className="s-stat-pill blue">+ Add New</span>
                </div>
                <div className="subject-arrow add-arrow">+ Create</div>
              </div>
            ) : (
              <div className="subject-card add-card active-form" onClick={(e) => e.stopPropagation()}>
                <div className="subject-card-accent add-accent"></div>
                <div className="add-form-title">New Subject</div>
                <form onSubmit={handleAddSubject} className="add-card-form">
                  <input
                    type="text"
                    placeholder="Subject Code (e.g. PY)"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="add-card-input"
                    maxLength={8}
                    required
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. Python)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="add-card-input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Topics (comma separated)"
                    value={newSubjectTopics}
                    onChange={(e) => setNewSubjectTopics(e.target.value)}
                    className="add-card-input"
                  />
                  <div className="add-card-actions">
                    <button type="submit" className="add-submit-btn">Save</button>
                    <button type="button" className="add-cancel-btn" onClick={() => setIsAddingSubject(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          </>

        ) : section === "result" && result ? (
          <div className="xp-result" key={`result-${quiz?.topic}-${result.result.score}`}>
            <div className="xp-quiz-bg" aria-hidden="true">
              <span className="xp-orb xp-orb-1" /><span className="xp-orb xp-orb-2" /><span className="xp-orb xp-orb-3" />
            </div>
            {result.result.score >= 70 && (
              <div className="xp-confetti" aria-hidden="true">
                {Array.from({ length: 26 }).map((_, i) => (
                  <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 13) * 0.22}s`, animationDuration: `${2.6 + ((i * 53) % 20) / 10}s`, background: ["#2563eb", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"][i % 5] }} />
                ))}
              </div>
            )}
            <div className="xp-res-hero xp-rise">
              <div className="xp-trophy">
                <span className="xp-pulse" /><span className="xp-pulse xp-pulse-2" />
                <span className="xp-trophy-core">{result.result.score >= 70 ? "🏆" : result.result.score >= 40 ? "📚" : "💪"}</span>
              </div>
              <div className="xp-res-copy">
                <p className="xp-eyebrow dark"><span className="xp-eyebrow-dot" /> RESULT · {quiz?.topic || activeTopic?.name} · {selected.code}</p>
                <h2>{result.result.score >= 70 ? (<>Excellent <span className="xp-grad-text">Work!</span></>) : result.result.score >= 40 ? (<>Good <span className="xp-grad-text">Effort!</span></>) : (<>Keep <span className="xp-grad-text">Pushing!</span></>)}</h2>
                <p className="xp-res-sub">{result.result.score >= 70 ? "You nailed the core concepts — now lock in mastery." : result.result.score >= 40 ? "Solid base. Fix the gaps below and you'll jump fast." : "Every topper started here — review the breakdown and retry."}</p>
                <div className="xp-res-pills">
                  <span className={`xp-status ${result.result.score >= 70 ? "pass" : "review"}`}>{result.result.score >= 70 ? "✓ Passed" : "◉ Needs Review"}</span>
                  <span className="xp-res-topic">{quiz?.topic || activeTopic?.name}</span>
                </div>
              </div>
              <div className="xp-score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="11" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={result.result.score >= 70 ? "#22c55e" : result.result.score >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="11" strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset={326.7 - (326.7 * result.result.score) / 100}
                    className="xp-ring-draw" />
                </svg>
                <div className="xp-score-center"><strong>{result.result.score}%</strong><span>score</span></div>
              </div>
            </div>

            <div className="xp-stat-row">
              {[
                { label: "Score", val: `${result.result.score}%`, icon: "🎯", cls: "blue", d: "60ms" },
                { label: "Correct", val: `${result.result.correctAnswers}/${result.result.totalQuestions}`, icon: "✅", cls: "green", d: "130ms" },
                { label: "Accuracy", val: `${Math.round((result.result.correctAnswers / Math.max(1, result.result.totalQuestions)) * 100)}%`, icon: "⚡", cls: "amber", d: "200ms" },
              ].map((s) => (
                <div key={s.label} className={`xp-stat xp-rise xp-stat-${s.cls}`} style={{ animationDelay: s.d }}>
                  <span className="xp-stat-icon">{s.icon}</span>
                  <div><div className="xp-stat-val">{s.val}</div><div className="xp-stat-label">{s.label}</div></div>
                </div>
              ))}
            </div>

            <div className="xp-review-head xp-rise" style={{ animationDelay: "220ms" }}>
              <h3>📝 Detailed Question & Explanation Review</h3>
              <p>Tap through every miss — explanations turn mistakes into marks.</p>
            </div>
            <div className="xp-review-list">
              {quiz.questions.map((q, i) => {
                const isCorrect = answers[i] === q.correctAnswer;
                return (
                  <div className={`xp-rcard xp-rise ${isCorrect ? "ok" : "bad"}`} style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }} key={i}>
                    <div className="xp-rcard-top">
                      <span className="xp-qnum">Q{i + 1}</span>
                      <span className={`xp-verdict ${isCorrect ? "ok" : "bad"}`}>{isCorrect ? "✓ Right" : "✕ Wrong"}</span>
                    </div>
                    <p className="xp-rcard-q">{q.question}</p>
                    <div className="xp-rcard-ans">
                      <div className={`xp-ans ${isCorrect ? "good" : "meh"}`}><span>Your Answer</span><strong>{answers[i] || "Skipped"}</strong></div>
                      {!isCorrect && <div className="xp-ans good"><span>Correct Answer</span><strong>{q.correctAnswer}</strong></div>}
                    </div>
                    {(q.explanation || !isCorrect) && (
                      <div className="xp-explain"><span>💡</span><div><strong>Explanation: </strong>{q.explanation || `The correct answer is "${q.correctAnswer}". Concept: ${q.topic || quiz.topic}.`}</div></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="xp-weak xp-rise" style={{ animationDelay: "150ms" }}>
              <div className="xp-weak-glow" aria-hidden="true" />
              <div className="xp-weak-head">
                <span className="xp-weak-icon">🚨</span>
                <div><h3>Weak Topic Intelligence & AI Tutor Feedback</h3><p>Personalized analysis based on your quiz performance</p></div>
              </div>
              {quiz.questions.some((q, i) => answers[i] !== q.correctAnswer) && (
                <div className="xp-weak-pills">
                  <span className="xp-weak-label">Weak spots:</span>
                  {Array.from(new Set(quiz.questions.filter((q, i) => answers[i] !== q.correctAnswer).map(q => q.topic || quiz.topic))).map(top => (
                    <span className="xp-weak-pill" key={top}>⚠️ {top}</span>
                  ))}
                </div>
              )}
              {result.feedback && <div className="xp-feedback"><pre>{result.feedback}</pre></div>}
              <Link to="/practice" state={{ weakTopic: (result.weakTopics && result.weakTopics[0]) || quiz.topic, subject: quiz.subject }} className="xp-weak-cta">
                🤖 Practice {(result.weakTopics && result.weakTopics[0]) || "Weak Topics"} in AI Tutor →
              </Link>
            </div>

            <div className="xp-res-actions xp-rise" style={{ animationDelay: "200ms" }}>
              <button className="xp-mode-cta primary" style={{ minWidth: 200 }} onClick={() => { setSection("test"); setQuiz(null); setAnswers({}); setResult(null); }}>Try Another Test →</button>
              <button className="xp-mode-cta" style={{ minWidth: 160 }} onClick={backToTopics}>All Topics</button>
            </div>
          </div>

        ) : section === "quiz" ? (
          <div className="xp-quiz" key={`quiz-${quiz.topic}`}>
            <div className="xp-quiz-bg" aria-hidden="true">
              <span className="xp-orb xp-orb-1" /><span className="xp-orb xp-orb-2" />
              <span className="xp-float xp-f1" /><span className="xp-float xp-f3" /><span className="xp-float xp-f5" />
            </div>
            <div className="xp-quiz-top xp-rise">
              <button className="s-back-btn" onClick={() => { setSection("test"); setQuiz(null); setAnswers({}); setResult(null); }}>← Test Menu</button>
              <div className="xp-quiz-top-mid">
                <span className="xp-quiz-topic"><span className="xp-live-dot" />{quiz.topic}</span>
                <div className="xp-quiz-bar"><span className="xp-quiz-fill" style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }} /></div>
              </div>
              <div className="xp-quiz-count">
                <svg viewBox="0 0 36 36" className="xp-ring-sm">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(Object.keys(answers).length / quiz.questions.length) * 97.4} 97.4`}
                    style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.22,1,0.36,1)", transform: "rotate(-90deg)", transformOrigin: "center" }} />
                </svg>
                <span><strong>{Object.keys(answers).length}</strong>/{quiz.questions.length}</span>
              </div>
            </div>
            <div className="xp-palette xp-rise" style={{ animationDelay: "80ms" }} aria-hidden="true">
              {quiz.questions.map((_, i) => (
                <span key={i} className={`xp-dot ${answers[i] ? "done" : ""}`} style={{ animationDelay: `${i * 18}ms` }}>{i + 1}</span>
              ))}
            </div>
            <div className="xp-questions">
              {quiz.questions.map((q, i) => {
                const answered = !!answers[i];
                return (
                  <div id={`xp-q-${i}`} key={i} className={`xp-qcard xp-rise ${answered ? "answered" : ""}`} style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}>
                    <div className="xp-qhead">
                      <span className="xp-qnum">Q{i + 1}</span>
                      <p className="xp-qtext">{q.question}</p>
                      {answered && <span className="xp-qcheck">✓</span>}
                    </div>
                    <div className="xp-opts">
                      {q.options.map((opt, oi) => {
                        const sel = answers[i] === opt;
                        return (
                          <label key={oi} className={`xp-opt ${sel ? "selected" : ""}`}>
                            <input type="radio" name={`q${i}`} value={opt} checked={sel} onChange={() => setAnswers((prev) => ({ ...prev, [i]: opt }))} />
                            <span className="xp-opt-letter">{String.fromCharCode(65 + oi)}</span>
                            <span className="xp-opt-text">{opt}</span>
                            <span className="xp-opt-tick">✓</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="xp-submitbar xp-rise" style={{ animationDelay: "120ms" }}>
              <div className="xp-submit-info">
                <strong>{Object.keys(answers).length}/{quiz.questions.length} answered</strong>
                <span>{quiz.questions.length - Object.keys(answers).length === 0 ? "All set — unleash your score!" : `${quiz.questions.length - Object.keys(answers).length} more to go…`}</span>
              </div>
              <button className={`xp-submit-btn ${Object.keys(answers).length >= quiz.questions.length ? "ready" : ""}`} onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length || quizLoading}>
                {quizLoading ? (<><span className="loading-ring sm" /> Submitting…</>) : (<>Submit Quiz →</>)}
              </button>
            </div>
          </div>

        ) : (
          <>
            {/* TOPIC BANNER — visible across all topic-level sections */}
            <div className="topic-banner" style={{ background: `linear-gradient(135deg, ${colorOf(selected.code)}18, #f8fafc)` }}>
              {badge(selected.code)}
              <div style={{ flex: 1 }}>
                <div className="topic-banner-code">{selected.code} {activeTopic && <span className="topic-banner-current">· {activeTopic.name}</span>}</div>
                <div className="topic-banner-name">{selected.name}</div>
              </div>
              {activeTopic && section !== "topics" && (
                <button className="s-back-btn" onClick={backToTopics}>← All Topics</button>
              )}
            </div>

            {section === "notes" ? (
              <div className="notes-view">
                {notesLoading ? (
                  <div className="subjects-loading"><div className="loading-ring"></div><p>Generating detailed notes…</p></div>
                ) : (
                  <div className="notes-card">
                    <div className="notes-head">
                      <div className="notes-head-icon"><HiOutlineDocumentText size={26} /></div>
                      <div>
                        <h3>Detailed Notes · {activeTopic.name}</h3>
                        <p>Complete exam-oriented notes for {selected.name}</p>
                      </div>
                    </div>
                    <div className="notes-body">{renderNotes(notes)}</div>
                    <div className="notes-cta">
                      <p>Want even more detail, examples, or have doubts about this topic?</p>
                      <Link to="/practice" className="notes-cta-btn">
                        Ask the AI Tutor for more detail →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : section === "video" ? (
              <div className="xp-video" key={`video-${activeTopic?.name}`}>
                <div className="xp-video-bg" aria-hidden="true">
                  <span className="xp-orb xp-orb-1" />
                  <span className="xp-orb xp-orb-2" />
                  <span className="xp-orb xp-orb-3" />
                  <span className="xp-float xp-f1" /> <span className="xp-float xp-f2" />
                  <span className="xp-float xp-f3" /> <span className="xp-float xp-f4" />
                  <span className="xp-float xp-f5" /> <span className="xp-float xp-f6" />
                </div>
                <div className="xp-video-hero xp-rise" style={{ animationDelay: "0ms" }}>
                  <a className="xp-player" href={activeTopic.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${activeTopic.name} on YouTube`}>
                    <div className="xp-player-screen">
                      <div className="xp-player-grid" aria-hidden="true" />
                      <div className="xp-player-badge">▶ &nbsp;NOW PLAYING · YOUTUBE CURATED</div>
                      <div className="xp-eq" aria-hidden="true">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <span key={i} style={{ animationDelay: `${(i % 14) * 0.12}s`, animationDuration: `${0.9 + ((i * 37) % 10) / 10}s` }} />
                        ))}
                      </div>
                      <div className="xp-play-wrap">
                        <span className="xp-pulse" />
                        <span className="xp-pulse xp-pulse-2" />
                        <span className="xp-play-btn"><HiOutlinePlay size={34} /></span>
                      </div>
                      <div className="xp-player-meta">
                        <div className="xp-live-dot" />
                        <div>
                          <div className="xp-player-topic">{activeTopic.name}</div>
                          <div className="xp-player-sub">{selected.name} · {selected.code} · HD Lecture</div>
                        </div>
                        <span className="xp-hd">4K</span>
                      </div>
                    </div>
                  </a>
                  <div className="xp-video-copy">
                    <p className="xp-eyebrow"><span className="xp-eyebrow-dot" /> VIDEO LAB · {selected.code}</p>
                    <h2>Watch <span className="xp-grad-text">{activeTopic.name}</span> come alive</h2>
                    <p className="xp-video-desc">Hand-tuned YouTube searches for this exact topic — pick your learning vibe. Each card opens the freshest, most-viewed lectures in a new tab.</p>
                    <div className="xp-chip-row">
                      <span className="xp-chip">⚡ Crash Course</span>
                      <span className="xp-chip">🎓 Deep Dive</span>
                      <span className="xp-chip">📝 PYQ + Tricks</span>
                    </div>
                    <a className="xp-cta-red" href={activeTopic.videoUrl} target="_blank" rel="noopener noreferrer">
                      <span className="xp-cta-play"><HiOutlinePlay size={16} /></span> Watch Best Match on YouTube
                      <HiOutlineArrowRight size={16} />
                    </a>
                    <p className="xp-video-hint">Tip: filter by most-viewed · Neso Academy · Gate Smashers · Abdul Bari · Jenny's Lectures</p>
                  </div>
                </div>

                <div className="xp-playlist">
                  {[
                    { tag: "⚡ Fastest", title: "Crash Course", desc: "Full topic in 15–20 min, rapid revision", grad: "linear-gradient(135deg,#f43f5e,#f97316)", query: `${activeTopic.name} ${selected.name} crash course one shot`, dur: "18:42" },
                    { tag: "🎓 In Depth", title: "Deep Lecture", desc: "Concept-first long lecture, zero gaps", grad: "linear-gradient(135deg,#2563eb,#06b6d4)", query: `${activeTopic.name} ${selected.name} full lecture in depth`, dur: "52:10" },
                    { tag: "📝 Exam Mode", title: "PYQ + Tricks", desc: "Previous-year questions & shortcuts", grad: "linear-gradient(135deg,#10b981,#059669)", query: `${activeTopic.name} ${selected.name} previous year questions tricks`, dur: "27:35" },
                    { tag: "🎧 Shorts", title: "Visual Bites", desc: "Shorts & animations for memory hooks", grad: "linear-gradient(135deg,#8b5cf6,#ec4899)", query: `${activeTopic.name} ${selected.name} explained visually shorts`, dur: "08:19" },
                  ].map((v, i) => (
                    <a
                      key={v.title}
                      className="xp-vcard xp-rise"
                      style={{ animationDelay: `${120 + i * 90}ms` }}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="xp-vthumb" style={{ background: v.grad }}>
                        <span className="xp-vtag">{v.tag}</span>
                        <span className="xp-vplay"><HiOutlinePlay size={18} /></span>
                        <span className="xp-vdur">{v.dur}</span>
                        <span className="xp-vshine" />
                      </div>
                      <div className="xp-vbody">
                        <div className="xp-vtitle">{v.title}</div>
                        <div className="xp-vdesc">{v.desc}</div>
                        <div className="xp-vgo">Open on YouTube <HiOutlineArrowRight size={13} /></div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="xp-marquee xp-rise" style={{ animationDelay: "420ms" }} aria-hidden="true">
                  <div className="xp-marquee-track">
                    {[0, 1].map((k) => (
                      <span key={k}>▶ WATCH AT 1.5x SPEED &nbsp;·&nbsp; ✍ TAKE NOTES WHILE WATCHING &nbsp;·&nbsp; ⏸ PAUSE & RECALL &nbsp;·&nbsp; 🧠 TEACH IT BACK &nbsp;·&nbsp; 🔁 REVISE IN 24 HRS &nbsp;·&nbsp;</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : section === "test" ? (
              <div className="test-view">
                {descLoading ? (
                  <div className="subjects-loading"><div className="loading-ring"></div><p>Generating descriptive questions…</p></div>
                ) : qSubmitted ? (
                  /* ── REVIEW: user answers vs model answers ── */
                  <div className="desc-list">
                    <div className="desc-review-head">
                      <h3 className="review-heading">Answers Submitted</h3>
                      <p>Compare your written answers with the model answers below.</p>
                    </div>
                    {descQ.map((q, i) => (
                      <div className="desc-card" key={i}>
                        <div className="desc-q-head">
                          <span className="review-badge">Q{i + 1}</span>
                          <span className="desc-q-text">{q.question}</span>
                          {q.marks && <span className="desc-marks">{q.marks} marks</span>}
                        </div>
                        <div className="desc-review-answers">
                          <div className="desc-user-ans">
                            <strong>Your Answer:</strong>
                            <p>{userAnswers[i] || "No answer given."}</p>
                          </div>
                          <div className="desc-model-ans">
                            <strong>Model Answer:</strong>
                            <p>{q.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="result-btn primary" onClick={() => { setQSubmitted(false); setQIndex(0); }} style={{ alignSelf: "flex-start" }}>
                      Try Again
                    </button>
                  </div>
                ) : descQ.length > 0 ? (
                  /* ── GOOGLE-FORMS STYLE: one question + answer box ── */
                  <div className="gform">
                    <div className="gform-progress">
                      <div className="gform-progress-fill" style={{ width: `${((qIndex + 1) / descQ.length) * 100}%` }}></div>
                    </div>
                    <div className="gform-question">
                      <span className="gform-count">Question {qIndex + 1} of {descQ.length}</span>
                      <span className="gform-marks">{descQ[qIndex].marks} marks</span>
                    </div>
                    <h3 className="gform-q">{descQ[qIndex].question}</h3>
                    <label className="gform-label" htmlFor="gform-answer">Your Answer</label>
                    <textarea
                      id="gform-answer"
                      className="gform-textarea"
                      placeholder="Write your answer here…"
                      value={userAnswers[qIndex] || ""}
                      autoFocus
                      onChange={(e) => setUserAnswers((prev) => ({ ...prev, [qIndex]: e.target.value }))}
                      onPaste={noClipboard}
                      onCopy={noClipboard}
                      onCut={noClipboard}
                      onDrop={noClipboard}
                      onDragStart={noClipboard}
                    />
                    <p className="gform-lock-hint">Copy & paste is disabled in the answer section — type your answer directly.</p>
                    <div className="gform-nav">
                      <button className="s-back-btn" onClick={() => setQIndex((i) => Math.max(0, i - 1))} disabled={qIndex === 0}>
                        <HiOutlineChevronLeft size={16} /> Previous
                      </button>
                      <span className="gform-counter">
                        <HiOutlineCheckCircle size={16} />
                        {Object.keys(userAnswers).length}/{descQ.length} answered
                      </span>
                      {qIndex < descQ.length - 1 ? (
                        <button className="gform-next-btn" onClick={() => setQIndex((i) => i + 1)}>
                          Next <HiOutlineChevronRight size={16} />
                        </button>
                      ) : (
                        <button className="gform-next-btn" onClick={() => setQSubmitted(true)}>
                          Submit Answers
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── INNOVATIVE MODE SELECTION ── */
                  <div className="xp-test" key={`test-${activeTopic?.name}`}>
                    <div className="xp-test-bg" aria-hidden="true">
                      <span className="xp-orb xp-orb-1" />
                      <span className="xp-orb xp-orb-2" />
                      <span className="xp-float xp-f1" /> <span className="xp-float xp-f3" />
                      <span className="xp-float xp-f5" /> <span className="xp-float xp-f2" />
                    </div>
                    <div className="xp-test-hero xp-rise">
                      <div className="xp-timer-orb" aria-hidden="true">
                        <span className="xp-timer-ring" />
                        <span className="xp-timer-core"><HiOutlineClipboardCheck size={26} /></span>
                        <span className="xp-timer-spark xp-ts1">✦</span>
                        <span className="xp-timer-spark xp-ts2">✦</span>
                        <span className="xp-timer-spark xp-ts3">●</span>
                      </div>
                      <div className="xp-test-copy">
                        <p className="xp-eyebrow dark"><span className="xp-eyebrow-dot" /> TEST ARENA · {selected.code} · {activeTopic.name}</p>
                        <h2>How do you want to <span className="xp-grad-text">prove it?</span></h2>
                        <p className="xp-test-sub">Two arenas, one goal — mastery. Write like it's the final exam, or sprint through 20 rapid-fire MCQs.</p>
                        <div className="xp-steps">
                          <span className="xp-step done"><i>1</i> Pick arena</span>
                          <span className="xp-step-line" />
                          <span className="xp-step"><i>2</i> Attempt</span>
                          <span className="xp-step-line" />
                          <span className="xp-step"><i>3</i> Review AI feedback</span>
                        </div>
                      </div>
                      <div className="xp-level-card">
                        <p className="xp-level-label">SELECT DIFFICULTY</p>
                        <div className="xp-diff-row">
                          {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                            <button key={key} className={`xp-diff ${difficulty === key ? "active" : ""}`}
                              style={difficulty === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border, boxShadow: `0 4px 16px ${cfg.color}33` } : {}}
                              onClick={() => setDifficulty(key)}>
                              <span className="xp-diff-dot" style={{ background: cfg.color }} />
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                        <div className="xp-level-meter">
                          <span className={`xp-meter-fill lvl-${difficulty}`} />
                        </div>
                        <p className="xp-level-hint">{difficulty === "easy" ? "Warm-up · build confidence" : difficulty === "medium" ? "Exam standard · balanced" : "Challenger · rank-booster"}</p>
                      </div>
                    </div>

                    <div className="xp-modes">
                      <button className="xp-mode xp-rise xp-mode-theory" style={{ animationDelay: "100ms" }} onClick={() => loadDescriptive(activeTopic)}>
                        <span className="xp-mode-glow" />
                        <span className="xp-mode-top">
                          <span className="xp-mode-icon theory"><HiOutlineDocumentText size={26} /></span>
                          <span className="xp-mode-badge">✍ WRITTEN · 5 Qs</span>
                        </span>
                        <span className="xp-mode-title">Descriptive Arena</span>
                        <span className="xp-mode-desc">University-style theory on <strong>{activeTopic.name}</strong> — one question at a time, distraction-free answer box. Copy-paste locked, like a real exam hall.</span>
                        <span className="xp-mode-feats">
                          <span>📄 Model answers</span><span>⏱ Self-paced</span><span>🎯 {`5 marks each`}</span>
                        </span>
                        <span className="xp-mode-cta">Enter Arena <HiOutlineArrowRight size={16} /></span>
                      </button>

                      <button className="xp-mode xp-rise xp-mode-mcq" style={{ animationDelay: "200ms" }} onClick={() => generateQuiz(activeTopic, 20)} disabled={quizLoading}>
                        <span className="xp-mode-glow" />
                        <span className="xp-mode-top">
                          <span className="xp-mode-icon mcq"><HiOutlineClipboardCheck size={26} /></span>
                          <span className="xp-mode-badge hot"><span className="xp-blink" />🔥 MOST PICKED · 20 Qs</span>
                        </span>
                        <span className="xp-mode-title">MCQ Blitz</span>
                        <span className="xp-mode-desc">20 AI-generated rapid-fire MCQs on <strong>{activeTopic.name}</strong> at <strong>{difficulty}</strong> level — instant score, explanations & weak-topic radar.</span>
                        <span className="xp-mode-feats">
                          <span>⚡ Instant result</span><span>💡 Explanations</span><span>🚨 Weak-topic AI</span>
                        </span>
                        <span className="xp-mode-cta primary">{quizLoading ? (<><span className="loading-ring sm" /> Generating 20 MCQs…</>) : (<>Start 20 MCQs <HiOutlineArrowRight size={16} /></>)}</span>
                      </button>
                    </div>

                    <div className="xp-strip xp-rise" style={{ animationDelay: "300ms" }}>
                      <span><HiOutlineSparkles size={15} /> AI grades your MCQs instantly</span>
                      <span className="xp-strip-dot" />
                      <span><HiOutlineNewspaper size={15} /> Descriptive builds exam writing muscle</span>
                      <span className="xp-strip-dot" />
                      <span>🏆 Beat your {selected.code} average</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}

        {selected && section === "topics" && (
          <div className="topic-grid">
            {selected.topics.map((topic) => (
              <div key={topic.name} className="topic-card">
                <div className="topic-card-name">{topic.name}</div>
                <div className="topic-card-actions">
                  <button className="topic-action notes" onClick={() => openSection("notes", topic)}><HiOutlineDocumentText size={16} /> Notes</button>
                  <button className="topic-action test" onClick={() => openSection("test", topic)}><HiOutlineClipboardCheck size={16} /> Test</button>
                  <button className="topic-action video" onClick={() => openSection("video", topic)}><HiOutlinePlay size={16} /> YouTube</button>
                </div>
              </div>
            ))}

            {/* ADD TOPIC CARD */}
            {!isAddingTopic ? (
              <div className="topic-card add-card" onClick={() => setIsAddingTopic(true)}>
                <div className="add-topic-icon-wrap">
                  <HiOutlinePlus size={24} />
                </div>
                <div className="topic-card-name add-topic-title">Add New Topic</div>
                <div className="topic-card-actions" style={{ marginTop: "auto" }}>
                  <button className="topic-action add-topic-act-btn">+ Add Topic</button>
                </div>
              </div>
            ) : (
              <div className="topic-card add-card active-form" onClick={(e) => e.stopPropagation()}>
                <div className="add-form-title">New Topic</div>
                <form onSubmit={handleAddTopic} className="add-card-form">
                  <input
                    type="text"
                    placeholder="Topic Name (e.g. Recursion)"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="add-card-input"
                    required
                    autoFocus
                  />
                  <div className="add-card-actions">
                    <button type="submit" className="add-submit-btn">Save Topic</button>
                    <button type="button" className="add-cancel-btn" onClick={() => setIsAddingTopic(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;