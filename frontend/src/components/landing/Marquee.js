import React from "react";
import "./Marquee.css";

/* Dependency-free testimonial marquee: two rows, opposite directions,
   seamless -50% loop, pause on hover. */
const TESTIMONIALS = [
  {
    name: "Priya S.",
    meta: "CSE · Semester 5",
    body: "Turning my OS notes into quizzes saved me hours. I finally knew exactly what to revise.",
    initials: "PS",
  },
  {
    name: "Rahul V.",
    meta: "CSE · Semester 4",
    body: "The weak-topic insights pointed straight at Normalization — my accuracy jumped in two weeks.",
    initials: "RV",
  },
  {
    name: "Sneha K.",
    meta: "IT · Semester 6",
    body: "The study planner kept me consistent even during internals. Short sessions, real progress.",
    initials: "SK",
  },
  {
    name: "Amit P.",
    meta: "CSE · Semester 3",
    body: "Practice questions felt like actual university papers. I walked into exams calmer.",
    initials: "AP",
  },
  {
    name: "Divya M.",
    meta: "CSE · Semester 5",
    body: "Watching my accuracy trend climb each week kept me motivated to keep the streak alive.",
    initials: "DM",
  },
  {
    name: "Karan J.",
    meta: "IT · Semester 4",
    body: "Uploading slides and getting instant practice sets is now the core of my routine.",
    initials: "KJ",
  },
];

const firstRow = TESTIMONIALS.slice(0, 3);
const secondRow = TESTIMONIALS.slice(3);

const Stars = () => (
  <div className="mq-stars" aria-label="5 out of 5 stars">
    {["★", "★", "★", "★", "★"].map((s, i) => (
      <span key={i} aria-hidden="true">
        {s}
      </span>
    ))}
  </div>
);

const ReviewCard = ({ name, meta, body, initials }) => (
  <figure className="mq-card">
    <Stars />
    <blockquote>{body}</blockquote>
    <figcaption>
      <span className="mq-avatar" aria-hidden="true">
        {initials}
      </span>
      <span>
        <strong>{name}</strong>
        <small>{meta}</small>
      </span>
    </figcaption>
  </figure>
);

const Row = ({ items, reverse = false, label }) => {
  const doubled = [...items, ...items];
  return (
    <div className="mq-viewport">
      <div className={`mq-track${reverse ? " is-reverse" : ""}`}>
        {doubled.map((t, i) => (
          <span
            key={i}
            className="mq-item"
            aria-hidden={i >= items.length ? "true" : undefined}
          >
            <ReviewCard {...t} />
          </span>
        ))}
      </div>
      <span className="mq-fade mq-fade-left" aria-hidden="true" />
      <span className="mq-fade mq-fade-right" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

const Marquee = () => (
  <div className="mq">
    <Row items={firstRow} label="Sample student stories, first row" />
    <Row items={secondRow} reverse label="Sample student stories, second row" />
  </div>
);

export default Marquee;
