import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineCheck,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineFire,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from "react-icons/hi";
import {
  apiGetProfile, apiUpdateProfile, apiChangePassword, saveAuth
} from "../services/api";
import { SharedSidebar } from "../components/layout/SharedLayout";
import "./Settings.css";

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 5);
}

function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [studyGoal, setStudyGoal] = useState(5);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileMsgType, setProfileMsgType] = useState("success");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwMsgType, setPwMsgType] = useState("success");
  const [savingPw, setSavingPw] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Settings Tabs: profile | security
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    apiGetProfile()
      .then((data) => {
        setProfile(data.user);
        setName(data.user?.name || "");
        setStudyGoal(data.user?.studyGoalHours || 5);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleProfileSave = async () => {
    setProfileMsg("");
    setSavingProfile(true);
    try {
      const data = await apiUpdateProfile({ name, studyGoalHours: studyGoal });
      if (data.user) {
        saveAuth(localStorage.getItem("token"), data.user);
        setProfile(data.user);
        setProfileMsg("Profile updated successfully! ✨");
        setProfileMsgType("success");
      } else {
        setProfileMsg(data.message || "Update failed.");
        setProfileMsgType("error");
      }
    } catch {
      setProfileMsg("Server error.");
      setProfileMsgType("error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwMsg("");
    if (!currentPw || !newPw) {
      setPwMsg("Please fill both password fields.");
      setPwMsgType("error");
      return;
    }
    setSavingPw(true);
    try {
      const data = await apiChangePassword(currentPw, newPw);
      if (data.success || !data.message?.includes("error")) {
        setPwMsg("Password updated successfully! 🔒");
        setPwMsgType("success");
        setCurrentPw("");
        setNewPw("");
      } else {
        setPwMsg(data.message || "Failed to update password.");
        setPwMsgType("error");
      }
    } catch {
      setPwMsg("Server error.");
      setPwMsgType("error");
    } finally {
      setSavingPw(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", sub: "Identity & daily goals", icon: HiOutlineUser },
    { id: "security", label: "Security", sub: "Password & safety", icon: HiOutlineLockClosed },
  ];

  const strength = pwStrength(newPw);
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong", "Elite"][strength];
  const strengthColor = ["#e2e8f0", "#ef4444", "#f59e0b", "#eab308", "#22c55e", "#059669"][strength];

  const initials = (name || "ST").trim().slice(0, 2).toUpperCase();

  return (
    <div className="dashboard">
      <SharedSidebar />
      <div className="main settings-main st-page">
        <div className="st-bg" aria-hidden="true">
          <span className="st-orb st-orb-1" />
          <span className="st-orb st-orb-2" />
          <span className="st-float sf1" /><span className="st-float sf2" />
          <span className="st-float sf3" /><span className="st-float sf4" />
        </div>

        {/* Header */}
        <div className="st-hero st-rise">
          <span className="st-gear"><HiOutlineCog size={26} /><span className="st-gear-ring" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="st-eyebrow"><span className="st-eyebrow-dot" /> CONTROL CENTER</p>
            <h1>Tune your <span className="st-grad">study cockpit</span></h1>
            <p>Identity, daily goals and account safety — all in one sleek panel.</p>
          </div>
          <div className="st-hero-chip">
            <HiOutlineSparkles size={14} /> {profile?.email ? "Synced" : "Local"}
          </div>
        </div>

        {loading ? (
          <div className="settings-loading st-rise">
            <div className="loading-ring"></div>
            <p>Loading your configuration…</p>
            <div className="st-skel-row"><span /><span /><span /></div>
          </div>
        ) : (
          <div className="settings-grid">
            {/* Sidebar Tabs */}
            <div className="settings-tabs-side st-rise" style={{ animationDelay: "80ms" }}>
              {TABS.map((t) => {
                const TabIcon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    className={`settings-tab-btn st-tab${active ? " active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span className="st-tab-icon"><TabIcon size={17} /></span>
                    <span className="st-tab-copy">
                      <strong>{t.label}</strong>
                      <span>{t.sub}</span>
                    </span>
                    {active && <HiOutlineArrowRight size={14} className="st-tab-arrow" />}
                  </button>
                );
              })}

              <div className="settings-profile-badge st-id">
                <span className="st-avatar-ring"><span className="badge-avatar">{initials}</span></span>
                <div className="badge-info">
                  <div className="badge-name">{name || "Student"}</div>
                  <div className="badge-email">{profile?.email}</div>
                </div>
                <span className="st-goal-mini"><HiOutlineFire size={13} />{studyGoal}h</span>
              </div>

              <div className="st-side-note">
                <HiOutlineShieldCheck size={14} /> Changes save instantly to your account.
              </div>
            </div>

            {/* Content Area */}
            <div className="settings-content-card st-rise" style={{ animationDelay: "140ms" }} key={activeTab}>
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="settings-pane st-pane">
                  <div className="st-pane-head">
                    <span className="st-pane-icon blue"><HiOutlineUser size={20} /></span>
                    <div>
                      <h2>Profile Settings</h2>
                      <p className="pane-subtitle">Manage your identity and daily target study hours</p>
                    </div>
                  </div>

                  <div className="st-avatar-row">
                    <span className="st-avatar-xl">{initials}</span>
                    <div>
                      <strong>{name || "Student"}</strong>
                      <p>{profile?.email}</p>
                      <span className="st-joined">🎓 {studyGoal}h daily goal · {profile?.subjects?.length || 5} subjects tracked</span>
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address 🔒</label>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>

                  <div className="st-goal-card">
                    <div className="st-goal-head">
                      <span><HiOutlineFire size={16} /> Daily Study Goal</span>
                      <strong>{studyGoal}h / day · {Number(studyGoal) * 7}h / week</strong>
                    </div>
                    <div className="st-stepper">
                      <button onClick={() => setStudyGoal((g) => Math.max(1, Number(g) - 1))} aria-label="Decrease goal">−</button>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={studyGoal}
                        onChange={(e) => setStudyGoal(Number(e.target.value))}
                        aria-label="Daily study goal hours"
                      />
                      <button onClick={() => setStudyGoal((g) => Math.min(12, Number(g) + 1))} aria-label="Increase goal">+</button>
                    </div>
                    <div className="st-goal-bar"><span style={{ width: `${(Number(studyGoal) / 12) * 100}%` }} /></div>
                    <div className="st-goal-scale"><span>1h light</span><span>6h focused</span><span>12h beast</span></div>
                    <p className="form-help">Powers your Dashboard streak ring and consistency score.</p>
                  </div>

                  <button className={`settings-save-btn ${savingProfile ? "busy" : ""}`} onClick={handleProfileSave} disabled={savingProfile}>
                    {savingProfile ? (<><span className="st-spin" /> Saving…</>) : (<><HiOutlineCheck size={16} /> Save Changes</>)}
                  </button>

                  {profileMsg && (
                    <div className={`form-feedback-alert st-pop ${profileMsgType}`}>
                      {profileMsg}
                    </div>
                  )}
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="settings-pane st-pane">
                  <div className="st-pane-head">
                    <span className="st-pane-icon violet"><HiOutlineLockClosed size={20} /></span>
                    <div>
                      <h2>Security Settings</h2>
                      <p className="pane-subtitle">Update your password to keep your academic account safe</p>
                    </div>
                  </div>

                  <div className="st-shield-strip">
                    <HiOutlineShieldCheck size={16} />
                    <span>Use 10+ characters with mixed case, a number and a symbol for elite strength.</span>
                  </div>

                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="st-pass-wrap">
                      <input
                        type={showCur ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                      />
                      <button className="st-eye" onClick={() => setShowCur((s) => !s)} aria-label={showCur ? "Hide password" : "Show password"}>
                        {showCur ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="st-pass-wrap">
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                      />
                      <button className="st-eye" onClick={() => setShowNew((s) => !s)} aria-label={showNew ? "Hide password" : "Show password"}>
                        {showNew ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                      </button>
                    </div>
                    {newPw && (
                      <div className="st-meter">
                        <div className="st-meter-bar">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={i <= strength ? "on" : ""} style={i <= strength ? { background: strengthColor } : {}} />
                          ))}
                        </div>
                        <span className="st-meter-label" style={{ color: strengthColor }}>{strengthLabel} · {strength}/5</span>
                      </div>
                    )}
                  </div>

                  <button className={`settings-save-btn violet ${savingPw ? "busy" : ""}`} onClick={handlePasswordChange} disabled={savingPw}>
                    {savingPw ? (<><span className="st-spin" /> Updating…</>) : (<><HiOutlineLockClosed size={15} /> Update Password</>)}
                  </button>

                  {pwMsg && (
                    <div className={`form-feedback-alert st-pop ${pwMsgType}`}>
                      {pwMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
