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
import "./home.css";
import logo from "../assets/logo.png";
import circuitBrain from "../assets/circuit-brain.png";

/* ── Scroll-reveal (IntersectionObserver, transform+opacity only) ── */
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

const FEATURES = [
  {
    icon: HiOutlineSparkles,
    title: "AI Question Generator",
    desc: "Generate exam-style questions for your selected topics, tuned to university difficulty.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "Smart PDF Learning",
    desc: "Upload study material and generate practice questions directly from your notes.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Performance Analytics",
    desc: "Track accuracy, study progress, and subject-level performance in one view.",
  },
  {
    icon: HiOutlineShieldExclamation,
    title: "Academic Risk Insights",
    desc: "Analyze available quiz history to identify potential areas of academic risk.",
  },
  {
    icon: HiOutlineCalendar,
    title: "Adaptive Study Planner",
    desc: "Organize preparation around weak topics, available time, and exam dates.",
  },
  {
    icon: HiOutlineSearch,
    title: "Weak Topic Detection",
    desc: "Discover areas that need additional practice and attention, automatically.",
  },
];

const DASH_SUBJECTS = [
  { name: "Operating Systems", pct: 82, tone: "blue" },
  { name: "DBMS", pct: 68, tone: "cyan" },
  { name: "DSA", pct: 74, tone: "violet" },
  { name: "Networks", pct: 57, tone: "amber" },
];

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    if (!("IntersectionObserver" in window) || sections.length === 0) return undefined;
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

  /* Button ripple */
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
      window.setTimeout(() => ripple.remove(), 650);
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
    <div className="examiq">
      {/* ══ NAVBAR ══ */}
      <header className={`ex-nav ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="ex-nav-inner" aria-label="Primary">
          <Link to="/" className="ex-brand" aria-label="ExamIQ home">
            <img src={logo} alt="ExamIQ logo" width="34" height="34" />
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
            <Link to="/register" className="ex-cta btn-anim btn-shine">
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

        {/* Mobile menu */}
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
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="grid-overlay" />
            <span className="particle p1" />
            <span className="particle p2" />
            <span className="particle p3" />
            <span className="particle p4" />
            <span className="particle p5" />
          </div>

          <div className="ex-hero-inner">
            <div className="ex-hero-copy">
              <p className="ex-eyebrow">
                <span className="ex-eyebrow-dot" />
                Your personal AI exam coach
              </p>
              <h1>
                Your Next Exam Deserves a{" "}
                <span className="grad">Smarter Strategy.</span>
              </h1>
              <p className="ex-lead">
                Turn your notes into practice, uncover your weak topics, and
                build a personalized study plan with AI-powered exam
                preparation.
              </p>
              <div className="ex-hero-btns">
                <Link
                  to="/register"
                  className="ex-btn-primary btn-anim btn-shine"
                >
                  <span className="btn-label">Start Preparing Free</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <a href="#preview" className="ex-btn-ghost btn-anim">
                  <span className="btn-label">Explore the Platform</span>
                  <span className="btn-arrow" aria-hidden="true">
                    ↓
                  </span>
                </a>
              </div>
              <p className="ex-trust">
                <HiOutlineCheckCircle size={16} aria-hidden="true" />
                Practice smarter. Track progress. Improve with every session.
              </p>
            </div>

            {/* Hero visual */}
            <div className="ex-hero-visual" aria-label="AI learning visualization preview">
              <div className="neural-stage">
                <div className="neural-core">
                  <img
                    src={circuitBrain}
                    alt="ExamIQ neural study engine"
                    loading="eager"
                  />
                  <span className="core-glow" aria-hidden="true" />
                </div>
                <span className="orbit orbit-1" aria-hidden="true">
                  <i className="sat s1" />
                </span>
                <span className="orbit orbit-2" aria-hidden="true">
                  <i className="sat s2" />
                  <i className="sat s3" />
                </span>
                <span className="orbit orbit-3" aria-hidden="true" />

                <div className="float-card fc-quiz">
                  <div className="fc-head">
                    <span className="fc-icon">
                      <HiOutlineLightningBolt size={15} />
                    </span>
                    <div>
                      <strong>OS Quiz · Q3/10</strong>
                      <small>Process Scheduling</small>
                    </div>
                    <span className="fc-live">
                      <i /> Live
                    </span>
                  </div>
                  <p>Which algorithm avoids deadlock?</p>
                  <div className="fc-opts">
                    <span>Round Robin</span>
                    <span className="ok">Banker&apos;s ✓</span>
                  </div>
                  <div className="fc-progress">
                    <i style={{ width: "30%" }} />
                  </div>
                </div>

                <div className="float-card fc-analytics">
                  <div className="fc-head">
                    <span className="fc-icon cyan">
                      <HiOutlineTrendingUp size={15} />
                    </span>
                    <div>
                      <strong>Accuracy 78%</strong>
                      <small>Last 7 sessions</small>
                    </div>
                  </div>
                  <div className="fc-bars" aria-hidden="true">
                    {[42, 58, 50, 66, 60, 74, 78].map((h, i) => (
                      <i key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="float-card fc-plan">
                  <div className="fc-head">
                    <span className="fc-icon violet">
                      <HiOutlineCalendar size={15} />
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
          </div>
        </section>

        {/* ══ PLATFORM PREVIEW ══ */}
        <section className="ex-preview" id="preview" aria-label="Platform preview">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Platform preview</p>
            <h2>One workspace for your entire preparation</h2>
            <p>
              A preview of the ExamIQ dashboard — illustrative sample data, not
              live user data.
            </p>
          </div>

          <div className="ex-window rv-scale">
            <div className="ex-window-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>app.examiq.io/dashboard — preview</span>
            </div>
            <div className="ex-window-body">
              <div className="ex-dash-main">
                <div className="ex-dash-row">
                  <div className="ex-metric">
                    <small>Study progress</small>
                    <strong>68%</strong>
                    <div className="ex-meter">
                      <i style={{ width: "68%" }} />
                    </div>
                  </div>
                  <div className="ex-metric">
                    <small>Quiz accuracy</small>
                    <strong>78%</strong>
                    <div className="ex-meter cyan">
                      <i style={{ width: "78%" }} />
                    </div>
                  </div>
                  <div className="ex-metric">
                    <small>Day streak</small>
                    <strong>12 days</strong>
                    <div className="ex-meter violet">
                      <i style={{ width: "55%" }} />
                    </div>
                  </div>
                </div>

                <div className="ex-dash-subject">
                  <h3>Subject-wise performance</h3>
                  {DASH_SUBJECTS.map((s) => (
                    <div className="ex-sub-row" key={s.name}>
                      <span>{s.name}</span>
                      <div className="ex-meter sm">
                        <i
                          className={`tone-${s.tone}`}
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                      <b>{s.pct}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="ex-dash-side">
                <div className="ex-side-card">
                  <h3>
                    <HiOutlineClock size={15} /> Upcoming tasks
                  </h3>
                  <ul>
                    <li>Revise Normalization — 30 min</li>
                    <li>CN practice set — 20 questions</li>
                    <li>OS mock quiz — tomorrow</li>
                  </ul>
                </div>
                <div className="ex-side-card warn">
                  <h3>
                    <HiOutlineEye size={15} /> Weak-topic insights
                  </h3>
                  <ul>
                    <li>Deadlock Prevention — revise</li>
                    <li>SQL Joins — practice more</li>
                  </ul>
                  <small>Sample insights for illustration.</small>
                </div>
                <div className="ex-side-card">
                  <h3>
                    <HiOutlineBookOpen size={15} /> Recent activity
                  </h3>
                  <ul>
                    <li>DBMS Quiz · 8/10</li>
                    <li>OS Notes → 5 questions</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section className="ex-features" id="features" aria-label="Features">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Features</p>
            <h2>Everything You Need to Prepare with Confidence</h2>
            <p>
              One intelligent workspace for more focused, personalized exam
              preparation.
            </p>
          </div>
          <div className="ex-feature-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <article
                  className="ex-feature rv-up"
                  key={f.title}
                  style={{ transitionDelay: `${(i % 3) * 90}ms` }}
                >
                  <span className="ex-feature-glow" aria-hidden="true" />
                  <span className="ex-feature-icon">
                    <Icon size={22} aria-hidden="true" />
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
            <h2>From goal to exam-ready in three steps</h2>
          </div>
          <div className="ex-steps">
            <span className="ex-steps-line" aria-hidden="true">
              <i />
            </span>
            {[
              {
                n: "01",
                icon: HiOutlineFlag,
                t: "Set Your Goal",
                d: "Choose subjects, topics, and your preparation priorities.",
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
                t: "Analyze and Improve",
                d: "Review your performance, identify weak areas, and refine your study plan.",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  className="ex-step rv-up"
                  key={s.n}
                  style={{ transitionDelay: `${i * 110}ms` }}
                >
                  <span className="ex-step-num">{s.n}</span>
                  <span className="ex-step-icon">
                    <Icon size={24} aria-hidden="true" />
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
              <p className="ex-kicker">Smart PDF learning</p>
              <h2>Your Study Material. Your Personal Practice Set.</h2>
              <p>
                Upload lecture slides or notes and get exam-style questions
                generated from your own content. Illustrative demo below — the
                full flow lives inside the app after login.
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
                  <HiOutlineCheckCircle size={17} /> Explanations that show why
                  answers are correct
                </li>
              </ul>
              <Link
                to="/register"
                className="ex-btn-primary btn-anim btn-shine"
              >
                <span className="btn-label">Try PDF Learning</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
            <div className="ex-split-visual rv-right" aria-label="Document to questions demo">
              <div className="ex-doc-flow">
                <div className="ex-doc">
                  <span className="ex-doc-icon">
                    <HiOutlineUpload size={18} />
                  </span>
                  <strong>OS-Notes.pdf</strong>
                  <small>2.4 MB · uploaded</small>
                  <div className="ex-doc-scan" aria-hidden="true" />
                </div>
                <span className="ex-doc-arrow" aria-hidden="true">
                  →
                </span>
                <div className="ex-gen">
                  <div className="ex-gen-head">
                    <strong>Generated practice set</strong>
                    <small>3 questions · sample</small>
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
        <section className="ex-insights" id="insights" aria-label="Personalized insights">
          <div className="ex-section-head rv-up">
            <p className="ex-kicker">Personalized insights</p>
            <h2>Know What to Study Next.</h2>
            <p>
              Performance data helps you focus preparation where it counts.
              Cards below show illustrative sample data.
            </p>
          </div>
          <div className="ex-insight-grid">
            <article className="ex-insight rv-up">
              <h3>
                <HiOutlineBookOpen size={16} /> Subject performance
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
              style={{ transitionDelay: "90ms" }}
            >
              <h3>
                <HiOutlineTrendingUp size={16} /> Accuracy trend
              </h3>
              <div className="ex-trend" aria-hidden="true">
                {[38, 46, 44, 56, 60, 66, 74].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="ex-insight-note">+16 pts over 3 weeks · sample</p>
            </article>
            <article
              className="ex-insight rv-up"
              style={{ transitionDelay: "180ms" }}
            >
              <h3>
                <HiOutlineEye size={16} /> Topics to revise
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
              style={{ transitionDelay: "270ms" }}
            >
              <h3>
                <HiOutlineCalendar size={16} /> Next session
              </h3>
              <div className="ex-next">
                <strong>DBMS · Normalization drill</strong>
                <small>20 questions · ~25 min · recommended sample</small>
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
            <h2>Study less, learn more</h2>
          </div>

          <div className="ex-benefit rv-left">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">01 · Focus</p>
              <h3>Focus on What Matters</h3>
              <p>
                Spend more time improving weak topics instead of re-reading
                what you already know. Every session points to the next
                highest-value material.
              </p>
            </div>
            <div className="ex-benefit-visual" aria-hidden="true">
              <div className="ex-bv-card">
                <HiOutlineSearch size={20} />
                <strong>Weak topics found: 3</strong>
                <span>Deadlock · Joins · Subnetting</span>
              </div>
            </div>
          </div>

          <div className="ex-benefit flip rv-right">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">02 · Clarity</p>
              <h3>Make Progress Visible</h3>
              <p>
                Understand performance through meaningful analytics — accuracy
                trends, subject mastery, and streaks that show real momentum.
              </p>
            </div>
            <div className="ex-benefit-visual" aria-hidden="true">
              <div className="ex-bv-card">
                <HiOutlineChartBar size={20} />
                <strong>Accuracy 62% → 78%</strong>
                <span>Last 14 sessions</span>
              </div>
            </div>
          </div>

          <div className="ex-benefit rv-left">
            <div className="ex-benefit-copy">
              <p className="ex-kicker">03 · Consistency</p>
              <h3>Build Consistent Habits</h3>
              <p>
                Use structured study plans to stay organized — short daily
                sessions that compound into exam confidence.
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

        {/* ══ FINAL CTA ══ */}
        <section className="ex-final rv-scale" aria-label="Get started">
          <div className="ex-final-bg" aria-hidden="true">
            <span className="orb orb-c" />
            <span className="particle p2" />
            <span className="particle p4" />
          </div>
          <h2>Make Your Next Study Session Count.</h2>
          <p>
            Start building a more focused exam-preparation routine with ExamIQ.
          </p>
          <div className="ex-final-btns">
            <Link to="/register" className="ex-btn-primary big btn-anim btn-shine">
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
              <img src={logo} alt="ExamIQ logo" width="30" height="30" />
              <span>
                Exam<em>IQ</em>
              </span>
            </Link>
            <p>
              AI-powered exam preparation and personalized learning for
              focused, confident students.
            </p>
            <p className="ex-tagline">Prepare Smarter. Perform Better.</p>
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
