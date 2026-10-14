import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineTrendingUp,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import "./Auth.css";
import { apiRegister, saveAuth } from "./api";
import logo from "./assets/logo.png";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getStrength = (pass) => {
  if (!pass) return 0;
  if (pass.length < 6) return 1;
  if (pass.length < 10) return 2;
  return 3;
};
const STRENGTH_COLOR = ["", "#DC2626", "#D97706", "#15803D"];
const STRENGTH_LABEL = ["", "Weak password", "Medium password", "Strong password"];

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Full name is required.";
    else if (name.trim().length < 2)
      next.name = "Enter your full name.";
    if (!email.trim()) next.email = "Email address is required.";
    else if (!EMAIL_RE.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!validate()) return;
    setLoading(true);

    try {
      const data = await apiRegister(name.trim(), email.trim(), password);
      if (data.token) {
        saveAuth(data.token, data.user);
        setMessage({
          text: "Account created successfully! Redirecting…",
          type: "success",
        });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setMessage({
          text: data.message || "Registration failed",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Server error. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (key) =>
    setErrors((prev) =>
      prev[key] ? { ...prev, [key]: undefined } : prev
    );

  return (
    <div className="auth-root">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="auth-left">
        <div className="auth-bg-deco" aria-hidden="true">
          <span className="auth-grid" />
          <i className="auth-dot d1" />
          <i className="auth-dot d2" />
          <i className="auth-dot d3" />
          <i className="auth-dot d4" />
        </div>
        <div className="auth-left-inner">
          <Link to="/" className="brand-logo" aria-label="ExamIQ home">
            <img src={logo} alt="ExamIQ logo" width={36} height={36} />
            <span className="brand-name">
              Exam<span>IQ</span>
            </span>
          </Link>

          <p className="auth-eyebrow">Your personal AI exam coach</p>
          <h1 className="auth-headline">
            Your Journey to <em>Better Preparation</em> Starts Here.
          </h1>
          <p className="auth-subtext">
            Build a smarter study routine with AI-powered practice and
            personalized insights.
          </p>

          <div className="auth-preview" aria-hidden="true">
            <div className="auth-mini main">
              <div className="auth-mini-head">
                <span className="auth-mini-icon">
                  <HiOutlineCalendar size={16} />
                </span>
                <div>
                  <strong>Week 1 study plan</strong>
                  <small>Sample preview</small>
                </div>
              </div>
              <ul className="auth-mini-list">
                <li>
                  <HiOutlineCheckCircle size={14} /> DBMS quiz · 25 min
                </li>
                <li>
                  <HiOutlineCheckCircle size={14} /> Revise B+ Trees
                </li>
              </ul>
            </div>
            <div className="auth-mini float-a">
              <div className="auth-mini-head">
                <span className="auth-mini-icon cyan">
                  <HiOutlineTrendingUp size={16} />
                </span>
                <div>
                  <strong>Accuracy 78%</strong>
                  <small>Improving weekly</small>
                </div>
              </div>
              <div className="auth-meter">
                <i style={{ width: "78%" }} />
              </div>
            </div>
          </div>

          <ul className="auth-benefits">
            <li>
              <HiOutlineSparkles size={17} /> Practice with purpose
            </li>
            <li>
              <HiOutlineSearch size={17} /> Discover weak topics
            </li>
            <li>
              <HiOutlineTrendingUp size={17} /> Track your improvement
            </li>
          </ul>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-right">
        <div className="auth-card">
          <Link to="/" className="auth-back">
            <HiOutlineArrowLeft size={15} /> Back to home
          </Link>

          <div className="auth-tab-switch">
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="active">
              Create Account
            </Link>
          </div>

          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Get started with smarter exam preparation.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <div className={`field-group ${errors.name ? "field-error" : ""}`}>
              <label className="field-label" htmlFor="reg-name">
                Full name
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <HiOutlineUser size={17} />
                </span>
                <input
                  id="reg-name"
                  className="field-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                />
              </div>
              {errors.name && (
                <span className="field-err" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className={`field-group ${errors.email ? "field-error" : ""}`}>
              <label className="field-label" htmlFor="reg-email">
                Email address
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <HiOutlineMail size={17} />
                </span>
                <input
                  id="reg-email"
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                />
              </div>
              {errors.email && (
                <span className="field-err" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div
              className={`field-group ${errors.password ? "field-error" : ""}`}
            >
              <label className="field-label" htmlFor="reg-password">
                Password
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <HiOutlineLockClosed size={17} />
                </span>
                <input
                  id="reg-password"
                  className="field-input has-toggle"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <HiOutlineEyeOff size={18} />
                  ) : (
                    <HiOutlineEye size={18} />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div aria-live="polite">
                  <div className="pw-strength" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <i
                        key={i}
                        style={{
                          background:
                            i <= strength
                              ? STRENGTH_COLOR[strength]
                              : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="pw-strength-label"
                    style={{ color: STRENGTH_COLOR[strength] }}
                  >
                    {STRENGTH_LABEL[strength]}
                  </p>
                </div>
              )}
              {errors.password && (
                <span className="field-err" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              <span className="btn-inner">
                {loading ? (
                  <>
                    <span className="spinner" /> Creating account…
                  </>
                ) : (
                  "Create Account →"
                )}
              </span>
            </button>
          </form>

          {message.text && (
            <div className={`auth-message ${message.type}`} role="status">
              {message.text}
            </div>
          )}

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
