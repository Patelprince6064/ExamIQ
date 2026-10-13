import React, { useEffect, useRef, useState } from "react";
import { HiOutlineClock, HiOutlinePlay, HiOutlinePause, HiOutlineRefresh, HiOutlineCog, HiOutlineX, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { useTimer, formatTime } from "./TimerContext";
import "./Timer.css";

const PRESETS = [
  { label: "5 min", secs: 300 },
  { label: "10 min", secs: 600 },
  { label: "15 min", secs: 900 },
  { label: "30 min", secs: 1800 },
  { label: "1 hr", secs: 3600 },
];

function TimerWidget() {
  const { total, remaining, running, finishedAt, setTime, start, pause, reset, dismissFinished } = useTimer();
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hh, setHh] = useState(0);
  const [mm, setMm] = useState(0);
  const [ss, setSs] = useState(0);
  const [alert, setAlert] = useState(false);
  const audioCtxRef = useRef(null);
  const rootRef = useRef(null);

  const active = total > 0;

  const beep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const playTone = (freq, startAt, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
        gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + startAt + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + startAt);
        osc.stop(ctx.currentTime + startAt + dur + 0.05);
      };
      playTone(880, 0, 0.25);
      playTone(880, 0.35, 0.25);
      playTone(1175, 0.7, 0.5);
    } catch {
      /* audio unavailable */
    }
  };

  // Flash + beep when the timer completes
  useEffect(() => {
    if (finishedAt) {
      setAlert(true);
      beep();
      const t = setTimeout(() => {
        setAlert(false);
        dismissFinished();
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [finishedAt, dismissFinished]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const openPopup = () => {
    const left = remaining > 0 ? remaining : total;
    setHh(Math.floor(left / 3600));
    setMm(Math.floor((left % 3600) / 60));
    setSs(left % 60);
    setShowPopup(true);
  };

  const applySet = (e) => {
    e.preventDefault();
    const secs = hh * 3600 + mm * 60 + ss;
    if (secs <= 0) return;
    setTime(secs);
    start();
    setShowPopup(false);
  };

  const pillLabel = active
    ? formatTime(remaining)
    : finishedAt
      ? "Done!"
      : "Set Timer";

  return (
    <div className={`timer-fab ${alert ? "alert" : ""}`} ref={rootRef}>
      {/* Floating pill — top right */}
      <button
        className={`timer-pill ${running ? "live" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Study Timer"
      >
        <span className="timer-pill-icon"><HiOutlineClock size={15} /></span>
        <span className="timer-pill-time">{pillLabel}</span>
        {open ? <HiOutlineChevronUp size={12} /> : <HiOutlineChevronDown size={12} />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="timer-panel">
          <div className="timer-panel-head">
            <span>Study Timer</span>
            <span className={`timer-status ${running ? "on" : "off"}`}>
              {running ? "● Live" : finishedAt ? "● Done" : "○ Idle"}
            </span>
          </div>

          <div className="timer-display">{formatTime(remaining)}</div>

          {alert && <p className="timer-done-msg">⏰ Time's up!</p>}

          <div className="timer-controls">
            {active && !running ? (
              <button className="timer-btn primary" onClick={start} title="Start timer">
                <HiOutlinePlay size={13} /> Start
              </button>
            ) : running ? (
              <button className="timer-btn primary" onClick={pause} title="Pause timer">
                <HiOutlinePause size={13} /> Pause
              </button>
            ) : (
              <button className="timer-btn primary" onClick={openPopup} title="Set time">
                <HiOutlineCog size={13} /> Set Timer
              </button>
            )}
            {active ? (
              <button className="timer-btn ghost" onClick={reset} title="Reset timer">
                <HiOutlineRefresh size={13} /> Reset
              </button>
            ) : (
              <button className="timer-btn ghost" onClick={openPopup} title="Set time">
                <HiOutlineCog size={13} /> Set
              </button>
            )}
          </div>
        </div>
      )}

      {/* Set-time popup */}
      {showPopup && (
        <div className="timer-modal-backdrop" onClick={() => setShowPopup(false)}>
          <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="timer-modal-head">
              <h4>Set Study Timer</h4>
              <button className="timer-modal-close" onClick={() => setShowPopup(false)} title="Close">
                <HiOutlineX size={15} />
              </button>
            </div>

            <form className="timer-set-form" onSubmit={applySet}>
              <div className="timer-inputs">
                <label>
                  <input type="number" min="0" max="99" value={hh} onChange={(e) => setHh(Math.max(0, Number(e.target.value)))} />
                  <span>hrs</span>
                </label>
                <label>
                  <input type="number" min="0" max="59" value={mm} onChange={(e) => setMm(Math.min(59, Math.max(0, Number(e.target.value))))} />
                  <span>min</span>
                </label>
                <label>
                  <input type="number" min="0" max="59" value={ss} onChange={(e) => setSs(Math.min(59, Math.max(0, Number(e.target.value))))} />
                  <span>sec</span>
                </label>
              </div>

              <div className="timer-presets">
                {PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    className="timer-preset-btn"
                    onClick={() => { setTime(p.secs); start(); setShowPopup(false); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button type="submit" className="timer-set-submit" disabled={hh * 3600 + mm * 60 + ss <= 0}>
                Start Countdown
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimerWidget;