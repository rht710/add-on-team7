# 🎓 AI Campus & Career Assistant

A unified AI-powered workspace to manage college guidelines, track campus events, analyze job profiles, and prepare for technical interviews.

## 🚀 Architecture Overview
- **Frontend**: React + Vite (Vanilla CSS for styling, responsive dashboard)
- **Backend**: FastAPI + Uvicorn + FAISS Vector Store for RAG
- **AI Integrations**: Groq (Llama-3.3-70b) and OpenAI (GPT-4o-mini) for synthesis, Tavily for real-time web scraping & search

---

## 🛠️ Setup & Running Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### 2. Environment Configuration
Create a `.env` file inside the `backend` directory:
```bash
# backend/.env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
OPENAI_API_KEY=your_optional_openai_key_here
```
> **Note**: If `OPENAI_API_KEY` is omitted or invalid, the backend automatically falls back to Groq for all operations.

---

### 3. Backend Setup
1. Open a terminal and navigate to the project root.
2. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the backend server:
   ```bash
   cd backend
   python -m uvicorn main:app --port 8000 --reload
   ```
The backend API will run at **http://127.0.0.1:8000**.

---

### 4. Frontend Setup
1. Open a new terminal in the project root.
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The frontend application will run at **http://localhost:5173**.

---

## 📂 Key Features
1. **Target College Scraper (Dashboard)**: Enter your college website (e.g. `https://mgmits.ac.in/`) to scrape live placements and events directly.
2. **College Assistant (RAG Chat)**: Upload college PDFs, text documents, or schedules and chat with the AI helper to get verified answers with source links.
3. **Job Assistant (ATS & Job Match)**: Upload a resume, analyze your ATS score, get improvement feedback, search matching job postings, and auto-generate tailored cover letters.
4. **Interview Prep**: Generate target-role technical interview questions instantly.
