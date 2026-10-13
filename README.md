# 🎓 ExamIQ — AI-Powered Exam Preparation & Learning Platform

<p align="center">
  <img src="frontend/src/assets/logo.png" alt="ExamIQ Logo" width="120" />
</p>

<p align="center">
  <b>Transform your study materials into interactive quizzes, deep concept breakdowns, and targeted exam intelligence.</b>
</p>

<p align="center">
  <a href="https://github.com/Patelprince6064/ExamIQ/stargazers"><img src="https://img.shields.io/github/stars/Patelprince6064/ExamIQ?style=for-the-badge&color=blue" alt="Stars"></a>
  <a href="https://github.com/Patelprince6064/ExamIQ/network/members"><img src="https://img.shields.io/github/forks/Patelprince6064/ExamIQ?style=for-the-badge&color=green" alt="Forks"></a>
  <a href="https://github.com/Patelprince6064/ExamIQ/issues"><img src="https://img.shields.io/github/issues/Patelprince6064/ExamIQ?style=for-the-badge&color=red" alt="Issues"></a>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Author & Acknowledgements](#-author--acknowledgements)
- [License](#-license)

---

## 📖 Overview

**ExamIQ** is an end-to-end intelligent study companion engineered to help students study smarter, identify weak concepts rapidly, and maximize exam scores. 

Instead of passively reading static PDFs or textbook notes, ExamIQ allows students to:
1. **Upload study notes and past exam papers (up to 50 MB)**.
2. **Automatically generate structured quizzes and descriptive questions**.
3. **Analyze past year question papers** to highlight high-frequency questions and optimal model solutions.
4. **Interact with a domain-specialized AI Tutor** for deep, step-by-step conceptual explanations without confusing formatting artifacts.
5. **Receive Weak Topic Diagnostics** after quizzes to target gaps before real exams.

---

## ✨ Key Features

### 🤖 1. AI Exam Tutor & Conceptual Assistant
- **Context-Aware Responses**: Specialized in Computer Science (DSA, Operating Systems, DBMS, Computer Networks, Software Engineering).
- **Clean Academic Formatting**: Structured paragraphs, bulleted breakdowns, and real-world exam examples.
- **Zero Raw Markdown Hash Clutter**: Pre-cleaned and styled for readable studying.

### 📄 2. Smart PDF Note Processor & Quiz Generator
- **Large Document Support**: Supports lecture notes, slides, and textbooks up to **50 MB** (`.pdf`, `.png`, `.jpg`, `.webp`).
- **Automated Text Extraction**: Integrated with `pdf-parse` and OCR pipelines for document comprehension.
- **Instant Quiz Creation**: Generates topic-specific multiple-choice assessments with answer explanations and difficulty tiers.

### 📑 3. Past Exam Paper Analyzer
- **Topic Frequency Extractor**: Analyzes semester and university papers to compute recurring question weights and trends.
- **Full Exam Paper Solver**: Synthesizes model answers, edge-case analysis, and key scoring points for university-level questions.

### 🧠 4. Weak Topic Intelligence & Diagnostics
- **Targeted Feedback Engine**: Replaces generic score percentages with diagnostic feedback on specific weak areas (e.g., *Round Robin Scheduling*, *Deadlock Prevention*, *B+ Trees*, *SQL Normalization*).
- **Curated Action Steps**: Suggests specific practice exercises and conceptual reviews based on missed questions.

### ⏱️ 5. Integrated Focus Study Timer
- **Pomodoro & Custom Timer**: Persistent floating widget allowing timed study sprints across all pages without losing state.

### 📊 6. Analytics & Goal Tracking
- **Interactive Dashboards**: Visualizes quiz accuracy, topic mastery, and completion rates.
- **Revision Roadmaps**: Generates structured timelines leading up to exam dates.

### 🛡️ 7. Offline Intelligence Fallback Engine
- Zero downtime guarantee: Built-in local academic intelligence generators ensure the application remains fully functional even without external AI API credits.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client[React.js Frontend UI] <-->|REST API / JWT| Server[Node.js + Express Backend]
    Server <-->|Mongoose ODM| DB[(MongoDB Database)]
    Server <-->|OCR & Parsing| PDFEngine[pdf-parse / Multer (50MB)]
    Server <-->|AI Prompts & Fallback| AI[Groq Llama 3 / Offline Academic Engine]
```

### **Frontend**
- **Framework**: React 18 (SPA)
- **Styling**: Modern Vanilla CSS, responsive layouts, glassmorphic UI, custom icons
- **State & Routing**: React Router v6, Context API (Timer, Authentication)
- **Visuals**: Chart.js / Recharts for student performance visualization

### **Backend**
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **File Ingestion**: Multer (50 MB cap), `pdf-parse`
- **Security**: CORS, Helmet headers, express-rate-limit

---

## 📂 Project Directory Structure

```plaintext
ExamIQ/
├── backend/
│   ├── config/
│   │   ├── aiFallback.js      # Offline high-yield academic knowledge generator
│   │   └── db.js              # MongoDB connection configuration
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & route protection
│   │   └── upload.js          # Multer 50MB file upload & MIME filter
│   ├── models/
│   │   ├── Note.js            # Uploaded PDF metadata & extracted text schema
│   │   ├── QuizResult.js      # Student quiz scores, weak topics & answers
│   │   └── User.js            # User profile, goals & authentication schema
│   ├── routes/
│   │   ├── analytics.js       # Student performance metrics & streaks
│   │   ├── auth.js            # User register, login & profile endpoints
│   │   ├── chat.js            # AI Tutor conversation & doubt clearance
│   │   ├── paper.js           # Past exam paper analyzer & solver
│   │   ├── progress.js        # Study roadmap & progress tracking
│   │   ├── quiz.js            # Dynamic quiz generation & weak topic diagnostics
│   │   └── user.js            # Note upload & PDF-to-quiz generation
│   ├── .env.example           # Backend environment variable template
│   ├── server.js              # Main Express application entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML shell & web assets
│   ├── src/
│   │   ├── assets/            # Project graphics & branding
│   │   ├── home/              # Landing page component & styles
│   │   ├── AIPractice.js      # Quiz practice & assessment interface
│   │   ├── Analytics.js       # Charts & study insights dashboard
│   │   ├── App.js             # Client routing & protected routes
│   │   ├── Dashboard.js       # Main student dashboard
│   │   ├── PaperAnalyzer.js   # Exam paper upload & topic extraction
│   │   ├── PdfUpload.js       # Note management & question generator
│   │   ├── Roadmap.js         # Study planner & roadmap timeline
│   │   ├── TimerWidget.js     # Floating focus study timer
│   │   └── api.js             # Centralized Axios / Fetch API client
│   └── package.json
│
├── .gitignore
├── README.md
├── SETUP.md
└── start-all.bat              # One-click Windows runner script
```

---

## 🚀 Getting Started

### Prerequisites
Make sure the following are installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017` (or MongoDB Atlas connection string)
- [Git](https://git-scm.com/)

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Patelprince6064/ExamIQ.git
cd ExamIQ
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-exam-prep
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GROQ_API_KEY=your_optional_groq_api_key
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

### Running Locally

You can launch both services using your terminal:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm start
# Application opens at http://localhost:3000
```

*On Windows, you can also double-click `start-all.bat` to launch both servers simultaneously.*

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new student account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ No |
| `GET` | `/api/auth/me` | Fetch active user profile | ✅ Yes |

### 🤖 AI Tutor & Chat (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/chat` | Ask academic questions & receive structured explanations | ✅ Yes |

### 📝 Notes & PDF Quiz Generator (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/user/upload-note` | Upload notes / textbooks (up to 50MB) | ✅ Yes |
| `GET` | `/api/user/notes` | List all user notes | ✅ Yes |
| `POST` | `/api/user/notes/:id/generate-quiz` | Generate exam quiz directly from uploaded note | ✅ Yes |
| `DELETE`| `/api/user/notes/:id` | Delete an uploaded note | ✅ Yes |

### 📑 Exam Paper Analyzer (`/api/paper`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/paper/analyze` | Extract top exam topics or generate full solutions | ✅ Yes |

### 🧠 Practice & Quiz Engine (`/api/quiz`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/quiz/generate` | Generate MCQ questions by subject & difficulty | ✅ Yes |
| `POST` | `/api/quiz/descriptive` | Generate university-style descriptive questions | ✅ Yes |
| `POST` | `/api/quiz/submit` | Submit answers & receive Weak Topic Intelligence | ✅ Yes |
| `GET` | `/api/quiz/history` | Retrieve user quiz attempts & scores | ✅ Yes |

---

## 📸 Screenshots

| Feature | Interface Preview |
|---|---|
| **PDF Note Generator** | Up to 50MB file upload with instant question generation |
| **Past Paper Analyzer** | High-yield topic frequency extractor & paper solver |
| **Interactive AI Tutor** | Clean long-form explanations with key exam takeaways |
| **Diagnostics & Timer** | Weak topic intelligence & floating Pomodoro widget |

---

## 👨‍💻 Author & Acknowledgements

**Prince Patel**  
- **GitHub**: [@Patelprince6064](https://github.com/Patelprince6064)  
- **Repository**: [https://github.com/Patelprince6064/ExamIQ](https://github.com/Patelprince6064/ExamIQ)  
- **Email**: pp50646464@gmail.com  

Developed with passion for Educational Technology, AI Engineering, and Full-Stack Web Development.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
Feel free to star ⭐ the repository if you found this project helpful!
