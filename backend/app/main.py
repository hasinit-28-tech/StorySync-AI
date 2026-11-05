import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(
    title="StorySync AI API",
    description="API for human-AI collaborative storytelling prototype",
    version="0.1.0",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SuggestionRequest(BaseModel):
    premise: str = Field(min_length=3, max_length=1200)
    character_name: str = Field(default="Alex", min_length=1, max_length=80)
    character_traits: str = Field(default="curious and brave", max_length=300)
    genre: Literal["Fantasy", "Mystery", "Sci-Fi", "Adventure", "Comedy", "Drama"] = "Fantasy"
    tone: str = Field(default="hopeful", max_length=80)


class StorySuggestion(BaseModel):
    id: str
    title: str
    text: str
    rationale: str


class SuggestionResponse(BaseModel):
    suggestions: list[StorySuggestion]
    mode: Literal["openai", "demo"]


def demo_suggestions(req: SuggestionRequest) -> list[StorySuggestion]:
    name = req.character_name.strip() or "Alex"
    premise = req.premise.strip().rstrip(".")
    return [
        StorySuggestion(
            id="suggestion-1",
            title="A surprising discovery",
            text=f"{premise}. {name}, whose {req.character_traits} nature often leads them into trouble, notices a detail everyone else missed. Following it reveals a hidden clue that changes what they thought they knew.",
            rationale="Adds a clear discovery and gives the main character an active choice.",
        ),
        StorySuggestion(
            id="suggestion-2",
            title="A difficult choice",
            text=f"{premise}. A new obstacle forces {name} to choose between the safe option and the one that could help someone else. The decision tests their character and creates a consequence for the next scene.",
            rationale="Introduces conflict and makes the character's values shape the plot.",
        ),
        StorySuggestion(
            id="suggestion-3",
            title="An unexpected ally",
            text=f"{premise}. Just as the situation seems impossible, {name} meets an unlikely ally who knows part of the truth. They agree to work together, but each keeps one important secret.",
            rationale="Creates a relationship, a mystery, and a natural opening for another scene.",
        ),
    ]


@app.get("/")
async def health():
    return {
        "status": "ok",
        "app": "StorySync AI",
        "version": "0.1.0",
        "ai_configured": bool(os.getenv("OPENAI_API_KEY")),
    }


@app.post("/api/story/suggestions", response_model=SuggestionResponse)
async def get_story_suggestions(req: SuggestionRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return SuggestionResponse(suggestions=demo_suggestions(req), mode="demo")

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-5.5")
        prompt = f"""
You are a collaborative story co-writer for a Human-AI Interaction research prototype.
Offer exactly three distinct next-scene suggestions. The human user must remain in control.
Do not write a whole story. Keep each suggestion 2-4 sentences, usable as a draft, and avoid
claiming that one option is objectively best. Return valid JSON with this exact shape:
{{"suggestions":[{{"id":"suggestion-1","title":"short title","text":"2-4 sentences","rationale":"one sentence explaining the narrative effect"}}, ...]}}

Genre: {req.genre}
Tone: {req.tone}
Character: {req.character_name}
Character traits: {req.character_traits}
Current premise / scene:
{req.premise}
"""
        response = client.responses.create(model=model, input=prompt)
        raw = response.output_text.strip()

        import json
        data = json.loads(raw)
        suggestions = [
            StorySuggestion(
                id=str(item.get("id", f"suggestion-{i+1}")),
                title=str(item["title"])[:100],
                text=str(item["text"])[:1600],
                rationale=str(item.get("rationale", "Alternative direction for your story."))[:400],
            )
            for i, item in enumerate(data["suggestions"][:3])
        ]
        if len(suggestions) != 3:
            raise ValueError("The model did not return three suggestions.")
        return SuggestionResponse(suggestions=suggestions, mode="openai")
    except Exception as exc:
        # Do not expose secrets or raw provider errors to the client.
        raise HTTPException(
            status_code=502,
            detail="AI generation failed. Check the backend model setting, API key, and API account access.",
        ) from exc
