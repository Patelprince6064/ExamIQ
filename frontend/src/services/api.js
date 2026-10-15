// src/api.js
// Central API helper — all backend calls go through here

const rawBaseUrl = process.env.REACT_APP_API_URL || "";
const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

// Get the JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Build headers with optional auth
const headers = (auth = true) => ({
  "Content-Type": "application/json",
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// Safely parse JSON responses — never throw on HTML error pages / empty bodies.
// On 401, drop the stale token so ProtectedRoute redirects to /login.
const parseJson = async (res) => {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: `Request failed (HTTP ${res.status})` };
  }
  if (res.status === 401) {
    localStorage.removeItem("token");
    // Keep user object removal best-effort; pages re-check token.
    if (!data.message) data.message = "Session expired. Please log in again.";
  }
  return data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const apiRegister = (name, email, password) =>
  fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: headers(false),
    body: JSON.stringify({ name, email, password }),
  }).then(parseJson);

export const apiLogin = (email, password) =>
  fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: headers(false),
    body: JSON.stringify({ email, password }),
  }).then(parseJson);

export const apiGetMe = () =>
  fetch(`${BASE_URL}/api/auth/me`, { headers: headers() }).then(parseJson);

// ─── Chat / AI ───────────────────────────────────────────────────────────────
export const apiChat = (message) =>
  fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message }),
  }).then(parseJson);

export const apiExplain = (topic, subject) =>
  fetch(`${BASE_URL}/chat/explain`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ topic, subject }),
  }).then(parseJson);

export const apiStudyPlan = (startDate, examDate, weakTopics) =>
  fetch(`${BASE_URL}/chat/study-plan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ startDate, examDate, weakTopics }),
  }).then(parseJson);

export const apiGenerateRoadmap = (skill) =>
  fetch(`${BASE_URL}/chat/roadmap`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ skill }),
  }).then(parseJson);

// ─── Quiz ────────────────────────────────────────────────────────────────────
export const apiGenerateQuiz = (subject, topic, count = 5, difficulty = "medium") =>
  fetch(`${BASE_URL}/api/quiz/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ subject, topic, count, difficulty }),
  }).then(parseJson);

export const apiGenerateDescriptive = (subject, topic, count = 5) =>
  fetch(`${BASE_URL}/api/quiz/descriptive`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ subject, topic, count }),
  }).then(parseJson);

export const apiGetTopicNotes = (subjectCode, topic, subjectName = "") =>
  fetch(`${BASE_URL}/api/subjects/${subjectCode}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ topic, subjectName }),
  }).then(parseJson);

export const apiSubmitQuiz = (payload) =>
  fetch(`${BASE_URL}/api/quiz/submit`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  }).then(parseJson);

export const apiQuizHistory = (limit = 20, subject = "") =>
  fetch(`${BASE_URL}/api/quiz/history?limit=${limit}&subject=${subject}`, {
    headers: headers(),
  }).then(parseJson);

export const apiWeakTopics = () =>
  fetch(`${BASE_URL}/api/quiz/weak-topics`, { headers: headers() }).then(parseJson);

// ─── Progress ────────────────────────────────────────────────────────────────
export const apiDashboard = () =>
  fetch(`${BASE_URL}/api/progress/dashboard`, { headers: headers() }).then(parseJson);

export const apiLogStudyHours = (hours) =>
  fetch(`${BASE_URL}/api/progress/study-hours`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ hours }),
  }).then(parseJson);

// ─── Subjects ────────────────────────────────────────────────────────────────
export const apiGetSubjects = () =>
  fetch(`${BASE_URL}/api/subjects`, { headers: headers() }).then(parseJson);

export const apiEnrollSubjects = (subjects) =>
  fetch(`${BASE_URL}/api/subjects/enroll`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ subjects }),
  }).then(parseJson);

// ─── Analytics ───────────────────────────────────────────────────────────────
export const apiAnalytics = () =>
  fetch(`${BASE_URL}/api/analytics/overview`, { headers: headers() }).then(parseJson);

export const apiLeaderboard = () =>
  fetch(`${BASE_URL}/api/analytics/leaderboard`, { headers: headers() }).then(parseJson);

// ─── User / Settings ─────────────────────────────────────────────────────────
export const apiGetProfile = () =>
  fetch(`${BASE_URL}/api/user/profile`, { headers: headers() }).then(parseJson);

export const apiUpdateProfile = (data) =>
  fetch(`${BASE_URL}/api/user/profile`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  }).then(parseJson);

export const apiChangePassword = (currentPassword, newPassword) =>
  fetch(`${BASE_URL}/api/user/change-password`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(parseJson);

export const apiGetNotes = () =>
  fetch(`${BASE_URL}/api/user/notes`, { headers: headers() }).then(parseJson);

export const apiUploadNote = (formData) =>
  fetch(`${BASE_URL}/api/user/upload-note`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type for multipart
    body: formData,
  }).then(parseJson);

export const apiDeleteNote = (id) =>
  fetch(`${BASE_URL}/api/user/notes/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then(parseJson);

export const apiGenerateQuizFromNote = (noteId, count = 5) =>
  fetch(`${BASE_URL}/api/user/notes/${noteId}/generate-quiz`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ count }),
  }).then(parseJson);

export const apiAnalyzePaper = (formData) =>
  fetch(`${BASE_URL}/api/paper/analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type for multipart
    body: formData,
  }).then(parseJson);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getToken();
