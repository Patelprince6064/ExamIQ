import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

import AIPractice from "./pages/AIPractice";
import Subjects from "./pages/Subjects";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import PdfUpload from "./pages/PdfUpload";
import PaperAnalyzer from "./pages/PaperAnalyzer";
import Roadmap from "./pages/Roadmap";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function NotFound() {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h1>404 — Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go home</a>
    </div>
  );
}

function App() {
  return (
    <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/practice"   element={<ProtectedRoute><AIPractice /></ProtectedRoute>} />
        <Route path="/subjects"   element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/analytics"  element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/pdf-upload" element={<ProtectedRoute><PdfUpload /></ProtectedRoute>} />
        <Route path="/paper-analyzer" element={<ProtectedRoute><PaperAnalyzer /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;