import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "examiq_timer_v1";

const TimerContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved.total !== "number" || typeof saved.endAt !== "number") return null;
    return saved;
  } catch {
    return null;
  }
}

export function TimerProvider({ children }) {
  const [total, setTotal] = useState(0);        // full duration in seconds
  const [endAt, setEndAt] = useState(null);     // timestamp when it hits 0
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [finishedAt, setFinishedAt] = useState(null);
  const intervalRef = useRef(null);

  // Restore from localStorage on mount so the timer survives refresh/navigation
  useEffect(() => {
    const saved = loadState();
    if (!saved || saved.total <= 0) return;
    setTotal(saved.total);
    if (saved.endAt) {
      setEndAt(saved.endAt);
      setRunning(true);
    }
  }, []);

  const persist = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  useEffect(() => {
    persist({ total, endAt, running });
  }, [total, endAt, running]);

  // Tick loop — derives remaining from wall-clock endAt so it stays accurate
  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (endAt) {
          const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
          setRemaining(left);
          if (left <= 0) {
            setEndAt(null);
            setRunning(false);
            setFinishedAt(Date.now());
          }
        }
      }, 250);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endAt]);

  const setTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds));
    setTotal(s);
    setEndAt(null);
    setRunning(false);
    setRemaining(s);
    setFinishedAt(null);
  };

  const start = () => {
    if (total <= 0) return;
    const base = endAt ? endAt : Date.now() + total * 1000;
    const nowLeft = Math.max(0, Math.round((base - Date.now()) / 1000));
    setEndAt(Date.now() + nowLeft * 1000);
    setRunning(true);
  };

  const pause = () => {
    if (!endAt) return;
    const nowLeft = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    setTotal(nowLeft);
    setRemaining(nowLeft);
    setEndAt(null);
    setRunning(false);
  };

  const reset = () => {
    setTotal(0);
    setEndAt(null);
    setRunning(false);
    setRemaining(0);
    setFinishedAt(null);
  };

  const dismissFinished = () => setFinishedAt(null);

  return (
    <TimerContext.Provider
      value={{ total, remaining, running, finishedAt, setTime, start, pause, reset, dismissFinished }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);

export const formatTime = (secs) => {
  const s = Math.max(0, secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};