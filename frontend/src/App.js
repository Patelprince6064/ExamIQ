import React from "react";
import { Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/practice"   element={<AIPractice />} />
        <Route path="/subjects"   element={<Subjects />} />
        <Route path="/analytics"  element={<Analytics />} />
        <Route path="/settings"   element={<Settings />} />
        <Route path="/pdf-upload" element={<PdfUpload />} />
        <Route path="/paper-analyzer" element={<PaperAnalyzer />} />
        <Route path="/roadmap" element={<Roadmap />} />

        <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;