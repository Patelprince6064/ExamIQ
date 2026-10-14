import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import "./Auth.css";
import { apiLogin, saveAuth } from "./api";
import logo from "./assets/logo.png";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email address is required.";
    else if (!EMAIL_RE.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!validate()) return;
    setLoading(true);

    try {
      const data = await apiLogin(email.trim(), password);
      if (data.token) {
        saveAuth(data.token, data.user);
        setMessage({ text: "Login successful! Redirecting…", type: "success" });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setMessage({ text: data.message || "Invalid credentials", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
            Welcome Back to <em>Smarter Learning.</em>
          </h1>
          <p className="auth-subtext">
            Continue your preparation, track your progress, and focus on what
            matters most.
          </p>

          <div className="auth-preview" aria-hidden="true">
            <div className="auth-mini main">
              <div className="auth-mini-head">
                <span className="auth-mini-icon">
                  <HiOutlineChartBar size={16} />
                </span>
                <div>
                  <strong>Study progress</strong>
                  <small>Sample preview</small>
                </div>
              </div>
              <div className="auth-meter">
                <i />
              </div>
            </div>
            <div className="auth-mini float-a">
              <div className="auth-mini-head">
                <span className="auth-mini-icon cyan">
                  <HiOutlineLightningBolt size={16} />
                </span>
                <div>
                  <strong>DBMS Quiz · 8/10</strong>
                  <small>Accuracy improving</small>
                </div>
              </div>
              <ul className="auth-mini-list">
                <li>
                  <HiOutlineCheckCircle size={14} /> Weak topics identified
                </li>
              </ul>
            </div>
          </div>

          <ul className="auth-benefits">
            <li>
              <HiOutlineSparkles size={17} /> Personalized practice
            </li>
            <li>
              <HiOutlineChartBar size={17} /> Intelligent study insights
            </li>
            <li>
              <HiOutlineCheckCircle size={17} /> Progress tracking
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
            <Link to="/login" className="active">
              Sign In
            </Link>
            <Link to="/register">Create Account</Link>
          </div>

          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your ExamIQ journey.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <div className={`field-group ${errors.email ? "field-error" : ""}`}>
              <label className="field-label" htmlFor="login-email">
                Email address
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <HiOutlineMail size={17} />
                </span>
                <input
                  id="login-email"
                  className="field-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: undefined }));
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
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <HiOutlineLockClosed size={17} />
                </span>
                <input
                  id="login-password"
                  className="field-input has-toggle"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
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
                    <span className="spinner" /> Signing in…
                  </>
                ) : (
                  "Sign In →"
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
            New to ExamIQ? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
