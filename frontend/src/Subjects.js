import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  apiGetSubjects, apiGenerateQuiz, apiSubmitQuiz, apiGenerateDescriptive, apiGetTopicNotes
} from "./api";
import { SharedSidebar } from "./SharedLayout";
import {
  HiOutlineDocumentText,
  HiOutlineClipboardCheck,
  HiOutlinePlay,
  HiOutlineNewspaper,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlinePlus,
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

  const [isAddingTopic, setIsAddingTopic]     = useState(false);
  const [newTopicName, setNewTopicName]       = useState("");

  const videoUrlFor = (subjectName, topic) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} ${subjectName} lecture in depth`)}`;

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    apiGetSubjects()
      .then((data) => {
        const fetched = data.subjects || [];
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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

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
          <div>
            <h1>Subjects</h1>
            <p>Select a subject · Choose a topic · Study with Notes, Tests & Videos</p>
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
          <div className="subject-grid">
            {subjects.map((s, idx) => (
              <div key={s.code} className="subject-card" onClick={() => openSubject(s)}>
                <div className="subject-card-accent" style={{ background: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}></div>
                {badge(s.code)}
                <div className="subject-code" style={{ color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}>{s.code}</div>
                <div className="subject-name">{s.name}</div>
                <div className="subject-stats-row">
                  <span className="s-stat-pill">{s.quizzesTaken} quizzes</span>
                  {s.avgScore > 0 && <span className="s-stat-pill green">{s.avgScore}% avg</span>}
                </div>
                <div className="subject-arrow">Start →</div>
              </div>
            ))}

            {/* ADD SUBJECT CARD */}
            {!isAddingSubject ? (
              <div className="subject-card add-card" onClick={() => setIsAddingSubject(true)}>
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

        ) : section === "result" && result ? (
          <div className="result-screen">
            <div className="result-hero">
              <div className="result-emoji">{result.result.score >= 70 ? "🎉" : result.result.score >= 40 ? "📚" : "💪"}</div>
              <h2>{result.result.score >= 70 ? "Excellent Work!" : result.result.score >= 40 ? "Good Effort!" : "Keep Practicing!"}</h2>
              <p className="result-subtitle">{quiz?.topic || activeTopic?.name} · {selected.code}</p>
            </div>
            <div className="result-score-row">
              <div className="result-score-card"><div className="result-score-val">{result.result.score}%</div><div className="result-score-label">Score</div></div>
              <div className="result-score-card"><div className="result-score-val">{result.result.correctAnswers}/{result.result.totalQuestions}</div><div className="result-score-label">Correct Answers</div></div>
              <div className="result-score-card"><div className="result-score-val" style={{ color: result.result.score >= 70 ? "#22c55e" : "#ef4444" }}>{result.result.score >= 70 ? "Passed" : "Needs Review"}</div><div className="result-score-label">Status</div></div>
            </div>

            {/* ANSWER REVIEW WITH EXPLANATIONS */}
            <div className="result-review-section">
              <h3 className="review-heading">📝 Detailed Question & Explanation Review</h3>
              <div className="review-list">
                {quiz.questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correctAnswer;
                  return (
                    <div className={`review-card ${isCorrect ? 'correct' : 'wrong'}`} key={i}>
                      <div className="review-q-header">
                        <div className="review-q-title-row">
                          <span className="review-badge">Q{i + 1}</span>
                          <span className={`result-tag-badge ${isCorrect ? 'tag-correct' : 'tag-wrong'}`}>
                            {isCorrect ? "✓ Right" : "✕ Wrong"}
                          </span>
                        </div>
                        <p className="review-q-text-body">{q.question}</p>
                      </div>

                      <div className="review-ans-row">
                        <div className={`review-ans-box ${isCorrect ? 'green-bg' : 'red-bg'}`}>
                          <span className="ans-label">Your Answer:</span>
                          <span className="ans-val">{answers[i] || "Skipped"}</span>
                        </div>
                        {!isCorrect && (
                          <div className="review-ans-box green-bg">
                            <span className="ans-label">Correct Answer:</span>
                            <span className="ans-val">{q.correctAnswer}</span>
                          </div>
                        )}
                      </div>

                      {(q.explanation || !isCorrect) && (
                        <div className="review-explanation-box">
                          <span className="explanation-icon">💡</span>
                          <div>
                            <strong>Explanation:</strong> {q.explanation || `The correct answer is "${q.correctAnswer}". Concept: ${q.topic || quiz.topic}.`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WEAK TOPIC INTELLIGENCE & AI FEEDBACK */}
            <div className="weak-topic-feedback-card">
              <div className="weak-topic-head">
                <div className="weak-topic-icon">🚨</div>
                <div>
                  <h3>Weak Topic Intelligence & AI Tutor Feedback</h3>
                  <p>Personalized analysis based on your quiz performance</p>
                </div>
              </div>

              {/* Identified Weak Topics Pills */}
              {quiz.questions.some((q, i) => answers[i] !== q.correctAnswer) && (
                <div className="weak-topics-pills-row">
                  <span className="weak-topic-label">Identified Weak Topics:</span>
                  {Array.from(new Set(quiz.questions.filter((q, i) => answers[i] !== q.correctAnswer).map(q => q.topic || quiz.topic))).map(top => (
                    <span className="weak-topic-pill" key={top}>⚠️ {top}</span>
                  ))}
                </div>
              )}

              {result.feedback && (
                <div className="feedback-content-box">
                  <pre className="feedback-pre-text">{result.feedback}</pre>
                </div>
              )}

              <div className="weak-topic-actions">
                <Link
                  to="/practice"
                  state={{
                    weakTopic: (result.weakTopics && result.weakTopics[0]) || quiz.topic,
                    subject: quiz.subject,
                  }}
                  className="btn-practice-weak"
                >
                  🤖 Practice {(result.weakTopics && result.weakTopics[0]) || "Weak Topics"} in AI Tutor →
                </Link>
              </div>
            </div>

            <div className="result-actions">
              <button className="result-btn primary" onClick={() => { setSection("test"); setQuiz(null); setAnswers({}); setResult(null); }}>Try Another Test</button>
              <button className="result-btn" onClick={backToTopics}>All Topics</button>
            </div>
          </div>

        ) : section === "quiz" ? (
          <div className="quiz-screen">
            <div className="quiz-topbar">
              <button className="s-back-btn" onClick={() => { setSection("test"); setQuiz(null); setAnswers({}); setResult(null); }}>← Test Menu</button>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span className="quiz-topic-tag">{quiz.topic}</span>
                <span className="quiz-progress-txt">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              </div>
            </div>
            <div className="quiz-questions">
              {quiz.questions.map((q, i) => (
                <div className={`quiz-q-card ${answers[i] ? "answered" : ""}`} key={i}>
                  <div className="quiz-q-header-row">
                    <span className="quiz-q-badge">Q{i + 1}</span>
                    <p className="quiz-q-text">{q.question}</p>
                  </div>
                  <div className="quiz-options">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`quiz-option-label ${answers[i] === opt ? "selected" : ""}`}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers((prev) => ({ ...prev, [i]: opt }))} />
                        <span className="quiz-opt-letter">{String.fromCharCode(65 + oi)}</span>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="quiz-submit-btn" onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}>
              Submit Quiz ({Object.keys(answers).length}/{quiz.questions.length} answered)
            </button>
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
              <div className="video-view">
                <div className="video-card">
                  <div className="video-thumb">
                    <div className="video-play-btn"><HiOutlinePlay size={28} /></div>
                    <div className="video-thumb-label">YouTube Lecture</div>
                  </div>
                  <div className="video-info">
                    <h3>{activeTopic.name}</h3>
                    <p>Watch an in-depth video lecture on <strong>{activeTopic.name}</strong> from <strong>{selected.name}</strong>. Opens YouTube with the most relevant lectures for this exact topic.</p>
                    <a
                      className="video-link-btn"
                      href={activeTopic.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HiOutlinePlay size={16} /> Watch on YouTube
                    </a>
                    <p className="video-hint">Tip: look for the most-viewed lectures from trusted channels (Neso Academy, Gate Smashers, Abdul Bari…)</p>
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
                  /* ── MODE SELECTION ── */
                  <>
                    <div className="test-modes">
                      <div className="test-mode-card">
                        <div className="test-mode-icon"><HiOutlineDocumentText size={28} /></div>
                        <h3>Descriptive Questions</h3>
                        <p>Practice university-style theory questions on <strong>{activeTopic.name}</strong> — one question at a time, with a dedicated answer box.</p>
                        <button
                          className="test-mode-btn"
                          onClick={() => loadDescriptive(activeTopic)}
                        >
                          Start Questions →
                        </button>
                      </div>

                      <div className="test-mode-card mcq">
                        <div className="test-mode-icon"><HiOutlineClipboardCheck size={28} /></div>
                        <h3>MCQ Test</h3>
                        <p>Attempt a <strong>20-question</strong> AI-generated MCQ test on <strong>{activeTopic.name}</strong> with instant results.</p>
                        <div className="difficulty-row" style={{ justifyContent: "center" }}>
                          {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                            <button key={key} className={`diff-btn ${difficulty === key ? "active" : ""}`}
                              style={difficulty === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border } : {}}
                              onClick={() => setDifficulty(key)}>
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                        <button
                          className="test-mode-btn primary"
                          onClick={() => generateQuiz(activeTopic, 20)}
                          disabled={quizLoading}
                        >
                          {quizLoading ? "Generating 20 MCQs…" : "Start 20 MCQs →"}
                        </button>
                      </div>
                    </div>
                    <div className="topic-hint">
                      <HiOutlineNewspaper size={16} />
                      Choose a test mode for <strong>&nbsp;{activeTopic.name}</strong>
                    </div>
                  </>
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