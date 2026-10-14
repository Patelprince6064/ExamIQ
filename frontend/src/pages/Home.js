import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineShieldExclamation,
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineTrendingUp,
  HiOutlineBookOpen,
  HiOutlineLightningBolt,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUpload,
  HiOutlineFlag,
  HiOutlineEye,
} from "react-icons/hi";
import "./Home.css";
import TextReveal from "../components/landing/TextReveal";
import Marquee from "../components/landing/Marquee";
import DottedGlobe from "../components/landing/DottedGlobe";
import logo from "../assets/logo.png";
import circuitBrain from "../assets/circuit-brain.png";

/* ── One-shot scroll reveal (transform + opacity only) ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(
      ".rv-up, .rv-left, .rv-right, .rv-scale, .ex-steps"
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#contact", label: "Contact" },
];

const VALUE_POINTS = [
  { icon: HiOutlineSparkles, label: "Personalized practice" },
  { icon: HiOutlineEye, label: "Intelligent insights" },
  { icon: HiOutlineTrendingUp, label: "Progress tracking" },
];

const FEATURES = [
  {
    icon: HiOutlineSparkles,
    title: "AI Question Generator",
    desc: "Create practice questions for selected subjects and topics.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "Smart PDF Learning",
    desc: "Transform uploaded study material into useful practice questions.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Performance Analytics",
    desc: "Track accuracy and progress across subjects.",
  },
  {
    icon: HiOutlineShieldExclamation,
    title: "Academic Risk Insights",
    desc: "Identify potential concerns using available performance data.",
  },
  {
    icon: HiOutlineCalendar,
    title: "Personalized Study Planner",
    desc: "Organize preparation around priorities and available time.",
  },
  {
    icon: HiOutlineSearch,
    title: "Weak Topic Detection",
    desc: "Identify areas that deserve additional practice.",
  },
];

const SUBJECTS = [
  { name: "Operating Systems", pct: 82 },
  { name: "DBMS", pct: 68 },
  { name: "DSA", pct: 74 },
  { name: "Networks", pct: 57 },
];

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  const year = new Date().getFullYear();

  /* rAF-throttled scroll flag: one state update per frame, no scroll jank. */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useReveal();

  /* Active section highlight */
  useEffect(() => {
    const ids = ["features", "how", "benefits", "contact"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!("IntersectionObserver" in window) || sections.length === 0)
      return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Subtle button ripple */
  useEffect(() => {
    const onClick = (e) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "btn-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };
    const btns = document.querySelectorAll(".btn-anim");
    btns.forEach((b) => b.addEventListener("click", onClick));
    return () => btns.forEach((b) => b.removeEventListener("click", onClick));
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="examiq light">
      {/* ══ NAVBAR ══ */}
      <header className={`ex-nav ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="ex-nav-inner" aria-label="Primary">
          <Link to="/" className="ex-brand" aria-label="ExamIQ home">
            <img src={logo} alt="ExamIQ logo" width="32" height="32" />
            <span>
              Exam<em>IQ</em>
            </span>
          </Link>

          <div className="ex-nav-links" role="menubar">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                role="menuitem"
                className={active === l.href ? "is-active" : ""}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="ex-nav-cta">
            <Link to="/login" className="ex-login">
              Login
            </Link>
            <Link to="/register" className="ex-cta btn-anim">
              <span className="btn-label">Get Started</span>
            </Link>
            <button
              className="ex-menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
            </button>
          </div>
        </nav>

        <div className={`ex-mobile ${menuOpen ? "open" : ""}`}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="ex-mobile-cta">
            <Link
              to="/login"
              className="ex-m-login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="ex-m-started"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ══ HERO ══ */}
        <section className="ex-hero" aria-label="Introduction">
          <div className="ex-hero-bg" aria-hidden="true">
            <span className="wash wash-a" />
            <span className="wash wash-b" />
            <span className="particle p1" />
            <span className="particle p2" />
            <span className="particle p3" />
            <span className="particle p4" />
          </div>
          <div className="ex-globe-wrap" aria-hidden="true">
            <DottedGlobe size={560} />
          </div>

          <div className="ex-hero-inner">
            <div className="ex-hero-copy">
              <p className="ex-eyebrow">AI-powered exam preparation</p>
              <TextReveal
                as="h1"
                text={"Prepare Smarter.\nAchieve More."}
                splitBy="words"
                highlight={["Smarter."]}
                staggerDelay={0.08}
                duration={0.6}
                once={true}
              />
              <p className="ex-lead">
                Your personal AI exam coach to practice smarter, understand
                your weak topics, and build a more effective study plan.
              </p>
              <div className="ex-hero-btns">
                <Link to="/register" className="ex-btn-primary btn-anim">
                  <span className="btn-label">Start Preparing Free</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a href="#features" className="ex-btn-ghost btn-anim">
                  <span className="btn-label">Explore Features</span>
                  <span className="btn-arrow" aria-hidden="true">
                    ↓
                  </span>
                </a>
              </div>
              <ul className="ex-values">
                {VALUE_POINTS.map((v) => {
                  const Icon = v.icon;
                  return (
                    <li key={v.label}>
                      <Icon size={16} aria-hidden="true" />
                      {v.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Hero product visualization */}
            <div
              className="ex-hero-visual"
              aria-label="ExamIQ product preview illustration"
            >
              <div className="ex-dash-card">
                <div className="ex-dash-top">
                  <span className="ex-dash-logo">
                    <img src={logo} alt="" width="22" height="22" />
                    ExamIQ
                  </span>
                  <span className="ex-sample">Sample preview</span>
                </div>
                <div className="ex-dash-progress">
                  <div className="ex-ring" style={{ "--p": "68%" }}>
                    <b>68%</b>
                  </div>
                  <div>
                    <strong>Study progress</strong>
                    <small>12-day streak · 78% quiz accuracy</small>
                    <div className="ex-meter">
                      <i style={{ width: "78%" }} />
                    </div>
                  </div>
                </div>
                <div className="ex-dash-subjects">
                  <span className="ex-mini-title">Subject performance</span>
                  {SUBJECTS.slice(0, 3).map((s) => (
                    <div className="ex-sub-row" key={s.name}>
                      <span>{s.name}</span>
                      <div className="ex-meter sm">
                        <i style={{ width: `${s.pct}%` }} />
                      </div>
                      <b>{s.pct}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ex-float ex-fc-quiz">
                <div className="ex-fc-head">
                  <span className="ex-fc-icon">
                    <HiOutlineLightningBolt size={14} />
                  </span>
                  <div>
                    <strong>OS Quiz · Q3/10</strong>
                    <small>Process Scheduling</small>
                  </div>
                </div>
                <p>Which algorithm avoids deadlock?</p>
                <div className="ex-fc-opts">
                  <span>Round Robin</span>
                  <span className="ok">Banker&apos;s ✓</span>
                </div>
              </div>

              <div className="ex-float ex-fc-ai">
                <div className="ex-fc-head">
                  <img
                    src={circuitBrain}
                    alt=""
                    width="30"
                    height="30"
                    loading="lazy"
                  />
                  <div>
                    <strong>AI recommendation</strong>
                    <small>Based on sample data</small>
                  </div>
                </div>
                <p>Revise Deadlock Prevention — 20 min drill suggested.</p>
              </div>

              <div className="ex-float ex-fc-plan">
                <div className="ex-fc-head">
                  <span className="ex-fc-icon cyan">
                    <HiOutlineCalendar size={14} />
                  </span>
                  <div>
                    <strong>Today&apos;s plan</strong>
                    <small>3 tasks · 90 min</small>
                  </div>
                </div>
                <ul>
                  <li>
                    <HiOutlineCheckCircle size={14} /> Revise B+ Trees
                  </li>
                  <li>
                    <HiOutlineClock size={14} /> DBMS quiz · 25 min
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRODUCT PREVIEW ══ */}
        <section
          className="ex-preview"
          id="preview"
          aria-label="Platform preview"
        >
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Platform preview</p>
            <TextReveal as="h2" text="Your preparation, beautifully organized" splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
            <p>
              A preview of the ExamIQ dashboard with sample data for
              illustration — not live user information.
            </p>
          </div>

          <div className="ex-window rv-scale">
            <div className="ex-window-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>app.examiq.io/dashboard — sample preview</span>
            </div>
            <div className="ex-window-body">
              <div className="ex-dash-main">
                <div className="ex-dash-row">
                  <div className="ex-metric">
                    <small>Overall progress</small>
                    <strong>68%</strong>
                    <div className="ex-meter">
                      <i style={{ width: "68%" }} />
                    </div>
                  </div>
                  <div className="ex-metric">
                    <small>Quiz accuracy</small>
                    <strong>78%</strong>
                    <div className="ex-meter">
                      <i style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div className="ex-metric">
                    <small>Study goals</small>
                    <strong>5/7</strong>
                    <div className="ex-meter">
                      <i style={{ width: "71%" }} />
                    </div>
                  </div>
                </div>

                <div className="ex-panel">
                  <h3>Subject-wise performance</h3>
                  {SUBJECTS.map((s) => (
                    <div className="ex-sub-row" key={s.name}>
                      <span>{s.name}</span>
                      <div className="ex-meter sm">
                        <i style={{ width: `${s.pct}%` }} />
                      </div>
                      <b>{s.pct}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="ex-dash-side">
                <div className="ex-panel">
                  <h3>
                    <HiOutlineClock size={15} /> Recent activity
                  </h3>
                  <ul className="ex-list">
                    <li>DBMS Quiz · 8/10</li>
                    <li>OS Notes → 5 questions</li>
                    <li>CN practice set completed</li>
                  </ul>
                </div>
                <div className="ex-panel tint">
                  <h3>
                    <HiOutlineEye size={15} /> Suggested revision
                  </h3>
                  <ul className="ex-list">
                    <li>Deadlock Prevention</li>
                    <li>SQL Normalization</li>
                  </ul>
                  <small>Sample suggestions for illustration.</small>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section className="ex-features" id="features" aria-label="Features">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Features</p>
            <TextReveal as="h2" text="Everything You Need to Prepare Better" splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
            <p>
              Powerful study tools designed to help you learn efficiently and
              approach exams with confidence.
            </p>
          </div>
          <div className="ex-feature-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <article
                  className="ex-feature rv-up"
                  key={f.title}
                  style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                >
                  <span className="ex-feature-icon">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="ex-how" id="how" aria-label="How it works">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">How it works</p>
            <TextReveal as="h2" text="From goals to exam-ready in three steps" splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
          </div>
          <div className="ex-steps">
            <span className="ex-steps-line" aria-hidden="true">
              <i />
            </span>
            {[
              {
                n: "01",
                icon: HiOutlineFlag,
                t: "Set Your Goals",
                d: "Choose your subjects, topics, and preparation priorities.",
              },
              {
                n: "02",
                icon: HiOutlineLightningBolt,
                t: "Practice with AI",
                d: "Generate questions, work through quizzes, and learn from your study material.",
              },
              {
                n: "03",
                icon: HiOutlineTrendingUp,
                t: "Learn and Improve",
                d: "Review performance, discover weak areas, and refine your study strategy.",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  className="ex-step rv-up"
                  key={s.n}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="ex-step-num">{s.n}</span>
                  <span className="ex-step-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ══ PDF SHOWCASE ══ */}
        <section className="ex-split" id="pdf" aria-label="Smart PDF learning">
          <div className="ex-split-inner">
            <div className="ex-split-copy rv-left">
              <p className="ex-kicker">Smart study tools</p>
              <TextReveal as="h2" text="Turn Your Notes Into Better Practice." splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
              <p>
                Upload lecture slides or notes and get exam-style questions
                generated from your own content. The preview below is an
                illustrative demo — the full experience lives inside the app.
              </p>
              <ul className="ex-checks">
                <li>
                  <HiOutlineCheckCircle size={17} /> Works with notes, slides,
                  and textbook chapters
                </li>
                <li>
                  <HiOutlineCheckCircle size={17} /> Questions matched to your
                  syllabus topics
                </li>
                <li>
                  <HiOutlineCheckCircle size={17} /> Clear explanations for
                  every answer
                </li>
              </ul>
              <Link to="/register" className="ex-btn-primary btn-anim">
                <span className="btn-label">Try PDF Learning</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
            <div
              className="ex-split-visual rv-right"
              aria-label="Document to questions demo"
            >
              <div className="ex-doc-flow">
                <div className="ex-doc">
                  <span className="ex-doc-icon">
                    <HiOutlineUpload size={18} />
                  </span>
                  <strong>OS-Notes.pdf</strong>
                  <small>2.4 MB · uploaded</small>
                  <span className="ex-doc-status">
                    <i className="spin" aria-hidden="true" />
                    Reading key topics…
                  </span>
                </div>
                <span className="ex-doc-arrow" aria-hidden="true">
                  →
                </span>
                <div className="ex-gen">
                  <div className="ex-gen-head">
                    <strong>Generated practice set</strong>
                    <small>Sample · 3 questions</small>
                  </div>
                  <div className="ex-gen-q">
                    <p>What is the purpose of process scheduling?</p>
                    <div>
                      <span>CPU allocation</span>
                      <span className="ok">Correct ✓</span>
                    </div>
                  </div>
                  <div className="ex-gen-q">
                    <p>Which algorithm avoids deadlock?</p>
                    <div>
                      <span>Round Robin</span>
                      <span className="ok">Banker&apos;s ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ INSIGHTS SHOWCASE ══ */}
        <section
          className="ex-insights"
          id="insights"
          aria-label="Performance insights"
        >
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Performance insights</p>
            <TextReveal as="h2" text="Know What to Focus on Next." splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
            <p>
              Clean, sample visualizations that show how performance data can
              guide your next session. Illustrative data only.
            </p>
          </div>
          <div className="ex-insight-grid">
            <article className="ex-insight rv-up">
              <h3>
                <HiOutlineBookOpen size={16} /> Subject-level accuracy
              </h3>
              <div className="ex-ring-row">
                <span className="ex-ring" style={{ "--p": "82%" }}>
                  <b>82%</b>
                </span>
                <div>
                  <strong>Operating Systems</strong>
                  <small>Strong · keep momentum</small>
                </div>
              </div>
              <div className="ex-ring-row">
                <span className="ex-ring amber" style={{ "--p": "57%" }}>
                  <b>57%</b>
                </span>
                <div>
                  <strong>Networks</strong>
                  <small>Needs attention</small>
                </div>
              </div>
            </article>
            <article
              className="ex-insight rv-up"
              style={{ transitionDelay: "80ms" }}
            >
              <h3>
                <HiOutlineTrendingUp size={16} /> Progress over time
              </h3>
              <svg
                className="ex-spark"
                viewBox="0 0 200 70"
                role="img"
                aria-label="Sample accuracy trend rising over time"
              >
                <path
                  className="ex-spark-line"
                  d="M4 58 C 34 54, 48 46, 72 44 S 120 34, 144 24 S 182 16, 196 10"
                  fill="none"
                />
                <circle cx="196" cy="10" r="4" className="ex-spark-dot" />
              </svg>
              <p className="ex-insight-note">Sample trend · +16 pts</p>
            </article>
            <article
              className="ex-insight rv-up"
              style={{ transitionDelay: "160ms" }}
            >
              <h3>
                <HiOutlineEye size={16} /> Topics needing revision
              </h3>
              <ul className="ex-revise">
                <li>
                  <span>Deadlock Prevention</span>
                  <em className="low">High priority</em>
                </li>
                <li>
                  <span>SQL Normalization</span>
                  <em className="mid">Medium</em>
                </li>
                <li>
                  <span>IP Subnetting</span>
                  <em className="mid">Medium</em>
                </li>
              </ul>
            </article>
            <article
              className="ex-insight rv-up"
              style={{ transitionDelay: "240ms" }}
            >
              <h3>
                <HiOutlineCalendar size={16} /> Suggested next session
              </h3>
              <div className="ex-next">
                <strong>DBMS · Normalization drill</strong>
                <small>20 questions · ~25 min · sample suggestion</small>
                <Link to="/register" className="ex-mini-btn btn-anim">
                  Start session →
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ══ BENEFITS ══ */}
        <section className="ex-benefits" id="benefits" aria-label="Benefits">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Why ExamIQ</p>
            <TextReveal as="h2" text="Study less, learn more" splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
          </div>

          <div className="ex-benefit rv-left">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">01 · Focus</p>
              <h3>Focus on What Matters</h3>
              <p>
                Identify the topics that deserve more attention, instead of
                re-reading what you already know. Every session points to the
                next highest-value material.
              </p>
            </div>
            <div className="ex-benefit-visual" aria-hidden="true">
              <div className="ex-bv-card">
                <HiOutlineSearch size={20} />
                <strong>3 topics flagged</strong>
                <span>Deadlock · Joins · Subnetting</span>
              </div>
            </div>
          </div>

          <div className="ex-benefit flip rv-right">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">02 · Clarity</p>
              <h3>See Your Progress Clearly</h3>
              <p>
                Understand your preparation through useful performance
                insights — accuracy trends, subject mastery, and streaks that
                show real momentum.
              </p>
            </div>
            <div className="ex-benefit-visual alt" aria-hidden="true">
              <div className="ex-bv-card">
                <HiOutlineChartBar size={20} />
                <strong>Accuracy 62% → 78%</strong>
                <span>Sample · last 14 sessions</span>
              </div>
            </div>
          </div>

          <div className="ex-benefit rv-left">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">03 · Habits</p>
              <h3>Build Better Study Habits</h3>
              <p>
                Follow a structured approach to exam preparation — short daily
                sessions that compound into genuine exam confidence.
              </p>
            </div>
            <div className="ex-benefit-visual" aria-hidden="true">
              <div className="ex-bv-card">
                <HiOutlineCalendar size={20} />
                <strong>12-day streak</strong>
                <span>Today: 2 tasks · 45 min</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STUDENT STORIES ══ */}
        <section className="ex-stories" id="stories" aria-label="Student stories">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Student stories</p>
            <TextReveal as="h2" text="Learners stay consistent with ExamIQ" splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
            <p>
              Sample stories for illustration — shared with the spirit of
              focused, confident preparation.
            </p>
          </div>
          <div className="rv-up">
            <Marquee />
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="ex-final rv-scale" aria-label="Get started">
          <TextReveal as="h2" text="Your Next Exam Starts with a Better Plan." splitBy="words" staggerDelay={0.045} duration={0.5} once={true} />
          <p>
            Take control of your preparation with smarter practice and
            personalized learning insights.
          </p>
          <div className="ex-final-btns">
            <Link
              to="/register"
              className="ex-btn-primary big btn-anim"
            >
              <span className="btn-label">Get Started Free</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <Link to="/login" className="ex-login-link">
              Already have an account? <u>Log in</u>
            </Link>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="ex-footer" id="contact">
        <div className="ex-footer-inner">
          <div className="ex-footer-brand">
            <Link to="/" className="ex-brand" aria-label="ExamIQ home">
              <img src={logo} alt="ExamIQ logo" width="28" height="28" />
              <span>
                Exam<em>IQ</em>
              </span>
            </Link>
            <p>
              AI-powered exam preparation and personalized learning for
              focused, confident students.
            </p>
          </div>
          <nav className="ex-footer-nav" aria-label="Footer">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#benefits">Benefits</a>
              <a href="#preview">Platform preview</a>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Get Started</Link>
            </div>
            <div>
              <h4>Contact</h4>
              <a href="mailto:pp50646464@gmail.com">
                <HiOutlineMail size={14} /> pp50646464@gmail.com
              </a>
              <a href="tel:+919328761976">
                <HiOutlinePhone size={14} /> +91 9328761976
              </a>
              <span className="ex-contact-note">
                <HiOutlineAcademicCap size={14} /> Final-year AI project
              </span>
            </div>
          </nav>
        </div>
        <div className="ex-footer-base">
          <span>© {year} ExamIQ · AI Exam Preparation System</span>
          <span>Built by Prince Patel</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
