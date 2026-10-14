import React, { useEffect, useRef } from "react";
import "./TextReveal.css";

/* Lightweight blur-driven text reveal (no extra dependencies).
   Splits text into words or characters; each unit fades + unblurs
   with a stagger when the element enters the viewport. */
const TextReveal = ({
  text,
  as: Tag = "p",
  splitBy = "words",
  staggerDelay = 0.05,
  duration = 0.5,
  once = true,
  highlight = [],
  className = "",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("tr-visible");
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("tr-visible");
            if (once) io.unobserve(e.target);
          } else if (!once) {
            e.target.classList.remove("tr-visible");
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  let n = 0;
  const delayFor = () => {
    const d = (n * staggerDelay).toFixed(3);
    n += 1;
    return { transitionDelay: `${d}s`, transitionDuration: `${duration}s` };
  };

  const renderWord = (word, key) => {
    const hl = highlight.includes(word);
    if (splitBy === "characters") {
      return (
        <span key={key} className={`tr-chunk${hl ? " tr-hl" : ""}`}>
          {word.split("").map((ch, j) => (
            <span key={j} className="tr-word" style={delayFor()}>
              {ch}
            </span>
          ))}
        </span>
      );
    }
    return (
      <span
        key={key}
        className={`tr-word${hl ? " tr-hl" : ""}`}
        style={delayFor()}
      >
        {word}
      </span>
    );
  };

  const lines = String(text).split("\n");

  return (
    <Tag
      ref={ref}
      className={`tr-root ${className}`.trim()}
      aria-label={String(text).replace(/\n/g, " ")}
    >
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {line.split(" ").map((word, wi, arr) => (
              <React.Fragment key={wi}>
                {renderWord(word, wi)}
                {wi < arr.length - 1 ? " " : null}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
};

export default TextReveal;
