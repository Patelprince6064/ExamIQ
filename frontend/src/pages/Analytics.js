import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineStar,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineBookOpen,
  HiOutlineRefresh,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";
import { apiAnalytics, apiLeaderboard, getUser } from "../services/api";
import { SharedSidebar } from "../components/layout/SharedLayout";
import "./Analytics.css";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

/* Count-up that respects reduced motion */
const useCountUp = (target, active, duration = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
};

/* Gentle scroll reveal */
const useReveal = (ready) => {
  useEffect(() => {
    if (!ready) return undefined;
    const els = document.querySelectorAll(".an-page .rv");
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

const RING_R = 62;
const RING_C = 2 * Math.PI * RING_R;

function StatCard({ icon: Icon, label, value, suffix, sub, tone, active, delay }) {
  const n = useCountUp(value, active);
  return (
    <div className={`an-stat tone-${tone} rv`} style={{ transitionDelay: `${delay}ms` }}>
      <span className="an-stat-icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <div className="an-stat-copy">
        <p className="an-stat-val">
          {n}
          {suffix}
        </p>
        <p className="an-stat-label">{label}</p>
        <span className="an-stat-sub">{sub}</span>
      </div>
    </div>
  );
}

function Analytics() {
  const navigate = useNavigate();
  const user = getUser();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    let cancelled = false;
    Promise.allSettled([apiAnalytics(), apiLeaderboard()]).then(([a, lb]) => {
      if (cancelled) return;
      if (a.status === "fulfilled" && a.value && typeof a.value.hasData !== "undefined") {
        setData(a.value);
      } else {
        setLoadError(true);
      }
      if (lb.status === "fulfilled" && Array.isArray(lb.value?.leaderboard)) {
        setLeaderboard(lb.value.leaderboard);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (loading) return undefined;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  const hasData = !!data?.hasData;
  useReveal(!loading && !loadError && hasData);

  const overview = data?.overview || {};
  const subjects = useMemo(
    () => [...(data?.subjectPerformance || [])].sort((a, b) => b.avgScore - a.avgScore),
    [data]
  );
  const trend = data?.scoreTrend || [];
  const weekly = data?.weeklyActivity || [];
  const dist = data?.scoreDistribution || {};

  /* Auto insights — strictly derived, never invented */
  const insights = useMemo(() => {
    const out = [];
    if (subjects.length > 0) {
      const best = subjects[0];
      out.push({
        icon: HiOutlineAcademicCap,
        tone: "amber",
        title: `Strongest: ${best.subject}`,
        body: `${best.avgScore}% average over ${best.attempts} attempt${best.attempts === 1 ? "" : "s"}`,
      });
      const most = [...subjects].sort((a, b) => b.attempts - a.attempts)[0];
      if (most && most.subject !== best.subject) {
        out.push({
          icon: HiOutlineBookOpen,
          tone: "blue",
          title: `Most practiced: ${most.subject}`,
          body: `${most.attempts} quiz${most.attempts === 1 ? "" : "zes"} · ${most.avgScore}% average`,
        });
      }
    }
    if (trend.length >= 4) {
      const first = trend.slice(0, 3).reduce((s, t) => s + t.score, 0) / 3;
      const last = trend.slice(-3).reduce((s, t) => s + t.score, 0) / 3;
      const delta = Math.round(last - first);
      if (delta !== 0) {
        out.push({
          icon: delta > 0 ? HiOutlineTrendingUp : HiOutlineTrendingDown,
          tone: delta > 0 ? "green" : "red",
          title: delta > 0 ? `Trending up +${delta} pts` : `Dipped ${delta} pts`,
          body:
            delta > 0
              ? "Your recent quizzes beat your earlier average"
              : "Your recent quizzes trail your earlier average — review weak topics",
        });
      }
    }
    return out.slice(0, 3);
  }, [subjects, trend]);

  const bestEver = trend.length > 0 ? Math.max(...trend.map((t) => t.score)) : 0;
  const maxWeekly = Math.max(1, ...weekly.map((d) => d.quizzes));

  const lineData = {
    labels: trend.map((t) => `#${t.index}`),
    datasets: [
      {
        data: trend.map((t) => t.score),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.10)",
        fill: true,
        tension: 0.42,
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#172033",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const t = trend[items[0]?.dataIndex];
            return t ? `${t.subject} · ${new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "";
          },
          label: (item) => `Score: ${item.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 }, maxTicksLimit: 8 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(100,116,139,0.12)" },
        ticks: { color: "#64748b", font: { size: 11 }, stepSize: 25 },
      },
    },
  };

  const distRows = [
    { range: "81–100", count: dist["81-100"] || 0, cls: "great", note: "Excellent" },
    { range: "61–80", count: dist["61-80"] || 0, cls: "good", note: "Good" },
    { range: "41–60", count: dist["41-60"] || 0, cls: "mid", note: "Passing" },
    { range: "0–40", count: dist["0-40"] || 0, cls: "low", note: "Needs work" },
  ];
  const maxDist = Math.max(1, ...distRows.map((d) => d.count));

  return (
    <div className="dashboard an-page">
      <SharedSidebar />
      <div className="main an-main">
        {/* ══ HEADER ══ */}
        <header className="an-header">
          <span className="an-header-icon" aria-hidden="true">
            <HiOutlineChartBar size={24} />
          </span>
          <div className="an-header-copy">
            <h1>Performance Analytics</h1>
            <p>Track your progress, identify weak areas, and celebrate improvements.</p>
          </div>
          {hasData && !loading && (
            <span className="an-best">
              <HiOutlineSparkles size={14} aria-hidden="true" /> Personal best {bestEver}%
            </span>
          )}
        </header>

        {loading ? (
          <div className="an-skeleton" aria-busy="true" aria-label="Loading analytics">
            <div className="sk-row">
              {[0, 1, 2, 3].map((i) => (
                <div className="sk-card" key={i}>
                  <div className="sk-line sk-w40" />
                  <div className="sk-line sk-w60" />
                </div>
              ))}
            </div>
            <div className="sk-line sk-hero" />
            <div className="sk-row-2">
              <div className="sk-card sk-tall" />
              <div className="sk-card sk-tall" />
            </div>
          </div>
        ) : loadError ? (
          <div className="an-empty">
            <h2>Couldn&apos;t load analytics</h2>
            <p>Check your connection and that the backend is running.</p>
            <button className="an-btn primary" onClick={() => window.location.reload()}>
              <HiOutlineRefresh size={15} aria-hidden="true" /> Retry
            </button>
          </div>
        ) : !hasData ? (
          <div className="an-empty">
            <span className="an-empty-icon" aria-hidden="true">
              <HiOutlineChartBar size={34} />
            </span>
            <h2>No data yet</h2>
            <p>Take some quizzes and your performance story will appear here.</p>
            <Link to="/practice" className="an-btn primary">
              Start practicing <HiOutlineArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            {/* ══ STATS ══ */}
            <section className="an-stats" aria-label="Overview statistics">
              <StatCard
                icon={HiOutlineDocumentText}
                label="Tests Taken"
                value={overview.testsTaken || 0}
                suffix=""
                sub={subjects.length ? `Across ${subjects.length} subject${subjects.length === 1 ? "" : "s"}` : "Keep going"}
                tone="blue"
                active
                delay={0}
              />
              <StatCard
                icon={HiOutlineCheckCircle}
                label="Overall Accuracy"
                value={overview.overallAccuracy || 0}
                suffix="%"
                sub="Correct across all quizzes"
                tone="green"
                active
                delay={60}
              />
              <StatCard
                icon={HiOutlineStar}
                label="Average Score"
                value={overview.avgScore || 0}
                suffix="%"
                sub="Mean quiz score"
                tone="amber"
                active
                delay={120}
              />
              <StatCard
                icon={HiOutlineLightningBolt}
                label="Day Streak"
                value={overview.streak || 0}
                suffix=""
                sub={(overview.streak || 0) > 0 ? "Days in a row" : "Quiz today to start"}
                tone="red"
                active
                delay={180}
              />
            </section>

            {/* ══ INSIGHTS ══ */}
            {insights.length > 0 && (
              <section className="an-insights rv" aria-label="Key insights">
                {insights.map((ins) => (
                  <div className={`an-insight tone-${ins.tone}`} key={ins.title}>
                    <span className="an-insight-icon" aria-hidden="true">
                      <ins.icon size={18} />
                    </span>
                    <div>
                      <p>{ins.title}</p>
                      <span>{ins.body}</span>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* ══ MASTERY + RING ══ */}
            <section className="an-duo">
              <div className="an-card rv" aria-label="Subject mastery">
                <div className="an-card-head">
                  <div>
                    <h3>Subject Mastery</h3>
                    <p>Average vs best score per subject</p>
                  </div>
                  <span className="an-tag">Ranked</span>
                </div>
                <ul className="an-mastery">
                  {subjects.map((s, i) => (
                    <li className="an-subject" key={s.subject}>
                      <div className="an-subject-top">
                        <span className="an-rank" aria-hidden="true">{i + 1}</span>
                        <span className="an-subject-name">{s.subject}</span>
                        <span className="an-attempts">
                          {s.attempts} attempt{s.attempts === 1 ? "" : "s"}
                        </span>
                        <span className="an-avg">{s.avgScore}%</span>
                      </div>
                      <div
                        className="an-bar"
                        role="img"
                        aria-label={`${s.subject}: ${s.avgScore}% average, ${s.bestScore}% best`}
                      >
                        <div
                          className="an-fill"
                          style={{ width: animate ? `${s.avgScore}%` : "0%" }}
                        />
                        <span
                          className="an-best-tick"
                          style={{ left: `${s.bestScore}%` }}
                          title={`Best: ${s.bestScore}%`}
                        />
                      </div>
                      <span className="an-best-label">Best {s.bestScore}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="an-card rv" aria-label="Overall accuracy">
                <div className="an-card-head">
                  <div>
                    <h3>Overall Accuracy</h3>
                    <p>All questions answered</p>
                  </div>
                  <span className="an-tag">All time</span>
                </div>
                <div className="an-ring-wrap">
                  <svg className="an-ring" viewBox="0 0 150 150" role="img" aria-label={`Overall accuracy ${overview.overallAccuracy}%`}>
                    <circle cx="75" cy="75" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth="14" />
                    <circle
                      cx="75"
                      cy="75"
                      r={RING_R}
                      fill="none"
                      stroke="url(#anRingGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={animate ? RING_C * (1 - (overview.overallAccuracy || 0) / 100) : RING_C}
                      transform="rotate(-90 75 75)"
                      className="an-ring-arc"
                    />
                    <defs>
                      <linearGradient id="anRingGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="an-ring-center">
                    <p>{overview.overallAccuracy}%</p>
                    <span>accuracy</span>
                  </div>
                </div>
                <p className="an-ring-sub">
                  {overview.testsTaken} quiz{overview.testsTaken === 1 ? "" : "zes"} · {subjects.length} subject{subjects.length === 1 ? "" : "s"}
                </p>
              </div>
            </section>

            {/* ══ TREND + WEEKLY ══ */}
            <section className="an-duo">
              <div className="an-card rv" aria-label="Score trend">
                <div className="an-card-head">
                  <div>
                    <h3>Score Trend</h3>
                    <p>Last {trend.length} quizzes</p>
                  </div>
                  <span className="an-tag">Journey</span>
                </div>
                {trend.length >= 2 ? (
                  <div className="an-chart-box">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                ) : (
                  <div className="an-mini-empty">
                    <p>Need at least two quizzes for a trend</p>
                    <Link to="/subjects" className="an-btn ghost sm">Take another quiz</Link>
                  </div>
                )}
              </div>

              <div className="an-card rv" aria-label="Weekly activity">
                <div className="an-card-head">
                  <div>
                    <h3>Weekly Activity</h3>
                    <p>Quizzes per day, last 7 days</p>
                  </div>
                  <span className="an-tag">Habit</span>
                </div>
                <div className="an-week">
                  {weekly.map((d, i) => (
                    <div className={`an-day${i === weekly.length - 1 ? " today" : ""}`} key={`${d.day}-${i}`}>
                      <span className="an-day-avg">{d.quizzes > 0 ? `${d.avgScore}%` : "–"}</span>
                      <div className="an-day-track">
                        <div
                          className="an-day-fill"
                          style={{ height: animate ? `${Math.max(d.quizzes > 0 ? 12 : 4, (d.quizzes / maxWeekly) * 100)}%` : "4%" }}
                          title={`${d.quizzes} quiz${d.quizzes === 1 ? "" : "zes"}`}
                        />
                      </div>
                      <span className="an-day-name">{d.day}</span>
                    </div>
                  ))}
                </div>
                <p className="an-ring-sub">
                  {weekly.reduce((s, d) => s + d.quizzes, 0)} quizzes this week
                </p>
              </div>
            </section>

            {/* ══ DISTRIBUTION + LEADERBOARD ══ */}
            <section className="an-duo">
              <div className="an-card rv" aria-label="Score distribution">
                <div className="an-card-head">
                  <div>
                    <h3>Score Distribution</h3>
                    <p>Where your quizzes land</p>
                  </div>
                  <span className="an-tag">Ranges</span>
                </div>
                <ul className="an-dist">
                  {distRows.map((d) => (
                    <li key={d.range}>
                      <span className="an-dist-range">{d.range}</span>
                      <div className="an-bar slim">
                        <div
                          className={`an-fill ${d.cls}`}
                          style={{ width: animate ? `${(d.count / maxDist) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="an-dist-count">{d.count}</span>
                      <span className="an-dist-note">{d.note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {leaderboard.length > 0 && (
                <div className="an-card rv" aria-label="Leaderboard">
                  <div className="an-card-head">
                    <div>
                      <h3>Leaderboard</h3>
                      <p>Top students by correct answers</p>
                    </div>
                    <span className="an-tag">Top 10</span>
                  </div>
                  <ul className="an-lb">
                    {leaderboard.map((u) => {
                      const isYou = user?.name && u.name === user.name;
                      return (
                        <li className={`an-lb-row${u.rank <= 3 ? " top" : ""}${isYou ? " you" : ""}`} key={u.rank}>
                          <span className="an-lb-rank" aria-hidden="true">
                            {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                          </span>
                          <span className="an-lb-avatar" aria-hidden="true">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="an-lb-info">
                            <span className="an-lb-name">
                              {u.name}
                              {isYou && <em className="an-you">YOU</em>}
                            </span>
                            <span className="an-lb-meta">
                              {u.testsTaken} tests · {u.streak} day streak
                            </span>
                          </span>
                          <span className="an-lb-acc">{u.accuracy}%</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
