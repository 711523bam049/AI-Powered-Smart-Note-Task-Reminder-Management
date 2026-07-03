# Smart Capture AI

### AI-Powered Intelligent Notes, Tasks & Reminder Management System

Smart Capture AI is a modern, production-grade productivity platform that converts natural language text and voice commands into structured notes, tasks, and reminders. Instead of filling out lengthy forms, users can capture anything instantly—the system automatically classifies intent, extracts parameters (like due dates, priorities, people, locations), generates semantic tags, and provides summaries.

---

## 🚀 Key Features

*   **🎙️ Multi-modal Capture**: Supports both direct manual form entry and natural language captures via text or voice recording (browser Web Speech API).
*   **🧠 Cognitive AI Pipeline**:
    *   **Intent Classifier**: Hybrid system using rules and a machine learning model (TF-IDF + Logistic Regression) to route captures to Notes, Tasks, or Reminders.
    *   **Entity Extractor**: spaCy NER pipeline coupled with relative time parsing (via `dateparser`) to extract names, locations, and due dates (e.g. "tomorrow at 5 PM").
    *   **Semantic Tagger**: Zero-shot multi-label tagging using Sentence Transformers (`all-MiniLM-L6-v2`) to compare text semantic similarity against workspace tags (Work, Study, Finance, etc.).
    *   **Extractive Summarizer**: Paragraph sentence rank summarization for long notes (> 100 words).
*   **🔍 Advanced Search**: Supports standard SQL keyword filter matching alongside zero-shot semantic search using vector cosine similarity.
*   **📊 Workspace Analytics**: Notion/Linear style dashboard displaying real-time metrics, tag segment distributions, and weekly capture frequencies using Recharts.
*   **🔒 JWT Auth Session**: Complete signup, signin, secure route guards, and silent token rotation on 401s.

---

## 🛠️ Tech Stack

*   **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, Scikit-Learn, spaCy (`en_core_web_sm`), Sentence Transformers (`all-MiniLM-L6-v2`), dateparser, bcrypt.
*   **Frontend**: React (Vite), Tailwind CSS v4, Axios, React Router, Lucide Icons, Recharts.

---

## 📂 Project Structure

```
├── backend/
│   ├── api/             # Routers (auth, user, captures, search)
│   ├── auth/            # Security, JWT, route dependencies
│   ├── classifier/      # ML Intent Classifier (trained weights)
│   ├── config/          # Pydantic Settings env variables
│   ├── database/        # Session setups & table compilation
│   ├── entity_extraction/ # spaCy NER & Date Normalization
│   ├── models/          # Declarative SQLAlchemy models
│   ├── repository/      # Clean CRUD queries
│   ├── schemas/         # Pydantic validation schemas
│   ├── services/        # Orchestrator & Business layers
│   ├── summarization/   # Sentence-scoring summarizer
│   ├── tagging/         # Cosine tag similarity matching
│   └── tests/           # Pytest suites
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, StatCard, Chart, CaptureInput, Modal
│   │   ├── context/     # Global AuthContext provider
│   │   ├── layouts/     # Dashboard workspace wrapper layout
│   │   ├── pages/       # Login, Signup, Dashboard, Notes, Tasks, Reminders, Search
│   │   └── services/    # Axios instance with refresh interceptor
│   └── vercel.json      # Frontend rewrite configurations
└── render.yaml          # Backend blueprint deployment profile
```

---

## ⚙️ Getting Started

### Prerequisites
*   Python 3.12+
*   Node.js 18+

### 1. Backend Setup & Run
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create virtual environment and activate:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install required libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Download spaCy English model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Initialize the database schema:
   ```bash
   python database/init_db.py
   ```
6. Launch development server:
   ```bash
   uvicorn main:app --reload
   ```
   *The Swagger UI API docs will be active at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup & Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development site:
   ```bash
   npm run dev
   ```
   *Open browser to `http://localhost:5173/`.*

---

## 🧪 Running Unit Tests

We have modular test coverage for both backend auth endpoints and NLP services:
1. Navigate to the backend directory and ensure virtual env is active.
2. Run pytest suite:
   ```bash
   PYTHONPATH=. .venv/bin/pytest
   ```
   This executes and asserts tests for:
   *   Intent classification, spacy entities, relative dates normalization.
   *   Cosine tagging, text summarization.
   *   User auth flows, JWT rotation, protected profiles.
   *   Capture CRUD operations, semantic search, and dashboard activity queries.
