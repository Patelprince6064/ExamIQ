import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap, HiOutlineMailOpen } from "react-icons/hi";
import "./home.css";
import logo from "../assets/logo.png";
import circuitBrain from "../assets/circuit-brain.png";

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useReveal();

  // Button ripple + magnetic tilt
  useEffect(() => {
    const handleRipple = (e) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "btn-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    };
    const btns = document.querySelectorAll(".btn-anim");
    btns.forEach((b) => b.addEventListener("click", handleRipple));
    return () => btns.forEach((b) => b.removeEventListener("click", handleRipple));
  }, []);

  return (
    <div className="home">

      {/* TOP NAV */}
      <div className={`top-nav ${scrolled ? "scrolled" : ""}`}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="ExamIQ Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
          <span>ExamIQ</span>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="login-btn">Login →</Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Final Year AI Project · Built for Students
        </div>

        <h1>
          Ace Every Exam with{" "}
          <span className="highlight">AI-Powered</span>{" "}
          Preparation
        </h1>

        <p>
          Personalized study plans, instant question generation from your PDFs,
          AI practice sessions — everything you need to succeed.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="btn primary btn-anim btn-shine">
            <span className="btn-label">Get Started Free</span>
            <span className="btn-arrow">→</span>
          </Link>
          <Link to="/login" className="btn secondary btn-anim">
            <span className="btn-label">Login to Dashboard</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>

        {/* HERO AI CIRCUIT BRAIN GRAPHIC */}
        <div className="hero-graphic-container">
          <div className="hero-graphic-glow"></div>
          <img src={circuitBrain} alt="ExamIQ AI Neural Engine" className="hero-circuit-img" />
          <div className="hero-graphic-badge badge-top">
            <span className="badge-pulse"></span> Intelligent Neural Engine Active
          </div>
          <div className="hero-graphic-badge badge-bottom">
            ⚡ Groq LLaMA 3.1 Powered
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">5+</div>
            <div className="hero-stat-label">Core Subjects</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">AI</div>
            <div className="hero-stat-label">Powered by Groq</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">PDF</div>
            <div className="hero-stat-label">Smart Upload</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <div className="hero-stat-value">100%</div>
            <div className="hero-stat-label">Free to Use</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="section-header reveal-up">
          <div className="section-tag">Features</div>
          <h2>Everything You Need to Prepare</h2>
          <p>A complete AI-driven toolkit designed to maximize your exam performance and reduce study stress.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal-up" style={{ transitionDelay: "0ms" }}>
            <div className="feature-icon blue">🤖</div>
            <h3>AI Question Generator</h3>
            <p>Enter any topic and instantly get exam-style MCQs generated by Groq AI — tailored to CS engineering subjects.</p>
            <span className="feature-tag">Instant Generation</span>
          </div>

          <div className="feature-card reveal-up" style={{ transitionDelay: "80ms" }}>
            <div className="feature-icon cyan">📄</div>
            <h3>PDF Smart Upload</h3>
            <p>Upload your lecture notes or textbook PDFs and let the AI generate questions directly from your own study material.</p>
            <span className="feature-tag">New Feature</span>
          </div>

          <div className="feature-card reveal-up" style={{ transitionDelay: "160ms" }}>
            <div className="feature-icon green">📊</div>
            <h3>Performance Analytics</h3>
            <p>Track accuracy, study hours, streaks, and subject-wise performance with detailed charts and insights.</p>
            <span className="feature-tag">Real-time Data</span>
          </div>

          <div className="feature-card reveal-up" style={{ transitionDelay: "0ms" }}>
            <div className="feature-icon purple">🧠</div>
            <h3>AI Failure Prediction</h3>
            <p>Machine learning models analyze your quiz history to identify academic risk and predict exam failure probability.</p>
            <span className="feature-tag">Smart Insights</span>
          </div>

          <div className="feature-card reveal-up" style={{ transitionDelay: "80ms" }}>
            <div className="feature-icon orange">📅</div>
            <h3>Adaptive Study Planner</h3>
            <p>Get personalized daily study schedules based on your weak topics, available time, and upcoming exam dates.</p>
            <span className="feature-tag">Personalized</span>
          </div>

          <div className="feature-card reveal-up" style={{ transitionDelay: "160ms" }}>
            <div className="feature-icon red">🚨</div>
            <h3>Weak Topic Analysis</h3>
            <p>Automatically identifies your weakest areas from quiz performance and suggests targeted improvement actions.</p>
            <span className="feature-tag">Auto-detect</span>
          </div>
        </div>
      </section>

      {/* PDF HIGHLIGHT SECTION */}
      <section className="pdf-highlight">
        <div className="pdf-highlight-inner">
          <div className="pdf-highlight-text reveal-left">
            <div className="section-tag">PDF Upload</div>
            <h2>Turn Your Notes into Practice Questions</h2>
            <p>
              Simply upload any PDF — lecture slides, notes, or textbook chapters — and our AI will extract the key concepts and generate exam-ready MCQs instantly.
            </p>
            <div className="pdf-steps">
              <div className="pdf-step">
                <div className="pdf-step-num">1</div>
                <div className="pdf-step-text">
                  <h4>Upload Your PDF</h4>
                  <p>Drag & drop or browse your lecture notes, textbooks, or study material.</p>
                </div>
              </div>
              <div className="pdf-step">
                <div className="pdf-step-num">2</div>
                <div className="pdf-step-text">
                  <h4>AI Processes Your Content</h4>
                  <p>Groq AI reads and understands the key topics from your uploaded document.</p>
                </div>
              </div>
              <div className="pdf-step">
                <div className="pdf-step-num">3</div>
                <div className="pdf-step-text">
                  <h4>Get Exam-Ready Questions</h4>
                  <p>Receive a custom MCQ quiz based directly on your own study material.</p>
                </div>
              </div>
            </div>
            <Link to="/register" className="btn primary btn-anim btn-shine"><span className="btn-label">Try PDF Upload</span><span className="btn-arrow">→</span></Link>
          </div>

          <div className="pdf-visual reveal-right">
            <div className="pdf-mockup">
              <div className="pdf-mockup-header">
                <div className="pdf-mockup-icon">📄</div>
                <div>
                  <div className="pdf-mockup-title">OS Notes.pdf</div>
                  <div className="pdf-mockup-sub">3 questions generated</div>
                </div>
              </div>
              <div className="pdf-question-list">
                <div className="pdf-question-item">
                  <p>What is the purpose of process scheduling?</p>
                  <div className="pdf-question-options">
                    <span className="pdf-option">CPU Allocation</span>
                    <span className="pdf-option correct">✓ Correct</span>
                  </div>
                </div>
                <div className="pdf-question-item">
                  <p>Which algorithm avoids deadlock?</p>
                  <div className="pdf-question-options">
                    <span className="pdf-option">Round Robin</span>
                    <span className="pdf-option correct">✓ Banker's Algo</span>
                  </div>
                </div>
                <div className="pdf-question-item">
                  <p>Define virtual memory.</p>
                  <div className="pdf-question-options">
                    <span className="pdf-option">RAM Extension</span>
                    <span className="pdf-option correct">✓ Correct</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="section-header reveal-up">
          <div className="section-tag">Process</div>
          <h2>How ExamIQ Works</h2>
          <p>An intelligent, step-by-step AI-driven exam preparation pipeline built for CS students.</p>
        </div>

        <div className="flow-grid">
          <div className="flow-item reveal-up" style={{ transitionDelay: "0ms" }}>
            <div className="flow-circle">📊</div>
            <h4>Data Analysis</h4>
            <p>Your test history, accuracy and learning patterns analyzed</p>
          </div>
          <div className="flow-item reveal-up" style={{ transitionDelay: "80ms" }}>
            <div className="flow-circle">🧠</div>
            <h4>AI Prediction</h4>
            <p>ML models predict risk and exam failure probability</p>
          </div>
          <div className="flow-item reveal-up" style={{ transitionDelay: "160ms" }}>
            <div className="flow-circle">📅</div>
            <h4>Study Planner</h4>
            <p>Personalized daily plans based on weak topics</p>
          </div>
          <div className="flow-item reveal-up" style={{ transitionDelay: "240ms" }}>
            <div className="flow-circle">📝</div>
            <h4>AI Evaluation</h4>
            <p>Automatic answer evaluation like a real examiner</p>
          </div>
          <div className="flow-item reveal-up" style={{ transitionDelay: "320ms" }}>
            <div className="flow-circle">🚨</div>
            <h4>Smart Alerts</h4>
            <p>Real-time feedback and improvement suggestions</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner reveal-scale">
        <h2>Ready to Transform Your Exam Prep?</h2>
        <p>Join students who are already using AI to study smarter, not harder.</p>
        <div className="cta-banner-buttons">
          <Link to="/register" className="btn-cta-white btn-anim btn-shine"><span className="btn-label">Get Started Free</span></Link>
          <Link to="/login" className="btn-cta-outline btn-anim"><span className="btn-label">Login to Dashboard</span><span className="btn-arrow">→</span></Link>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact">
        <div className="contact-wrapper">
          <div className="contact-left reveal-left">
            <h2>Let's Connect</h2>
            <p>
              Have questions, feedback, or ideas about ExamIQ?<br />
              This is a final year project — your feedback matters!
            </p>
            <div className="contact-actions">
              <a href="mailto:pp50646464@gmail.com" className="contact-btn">
                <HiOutlineMailOpen size={16} /> Email Us
              </a>
              <a href="tel:+919328761976" className="contact-btn secondary">
                <HiOutlinePhone size={16} /> Call Us
              </a>
            </div>
          </div>

          <div className="contact-right reveal-right">
            <div className="contact-cards">
              <div className="contact-card">
                <div className="contact-card-icon"><HiOutlineMail size={18} /></div>
                <div className="contact-card-text">
                  <strong>Email</strong>
                  <span>pp50646464@gmail.com</span>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon"><HiOutlinePhone size={18} /></div>
                <div className="contact-card-text">
                  <strong>Phone</strong>
                  <span>+91 9328761976</span>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon"><HiOutlineAcademicCap size={18} /></div>
                <div className="contact-card-text">
                  <strong>Project Type</strong>
                  <span>Final Year AI Project</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-footer">
          © 2026 AI Exam Preparation System · ExamIQ · Built with ❤️ by Prince Patel
        </div>
      </section>

    </div>
  );
};

export default Home;
