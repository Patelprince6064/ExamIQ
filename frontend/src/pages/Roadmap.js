import React, { useState } from "react";
import { SharedSidebar } from "../components/layout/SharedLayout";
import { apiGenerateRoadmap } from "../services/api";
import {
  HiOutlineMap,
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineFlag,
  HiOutlineLightningBolt,
  HiOutlineAcademicCap,
  HiOutlinePaperAirplane,
  HiOutlineCube,
  HiOutlineRefresh,
} from "react-icons/hi";
import "./Roadmap.css";

const POPULAR = ["React", "Python", "Machine Learning", "DSA", "Node.js", "SQL"];

const STEP_ICONS = [
  HiOutlineCube,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlinePaperAirplane,
  HiOutlineFlag,
];

const LOADING_TIPS = [
  "Mapping core fundamentals…",
  "Sequencing intermediate builds…",
  "Adding exam-grade milestones…",
  "Polishing your launch plan…",
];

function Roadmap() {
  const [skill, setSkill] = useState("");
  const [submittedSkill, setSubmittedSkill] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(new Set());
  const [tipIdx, setTipIdx] = useState(0);

  const handleGenerate = async (e, preset) => {
    if (e) e.preventDefault();
    const target = (preset ?? skill).trim();
    if (!target || loading) return;

    setLoading(true);
    setError(null);
    setRoadmap([]);
    setDone(new Set());
    setSubmittedSkill(target);
    setSkill(target);

    const tipTimer = setInterval(
      () => setTipIdx((i) => (i + 1) % LOADING_TIPS.length),
      1400
    );

    try {
      const res = await apiGenerateRoadmap(target);
      if (res.roadmap) {
        setRoadmap(res.roadmap);
      } else {
        setError(res.message || "Failed to generate roadmap.");
      }
    } catch (err) {
      setError("An error occurred while generating the roadmap.");
    } finally {
      clearInterval(tipTimer);
      setLoading(false);
    }
  };

  const toggleDone = (idx) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const resetAll = () => {
    setRoadmap([]);
    setSubmittedSkill("");
    setSkill("");
    setDone(new Set());
    setError(null);
  };

  const totalTopics = roadmap.reduce(
    (n, s) => n + (s.topics?.length || 0),
    0
  );
  const pct =
    roadmap.length === 0
      ? 0
      : Math.round((done.size / roadmap.length) * 100);

  return (
    <div className="dashboard">
      <SharedSidebar />
      <main className="main rm-main">
        <div className="rm-bg" aria-hidden="true">
          <span className="rm-orb rm-orb-1" />
          <span className="rm-orb rm-orb-2" />
          <span className="rm-float rm-f1" />
          <span className="rm-float rm-f2" />
          <span className="rm-float rm-f3" />
          <span className="rm-float rm-f4" />
          <span className="rm-float rm-f5" />
        </div>

        {/* ── HERO ── */}
        <header className="rm-hero rm-rise">
          <span className="rm-hero-icon">
            <HiOutlineMap size={24} />
          </span>
          <div className="rm-hero-copy">
            <p className="rm-eyebrow">
              <span className="rm-eyebrow-dot" /> SKILL ROADMAP LAB
            </p>
            <h1>
              Chart your path to{" "}
              <span className="rm-grad">
                {submittedSkill || "mastery"}
              </span>
            </h1>
            <p>
              Type any skill — get a staged, milestone-driven learning
              journey with topics, order and momentum built in.
            </p>
          </div>
          {roadmap.length > 0 && (
            <button className="rm-ghost-btn" onClick={resetAll}>
              <HiOutlineRefresh size={15} /> New skill
            </button>
          )}
        </header>

        {/* ── INPUT ── */}
        <section className="rm-input-card rm-rise" style={{ animationDelay: "90ms" }}>
          <form className="rm-form" onSubmit={handleGenerate}>
            <span className="rm-search-icon">
              <HiOutlineSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="e.g. React, Python, Machine Learning…"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rm-input"
              aria-label="Skill to learn"
            />
            <button
              type="submit"
              className="rm-submit"
              disabled={loading || !skill.trim()}
            >
              {loading ? (
                <>
                  <span className="rm-spinner" /> Generating…
                </>
              ) : (
                <>
                  <HiOutlineSparkles size={16} /> Generate Roadmap
                  <HiOutlineArrowRight size={15} />
                </>
              )}
            </button>
          </form>
          <div className="rm-chips">
            <span className="rm-chips-label">Try:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                className={`rm-chip${skill === p ? " active" : ""}`}
                onClick={() => handleGenerate(null, p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>
          {error && <p className="rm-error">⚠️ {error}</p>}
        </section>

        {/* ── LOADING ── */}
        {loading && (
          <section className="rm-loading rm-rise">
            <div className="rm-load-bar">
              <span className="rm-load-fill" />
            </div>
            <p className="rm-load-tip" key={tipIdx}>
              <HiOutlineSparkles size={15} /> {LOADING_TIPS[tipIdx]}
            </p>
            <div className="rm-skeletons">
              {[0, 1, 2].map((i) => (
                <div
                  className="rm-skel rm-rise"
                  style={{ animationDelay: `${i * 120}ms` }}
                  key={i}
                >
                  <span className="rm-skel-dot" />
                  <div>
                    <span className="rm-skel-line w60" />
                    <span className="rm-skel-line w90" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── EMPTY ── */}
        {!loading && roadmap.length === 0 && !error && (
          <section className="rm-empty rm-rise" style={{ animationDelay: "160ms" }}>
            <div className="rm-empty-orb">
              <HiOutlineMap size={30} />
              <span className="rm-pulse" />
            </div>
            <h2>Your journey map appears here</h2>
            <p>
              Enter a skill above — or tap a popular chip — and watch a
              step-by-step path unfold, milestone by milestone.
            </p>
            <div className="rm-empty-steps">
              <span><i>1</i> Type a skill</span>
              <span className="rm-empty-line" />
              <span><i>2</i> Get stages</span>
              <span className="rm-empty-line" />
              <span><i>3</i> Tick them off</span>
            </div>
          </section>
        )}

        {/* ── JOURNEY ── */}
        {!loading && roadmap.length > 0 && (
          <section className="rm-journey">
            <div className="rm-journey-head rm-rise">
              <div>
                <h2>
                  Roadmap for{" "}
                  <span className="rm-grad">“{submittedSkill}”</span>
                </h2>
                <p>
                  {roadmap.length} stages · {totalTopics} topics · tap a
                  milestone to mark it complete
                </p>
              </div>
              <div className="rm-progress">
                <svg viewBox="0 0 36 36" className="rm-ring">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#2563eb"
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
                    style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)", transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
                <div>
                  <strong>{pct}%</strong>
                  <span>{done.size}/{roadmap.length} done</span>
                </div>
              </div>
            </div>

            <div className="rm-timeline">
              <span className="rm-line"><span className="rm-line-fill" style={{ height: `${pct}%` }} /></span>
              {roadmap.map((stepData, index) => {
                const Icon = STEP_ICONS[index % STEP_ICONS.length];
                const isDone = done.has(index);
                const isLast = index === roadmap.length - 1;
                return (
                  <article
                    key={index}
                    className={`rm-step rm-rise${isDone ? " done" : ""}${isLast ? " last" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}
                  >
                    <button
                      className="rm-node"
                      onClick={() => toggleDone(index)}
                      aria-label={isDone ? `Mark stage ${index + 1} incomplete` : `Mark stage ${index + 1} complete`}
                      title={isDone ? "Mark incomplete" : "Mark complete"}
                    >
                      {isDone ? <HiOutlineCheck size={16} /> : <Icon size={16} />}
                      <span className="rm-node-pulse" />
                    </button>
                    <div className="rm-card">
                      <div className="rm-card-top">
                        <span className="rm-stage">STAGE {stepData.step || index + 1}</span>
                        {isLast && <span className="rm-finish">🏁 Finish line</span>}
                        {isDone && <span className="rm-done-tag">✓ Completed</span>}
                      </div>
                      <h3>{stepData.title}</h3>
                      <p>{stepData.description}</p>
                      {stepData.topics && stepData.topics.length > 0 && (
                        <div className="rm-topics">
                          {stepData.topics.map((topic, i) => (
                            <span key={i} className="rm-topic">
                              <span className="rm-topic-dot" />{topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        className={`rm-done-btn${isDone ? " undo" : ""}`}
                        onClick={() => toggleDone(index)}
                      >
                        {isDone ? "↩ Mark incomplete" : "✓ Mark complete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {pct === 100 && (
              <div className="rm-celebrate rm-rise">
                🎉 Roadmap complete — you mapped and finished “{submittedSkill}”. Pick your next skill above!
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Roadmap;
