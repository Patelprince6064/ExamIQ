import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineMenu,
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineChatAlt2,
  HiOutlineChartBar,
  HiOutlineUpload,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineRefresh,
} from "react-icons/hi";
import {
  apiDashboard,
  apiWeakTopics,
  apiQuizHistory,
  getUser,
} from "../services/api";
import { SharedSidebar } from "../components/layout/SharedLayout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const BLUE = "#2563eb";
const CYAN = "#06b6d4";
const SLATE = "#64748b";

/* ── Gentle scroll-reveal (transform + opacity only) ── */
const useReveal = (ready) => {
  useEffect(() => {
    if (!ready) return undefined;
    const els = document.querySelectorAll(".dash .rv");
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [dashData, setDashData] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null); // null = not loaded yet
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [animate, setAnimate] = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    let cancelled = false;
    Promise.allSettled([
      apiDashboard(),
      apiWeakTopics(),
      apiQuizHistory(50),
    ]).then(([dash, weak, hist]) => {
      if (cancelled) return;
      if (dash.status === "fulfilled" && dash.value?.stats) {
        setDashData(dash.value);
      } else {
        setLoadError(true);
      }
      if (weak.status === "fulfilled" && Array.isArray(weak.value?.weakTopics)) {
        setWeakTopics(weak.value.weakTopics);
      } else {
        setWeakTopics([]);
      }
      if (hist.status === "fulfilled" && Array.isArray(hist.value?.results)) {
        setHistory(hist.value.results);
      } else {
        setHistory([]);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Progress bars fill shortly after data paints
  useEffect(() => {
    if (loading) return undefined;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  useReveal(!loading && !loadError);

  /* ── Derived data (all real, nothing invented) ── */
  const stats = useMemo(
    () =>
      dashData?.stats || {
        testsTaken: 0,
        accuracy: 0,
        studyHours: 0,
        streak: 0,
      },
    [dashData]
  );
  const subjects = useMemo(
    () => dashData?.subjectProgress || [],
    [dashData]
  );
  const activity = useMemo(() => dashData?.recentActivity || [], [dashData]);
  const goalHours = user?.studyGoalHours || 5;

  // Question totals from real quiz history (drives the donut + counts)
  const qTotals = useMemo(() => {
    if (!history || history.length === 0)
      return { totalQ: 0, totalC: 0, pct: 0 };
    const totalQ = history.reduce((s, r) => s + (r.totalQuestions || 0), 0);
    const totalC = history.reduce((s, r) => s + (r.correctAnswers || 0), 0);
    return {
      totalQ,
      totalC,
      pct: totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0,
    };
  }, [history]);

  // 7-day trend from backend dailyActivity (weekday → {quizzes, avgScore})
  const trend = useMemo(() => {
    const daily = dashData?.dailyActivity || {};
    const labels = [];
    const values = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(WEEKDAYS[d.getDay()]);
      const hit = daily[WEEKDAYS[d.getDay()]];
      values.push(hit && hit.quizzes > 0 ? hit.avgScore : null);
    }
    const activeDays = values.filter((v) => v !== null).length;
    return { labels, values, show: activeDays >= 2 };
  }, [dashData]);

  // Study Coach — strictly data-driven, honest framing
  const coach = useMemo(() => {
    if (weakTopics && weakTopics.length > 0) {
      const w = weakTopics[0];
      return {
        mode: "data",
        eyebrow: `Based on your last ${history?.length || 0} quizzes`,
        title: "Your next best study session",
        body: `Review ${w.topic || "your weakest topic"} in ${
          w.subject || "your weakest subject"
        } — you're at ${w.accuracy}% across ${w.attempted} attempted question${
          w.attempted === 1 ? "" : "s"
        }. A focused practice set is the fastest way to lift it.`,
        cta: "Start Practice",
      };
    }
    if (subjects.length > 0) {
      const lowest = [...subjects].sort(
        (a, b) => a.avgScore - b.avgScore
      )[0];
      return {
        mode: "data",
        eyebrow: "Based on your subject averages",
        title: "Your next best study session",
        body: `${lowest.subject} is your lowest average at ${lowest.avgScore}% over ${lowest.attempts} attempt${lowest.attempts === 1 ? "" : "s"}. Practise it next to balance your preparation.`,
        cta: "Start Practice",
      };
    }
    return {
      mode: "onboarding",
      eyebrow: "Getting started",
      title: "Let's build your study profile",
      body: "Take your first quiz and future recommendations here will be built on your real performance — weakest topics first.",
      cta: "Take Your First Quiz",
    };
  }, [weakTopics, subjects, history]);

  // Continue learning — most recent real quiz
  const resume = history && history.length > 0 ? history[0] : null;

  // Today's sessions (real, from history timestamps)
  const todaySessions = useMemo(() => {
    if (!history) return [];
    const now = new Date();
    return history.filter((r) => {
      const d = new Date(r.createdAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [history]);

  const todayWeekday = WEEKDAYS[new Date().getDay()];
  const todayQuizzes = dashData?.dailyActivity?.[todayWeekday]?.quizzes || 0;

  /* ── Chart configs ── */
  const tooltipStyle = {
    backgroundColor: "#172033",
    titleColor: "#ffffff",
    bodyColor: "#cbd5e1",
    padding: 10,
    cornerRadius: 8,
    displayColors: false,
  };

  const barData = {
    labels: subjects.length > 0 ? subjects.map((s) => s.subject) : ["No data yet"],
    datasets: [
      {
        data: subjects.length > 0 ? subjects.map((s) => s.avgScore) : [0],
        backgroundColor:
          subjects.length > 0
            ? subjects.map((_, i) =>
                i % 2 === 0 ? "rgba(37,99,235,0.85)" : "rgba(6,182,212,0.85)"
              )
            : ["#e2e8f0"],
        hoverBackgroundColor:
          subjects.length > 0
            ? subjects.map((_, i) => (i % 2 === 0 ? BLUE : CYAN))
            : ["#e2e8f0"],
        borderRadius: 6,
        borderSkipped: false,
        barThickness: "flex",
        maxBarThickness: 44,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipStyle },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: SLATE, font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(100,116,139,0.12)" },
        ticks: { color: SLATE, font: { size: 11 }, stepSize: 25 },
      },
    },
  };

  const doughnutData = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [qTotals.totalC, qTotals.totalQ - qTotals.totalC],
        backgroundColor: [BLUE, "#e2e8f0"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
  const doughnutOptions = {
    cutout: "76%",
    plugins: { legend: { display: false }, tooltip: tooltipStyle },
  };

  const lineData = {
    labels: trend.labels,
    datasets: [
      {
        data: trend.values,
        borderColor: BLUE,
        backgroundColor: "rgba(37,99,235,0.10)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: BLUE,
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipStyle },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: SLATE, font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(100,116,139,0.12)" },
        ticks: { color: SLATE, font: { size: 11 }, stepSize: 25 },
      },
    },
  };

  const statCards = [
    {
      icon: HiOutlineDocumentText,
      label: "Tests Taken",
      value: String(stats.testsTaken),
      sub:
        subjects.length > 0
          ? `Across ${subjects.length} subject${subjects.length === 1 ? "" : "s"}`
          : "No quizzes yet",
      tone: "blue",
    },
    {
      icon: HiOutlineCheckCircle,
      label: "Accuracy",
      value: `${stats.accuracy}%`,
      sub:
        qTotals.totalQ > 0
          ? `${qTotals.totalQ} questions answered`
          : "Answer questions to set this",
      tone: "green",
    },
    {
      icon: HiOutlineClock,
      label: "Study Hours",
      value: `${stats.studyHours}h`,
      sub: `Daily goal · ${goalHours}h`,
      tone: "cyan",
    },
    {
      icon: HiOutlineLightningBolt,
      label: "Day Streak",
      value: String(stats.streak),
      sub:
        stats.streak > 0
          ? `${stats.streak} day${stats.streak === 1 ? "" : "s"} in a row`
          : "Complete a quiz to start",
      tone: "amber",
    },
  ];

  const quickActions = [
    { to: "/practice", icon: HiOutlineChatAlt2, label: "Start AI Chat", primary: true },
    { to: "/subjects", icon: HiOutlineBookOpen, label: "Practice Quiz" },
    { to: "/analytics", icon: HiOutlineChartBar, label: "View Analytics" },
    { to: "/pdf-upload", icon: HiOutlineUpload, label: "Upload PDF" },
  ];

  const openMobileNav = () => document.body.classList.add("sidebar-open");

  return (
    <div className="dashboard dash">
      <SharedSidebar />

      <div className="dash-main">
        {/* ══ HEADER ══ */}
        <header className="dash-header">
          <button
            className="dash-menu-btn"
            onClick={openMobileNav}
            aria-label="Open navigation menu"
          >
            <HiOutlineMenu size={20} />
          </button>
          <div className="dash-header-left">
            <h1>Welcome back, {user?.name?.split(" ")[0] || "Student"}</h1>
            <p>Here&apos;s your study overview for today.</p>
          </div>
          <div className="dash-header-right">
            <span className="dash-date">
              <HiOutlineCalendar size={14} aria-hidden="true" /> {todayLabel}
            </span>
            <span className="dash-avatar" title={user?.name || "Student"}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
        </header>

        {loading ? (
          /* ══ SKELETON ══ */
          <div className="dash-skeleton" aria-busy="true" aria-label="Loading dashboard">
            <div className="sk-stats">
              {[0, 1, 2, 3].map((i) => (
                <div className="sk-card" key={i}>
                  <div className="sk-line sk-w40" />
                  <div className="sk-line sk-w60" />
                  <div className="sk-line sk-w50" />
                </div>
              ))}
            </div>
            <div className="sk-line sk-hero" />
            <div className="sk-charts">
              <div className="sk-card sk-tall" />
              <div className="sk-card sk-tall" />
            </div>
          </div>
        ) : loadError || !dashData ? (
          <div className="dash-error rv in">
            <h2>Couldn&apos;t load your dashboard</h2>
            <p>Check your connection and that the backend is running.</p>
            <button
              className="dash-btn primary"
              onClick={() => window.location.reload()}
            >
              <HiOutlineRefresh size={15} aria-hidden="true" /> Retry
            </button>
          </div>
        ) : (
          <>
            {/* ══ STAT CARDS ══ */}
            <section className="dash-stats" aria-label="Study statistics">
              {statCards.map((s, i) => (
                <div
                  className={`dash-stat tone-${s.tone} rv`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  key={s.label}
                >
                  <div className="dash-stat-top">
                    <span className="dash-stat-icon" aria-hidden="true">
                      <s.icon size={17} />
                    </span>
                    <h3>{s.label}</h3>
                  </div>
                  <p className="dash-stat-value">{s.value}</p>
                  <span className="dash-stat-sub">{s.sub}</span>
                </div>
              ))}
            </section>

            {/* ══ AI STUDY COACH ══ */}
            <section className="dash-coach rv" aria-label="Study coach recommendation">
              <div className="dash-coach-inner">
                <div className="dash-coach-copy">
                  <p className="dash-eyebrow">
                    <HiOutlineSparkles size={13} aria-hidden="true" /> Study
                    Coach · {coach.eyebrow}
                  </p>
                  <h2>{coach.title}</h2>
                  <p>{coach.body}</p>
                </div>
                <Link
                  to={coach.mode === "data" ? "/subjects" : "/practice"}
                  className="dash-btn primary"
                >
                  {coach.cta} <HiOutlineArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </section>

            {/* ══ ANALYTICS ══ */}
            <section className="dash-charts" aria-label="Performance analytics">
              <div className="dash-card rv">
                <div className="dash-card-head">
                  <div>
                    <h3>Subject Performance</h3>
                    <p>Average quiz scores per subject</p>
                  </div>
                </div>
                {subjects.length > 0 ? (
                  <div className="dash-chart-box">
                    <Bar data={barData} options={barOptions} />
                  </div>
                ) : (
                  <div className="dash-empty">
                    <HiOutlineChartBar size={26} aria-hidden="true" />
                    <p>No subject data yet</p>
                    <span>Complete a quiz to see your averages here.</span>
                    <Link to="/subjects" className="dash-btn ghost">
                      Practice a subject
                    </Link>
                  </div>
                )}
              </div>

              <div className="dash-card rv">
                <div className="dash-card-head">
                  <div>
                    <h3>Overall Accuracy</h3>
                    <p>Correct vs incorrect answers</p>
                  </div>
                </div>
                {qTotals.totalQ > 0 ? (
                  <div className="dash-donut-wrap">
                    <div className="dash-donut">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                      <div className="dash-donut-center">
                        <p>{qTotals.pct}%</p>
                        <span>accuracy</span>
                      </div>
                    </div>
                    <div className="dash-donut-legend">
                      <span className="lg correct">
                        {qTotals.totalC} correct
                      </span>
                      <span className="lg wrong">
                        {qTotals.totalQ - qTotals.totalC} incorrect
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="dash-empty">
                    <HiOutlineCheckCircle size={26} aria-hidden="true" />
                    <p>No answers recorded</p>
                    <span>Your accuracy donut will appear after your first quiz.</span>
                  </div>
                )}
              </div>

              <div className="dash-card rv dash-trend">
                <div className="dash-card-head">
                  <div>
                    <h3>Performance Trend</h3>
                    <p>Average score over the last 7 days</p>
                  </div>
                </div>
                {trend.show ? (
                  <div className="dash-chart-box short">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                ) : (
                  <div className="dash-empty">
                    <HiOutlineChartBar size={26} aria-hidden="true" />
                    <p>Not enough history yet</p>
                    <span>
                      Take quizzes on at least two different days to unlock your trend.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ══ PLAN + WEAK TOPICS ══ */}
            <section className="dash-duo">
              <div className="dash-card rv" aria-label="Today's study plan">
                <div className="dash-card-head">
                  <div>
                    <h3>Today&apos;s Study Plan</h3>
                    <p>
                      {todayQuizzes > 0
                        ? `${todayQuizzes} quiz${todayQuizzes === 1 ? "" : "zes"} completed today`
                        : "What you've completed today"}
                  </p>
                </div>
                <Link to="/roadmap" className="dash-link">
                  Full plan <HiOutlineArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
              {todaySessions.length > 0 ? (
                <>
                  <ul className="dash-task-list">
                    {todaySessions.slice(0, 4).map((s) => (
                      <li className="dash-task done" key={s._id}>
                        <span className="dash-task-check" aria-hidden="true">
                          <HiOutlineClipboardCheck size={15} />
                        </span>
                        <span className="dash-task-text">
                          {s.subject}
                          {s.topic ? ` · ${s.topic}` : ""} — {s.score}%
                        </span>
                        <span className="dash-task-time">
                          {timeAgo(s.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/practice" className="dash-btn ghost wide">
                    Continue studying{" "}
                    <HiOutlineArrowRight size={14} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <div className="dash-empty left">
                  <p>No sessions logged today</p>
                  <span>
                    Quizzes you complete will appear here as your daily plan.
                  </span>
                  <div className="dash-empty-actions">
                    <Link to="/practice" className="dash-btn primary sm">
                      Start studying
                    </Link>
                    <Link to="/roadmap" className="dash-btn ghost sm">
                      Create study plan
                    </Link>
                  </div>
                </div>
              )}
            </div>

              <div className="dash-card rv" aria-label="Weak topics">
                <div className="dash-card-head">
                  <div>
                    <h3>Weak Topics</h3>
                    <p>
                      {weakTopics && weakTopics.length > 0
                        ? "Below 70% accuracy — practise these first"
                        : "Topics needing extra practice"}
                    </p>
                  </div>
                </div>
                {weakTopics && weakTopics.length > 0 ? (
                  <ul className="dash-weak-list">
                    {weakTopics.slice(0, 4).map((t, i) => (
                      <li className="dash-weak" key={`${t.topic}-${i}`}>
                        <div className="dash-weak-top">
                          <span className="dash-weak-subject">
                            {t.subject || "General"}
                          </span>
                          <span
                            className={`dash-weak-pct ${
                              t.accuracy < 40 ? "critical" : "watch"
                            }`}
                          >
                            {t.accuracy}%
                          </span>
                        </div>
                        <p className="dash-weak-title">{t.topic || "Untitled topic"}</p>
                        <div className="dash-bar">
                          <div
                            className={`dash-fill ${
                              t.accuracy < 40 ? "critical" : "watch"
                            }`}
                            style={{ width: animate ? `${t.accuracy}%` : "0%" }}
                          />
                        </div>
                        <Link to="/subjects" className="dash-btn ghost sm wide">
                          Practise this topic
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dash-empty left">
                    <p>
                      {weakTopics === null
                        ? "Analysing your quizzes…"
                        : "No weak spots detected"}
                    </p>
                    <span>
                      {weakTopics === null
                        ? ""
                        : history && history.length > 0
                          ? "All your attempted topics are at 70% or above. Nice work — keep pushing."
                          : "Take a few quizzes and topics under 70% accuracy will show up here with practice links."}
                    </span>
                    {(!history || history.length === 0) && (
                      <Link to="/subjects" className="dash-btn ghost sm">
                        Take a quiz
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ══ CONTINUE + ACTIVITY ══ */}
            <section className="dash-duo">
              <div className="dash-card rv" aria-label="Continue learning">
                <div className="dash-card-head">
                  <div>
                    <h3>Continue Learning</h3>
                    <p>Pick up where you left off</p>
                  </div>
                </div>
                {resume ? (
                  <div className="dash-resume">
                    <span className="dash-resume-icon" aria-hidden="true">
                      <HiOutlineBookOpen size={18} />
                    </span>
                    <div className="dash-resume-copy">
                      <p>
                        {resume.subject}
                        {resume.topic ? ` · ${resume.topic}` : ""}
                      </p>
                      <span>
                        Last scored {resume.score}% · {timeAgo(resume.createdAt)}
                      </span>
                    </div>
                    <Link to="/subjects" className="dash-btn primary sm">
                      Resume
                    </Link>
                  </div>
                ) : (
                  <div className="dash-empty left">
                    <p>Nothing in progress</p>
                    <span>Your most recent quiz or upload will appear here.</span>
                    <div className="dash-empty-actions">
                      <Link to="/subjects" className="dash-btn ghost sm">
                        Browse subjects
                      </Link>
                      <Link to="/pdf-upload" className="dash-btn ghost sm">
                        Upload notes
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="dash-card rv" aria-label="Recent activity">
                <div className="dash-card-head">
                  <div>
                    <h3>Recent Activity</h3>
                    <p>Your latest quiz sessions</p>
                  </div>
                </div>
                {activity.length > 0 ? (
                  <ul className="dash-activity-list">
                    {activity.slice(0, 5).map((a) => (
                      <li className="dash-activity" key={a._id}>
                        <span
                          className={`dash-activity-dot ${
                            a.score >= 70 ? "good" : a.score >= 40 ? "mid" : "low"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="dash-activity-text">
                          {a.subject}
                          {a.topic ? ` — ${a.topic}` : ""}
                        </span>
                        <span className="dash-activity-time">
                          {timeAgo(a.date)}
                        </span>
                        <span className="dash-activity-score">{a.score}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="dash-empty left">
                    <p>No activity yet</p>
                    <span>
                      Completed quizzes, uploads and paper analyses will show up here.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* ══ QUICK ACTIONS ══ */}
            <nav className="dash-actions rv" aria-label="Quick actions">
              {quickActions.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className={`dash-action${a.primary ? " primary" : ""}`}
                >
                  <a.icon size={16} aria-hidden="true" /> {a.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
