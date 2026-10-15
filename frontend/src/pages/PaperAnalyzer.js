import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiAnalyzePaper } from "../services/api";
import { SharedSidebar } from "../components/layout/SharedLayout";
import "./PdfUpload.css";
import "./PaperAnalyzer.css";

function PaperAnalyzer() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("General");
  const [mode, setMode] = useState("topics");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); }
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.type.startsWith("image/"))) {
      setFile(dropped);
    } else {
      showToast("Please upload a PDF or Image file", "error");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleAnalyze = async () => {
    if (!file) {
      showToast("Please select a PDF file", "error");
      return;
    }
    setAnalyzing(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subject", subject);
      fd.append("mode", mode);
      
      const data = await apiAnalyzePaper(fd);
      if (data.result) {
        setResult(data.result);
        showToast("Paper analyzed successfully! 🎉");
      } else {
        showToast(data.message || "Failed to analyze paper", "error");
      }
    } catch (e) {
      showToast("Error connecting to analyzer", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

return (
    <div className="pdf-page">
      {/* SIDEBAR */}
      <SharedSidebar />

      {/* MAIN CONTENT */}
      <div className="pdf-main">
        {toast && <div className={`pdf-toast ${toast.type}`}>{toast.msg}</div>}

        <div className="pdf-bg" aria-hidden="true">
          <span className="pdf-orb pdf-orb-1" />
          <span className="pdf-orb pdf-orb-3" />
          <span className="pdf-float pf1" /><span className="pdf-float pf3" /><span className="pdf-float pf5" />
        </div>
        <div className="pdf-header pdf-rise">
          <span className="pdf-hero-icon scan">🔍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="pdf-eyebrow"><span className="pdf-eyebrow-dot" /> PAPER X-RAY · PYQ INTELLIGENCE</p>
            <h1>Decode papers into <span className="pdf-grad">most-asked topics</span></h1>
            <p>Upload a past University or Mid Sem paper. AI instantly extracts repeat topics — or solves the whole paper.</p>
          </div>
          <div className="pdf-hero-stat">
            <strong>{mode === "solve" ? "Q&A" : "TOP"}</strong>
            <span>{mode === "solve" ? "solve mode" : "topics mode"}</span>
          </div>
        </div>

        <div className="pa-modes pdf-rise" style={{ animationDelay: "60ms" }} role="group" aria-label="Analysis mode">
          {[
            { id: "topics", icon: "🎯", title: "Extract Topics", desc: "Rank most-asked topics & sub-topics" },
            { id: "solve", icon: "💡", title: "Solve Paper", desc: "Full question-by-question answers" },
          ].map((m) => (
            <button key={m.id} className={`pa-mode${mode === m.id ? " active" : ""}`} onClick={() => setMode(m.id)}>
              <span className="pa-mode-icon">{m.icon}</span>
              <span><strong>{m.title}</strong><span className="pa-mode-desc">{m.desc}</span></span>
              {mode === m.id && <span className="pa-mode-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="upload-card pdf-rise" style={{ animationDelay: "100ms" }}>
          <div className="upload-card-header">
            <div className="upload-card-icon"><span className="pdf-icon-pulse" />PDF</div>
            <div>
              <h2>Upload Exam Paper</h2>
              <p>PDF or Image files · Max 50 MB · AI X-ray inside</p>
            </div>
          </div>

          <div
            className={`drop-zone ${dragOver ? "active" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <span className="drop-ants" aria-hidden="true" />
            <span className="pa-scanline" aria-hidden="true" />
            {file ? (
              <>
                <div className="drop-file-icon pdf-bounce">📄</div>
                <div className="drop-file-name">{file.name}</div>
                <div className="drop-file-size"><span className="pdf-ready-dot" />{formatSize(file.size)} · Ready to analyze</div>
                <button className="drop-change" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Change File ×
                </button>
              </>
            ) : (
              <>
                <div className="drop-icon pdf-float-icon">📄</div>
                <div className="drop-text">{dragOver ? "Drop it — X-ray starting! ✨" : "Drag & drop your exam paper here"}</div>
                <div className="drop-sub">or <span className="drop-browse">click to browse</span> · PDF or photo of the paper</div>
              </>
            )}
          </div>

          <div className="upload-form-row">
            <div className="upload-field" style={{ flex: 1 }}>
              <label>SUBJECT CONTEXT (OPTIONAL BUT HELPFUL FOR AI)</label>
              <input
                type="text"
                placeholder="e.g. Database Management Systems"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="upload-field" style={{ flex: 1, marginLeft: "16px" }}>
              <label>ANALYSIS MODE</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="topics">Extract Most Asked Topics</option>
                <option value="solve">Solve Entire Paper (Q&A)</option>
              </select>
            </div>
          </div>

          <button
            className={`upload-btn ${file && !analyzing ? "ready" : ""}`}
            style={{ marginTop: "16px" }}
            onClick={handleAnalyze}
            disabled={analyzing || !file}
          >
            {analyzing ? (
              <><span className="btn-spinner"></span> X-raying paper… ranking topics…</>
            ) : (
              mode === "solve" ? "💡 Solve Entire Paper →" : "🔍 Extract Most Asked Topics →"
            )}
          </button>
          {analyzing && <div className="pdf-upload-bar"><span /></div>}
        </div>

        {/* RESULTS SECTION */}
        {result && result.topics && (
          <div className="analyzer-result-card pdf-rise">
            <div className="result-header">
              <div>
                <p className="pdf-eyebrow" style={{ marginBottom: 4 }}><span className="pdf-eyebrow-dot" /> X-RAY COMPLETE</p>
                <h2>Most Asked Topics</h2>
              </div>
              <span className="result-subject-badge">{result.subject}</span>
            </div>

            <div className="topics-list">
              {result.topics && result.topics.length > 0 ? (
                result.topics.sort((a, b) => b.count - a.count).map((topic, i) => {
                  const max = Math.max(...result.topics.map((t) => t.count), 1);
                  const w = Math.max(8, Math.round((topic.count / max) * 100));
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                  return (
                    <div key={i} className="topic-item pdf-rise" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
                      <div className="topic-item-header">
                        <h3><span className="pa-rank">{medal}</span> {topic.name}</h3>
                        <span className="topic-count pulse">{topic.count} {topic.count === 1 ? 'time' : 'times'}</span>
                      </div>
                      <div className="pa-bar"><span style={{ width: `${w}%` }} /></div>
                      {topic.subTopics && topic.subTopics.length > 0 && (
                        <ul className="subtopics-list">
                          {topic.subTopics.map((sub, j) => (
                            <li key={j}>{sub}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No major topics found. Ensure the PDF contains recognizable text.</p>
              )}
            </div>
          </div>
        )}

        {result && result.qaList && (
          <div className="analyzer-result-card pdf-rise">
            <div className="result-header">
              <div>
                <p className="pdf-eyebrow" style={{ marginBottom: 4 }}><span className="pdf-eyebrow-dot" /> FULL SOLUTION</p>
                <h2>Paper Solution</h2>
              </div>
              <span className="result-subject-badge">{result.subject}</span>
            </div>

            <div className="topics-list">
              {result.qaList && result.qaList.length > 0 ? (
                result.qaList.map((qa, i) => (
                  <div key={i} className="topic-item pa-qa pdf-rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                    <div className="topic-item-header">
                      <h3><span className="pa-qbadge">Q{i + 1}</span> {qa.question}</h3>
                    </div>
                    <div className="pa-answer">
                      <span className="pa-ans-label">✓ Model answer</span>
                      <p>{qa.answer}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No questions found. Ensure the PDF contains recognizable text.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaperAnalyzer;
