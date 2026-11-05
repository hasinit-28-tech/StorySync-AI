# StorySync AI

**Human-AI Collaborative Story and Comic Creator**  
A Human-AI Interaction project prototype for collaboratively writing stories, revising AI suggestions, and studying creative control.

## Current starter features
- React + Vite interface
- FastAPI backend
- Character and story premise inputs
- AI story suggestion endpoint
- Accept/reject/edit interaction logging in the browser
- Collaboration metrics panel
- Works in demo mode without an API key
- Optional OpenAI API integration through a backend environment variable

## Stack
- Frontend: React, Vite
- Backend: Python, FastAPI, Pydantic
- Optional text generation: OpenAI Python SDK / Responses API
- Next phases: image generation, persistence, user study, statistical analysis

## Requirements
- Node.js 20.19+ or 22.12+
- Python 3.10+
- Git

## Run locally (Windows PowerShell)

### 1. Backend
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

The backend API is available at:
- `http://127.0.0.1:8000/`
- Interactive API docs: `http://127.0.0.1:8000/docs`

To enable OpenAI-powered suggestions, add your API key to `backend/.env`:
```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.5
```
Never commit `.env` or share your API key. If the key is missing, the API uses deterministic demo suggestions.

### 2. Frontend (open a second terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## GitHub setup
Create an empty GitHub repository named `storysync-ai`, then from this folder:
```powershell
git init
git add .
git commit -m "Initial StorySync AI prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/storysync-ai.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username.

## Project structure
```text
storysync-ai/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── USER_STUDY_PLAN.md
├── .gitignore
└── README.md
```

## API endpoints
- `GET /` — health/status
- `POST /api/story/suggestions` — generate three alternative story continuations

## HAI design principles
1. Users retain final control over creative content.
2. AI suggestions are presented as alternatives, not commands.
3. Accept/reject/edit actions are logged for research.
4. Feedback should explain actionable improvements without making unsupported claims about a person's creativity or emotions.

## Current limitations
- Story data and interaction logs are currently stored in browser memory only.
- Comic image generation and persistent database storage are not implemented yet.
- Demo mode is not a trained AI model; it is a safe fallback for testing the UI.
- User study results must be collected with informed consent and professor approval.
