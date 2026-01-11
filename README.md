# Wikipedia Quiz Generator

A full-stack application that generates interactive quizzes from Wikipedia articles using Google Gemini LLM.

## Project Overview

This tool allows users to input any Wikipedia URL and instantly generate a 5-10 question multiple-choice quiz. It extracts content using BeautifulSoup, uses Gemini Pro (flash-lite) to generate questions and identifying key entities, and stores everything in a PostgreSQL database for history retrieval.

**Tech Stack:**
- **Backend:** Python (FastAPI)
- **Frontend:** React (Vite + TailwindCSS)
- **Database:** PostgreSQL (SQLAlchemy)
- **AI/LLM:** Google Gemini (`gemini-2.5-flash-lite`, via LangChain)
- **Scraping:** BeautifulSoup4

---

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL installed and running
- Google AI Studio API Key

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create Virtual Environment (Optional but recommended):**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your `GOOGLE_API_KEY`.
   - Update `DATABASE_URL` if your Postgres credentials differ.

5. **Run Server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will start at `http://localhost:8000`.

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

---

## API Documentation

### 1. Generate Quiz
- **Method:** `POST`
- **Route:** `/api/generate-quiz`
- **Body:**
  ```json
  { "url": "https://en.wikipedia.org/wiki/Article_Name" }
  ```
- **Response:** JSON object containing quiz, entities, and summary.

### 2. Get Quiz History
- **Method:** `GET`
- **Route:** `/api/quizzes`
- **Response:** List of previously generated quizzes.

### 3. Get Quiz Details
- **Method:** `GET`
- **Route:** `/api/quizzes/{id}`
- **Response:** Full details of a specific quiz.

---

## Database Schema

**Table: `quizzes`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary Key |
| `url` | Text | Wikipedia URL (Unique) |
| `title` | Text | Article Title |
| `summary` | Text | Short summary |
| `key_entities` | JSON | {people: [], organizations: [], locations: []} |
| `sections` | JSON | List of section headers |
| `quiz` | JSON | List of question objects |
| `related_topics` | JSON | List of related topic strings |
| `created_at` | DateTime | Timestamp |
| `raw_html` | Text | Backup of scraped HTML |

---

## LLM Prompts

We use LangChain to structure prompts.

**Quiz Generation Prompt:**
> "Analyze the provided text... Identify key entities... Generate 5 to 10 multiple-choice questions... Output JSON ONLY."

**Related Topics Prompt:**
> "Suggest 3 to 7 related Wikipedia topics... Return ONLY a JSON array of strings."

Design Choice: We separate or use strict JSON formatting instructions to ensure the extracted data is machine-readable for the frontend.

---

## Testing

1. **Verify Backend:**
   - Use Postman or curl to hit `http://localhost:8000/api/generate-quiz` with sample URLs from `sample_data/test_urls.txt`.
2. **Verify Frontend:**
   - Open the web app.
   - Paste a URL and click Generate.
   - Check the History tab to see if it persisted.

---

## Features Checklist

- [x] Backend API (FastAPI)
- [x] Frontend UI (React + Two Tabs)
- [x] Database Integration (PostgreSQL)
- [x] Scraping Logic (BeautifulSoup)
- [x] LLM Integration (Gemini)
- [x] History View
- [x] Entity Extraction
- [x] Responsive Design

**Bonus Features Implemented:**
- Caching (checks DB for existing URL)
- Simple "Show Answer" toggle in UI
