"""Nutro AI — FastAPI backend entry point."""

from __future__ import annotations

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models import ChatRequest, FitnessProfile
from orchestrator import get_fitness_profile, run_agent


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield


app = FastAPI(
    title="Nutro AI",
    description="Agentic health-and-fitness copilot for Swiggy Builders Club",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="nutro-ai", version="1.0.0")


@app.get("/api/profile", response_model=FitnessProfile)
async def get_profile() -> FitnessProfile:
    """Return mock wearable-synced fitness profile."""
    return get_fitness_profile()


@app.post("/api/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    """Stream agent orchestration events as NDJSON."""

    async def event_stream():
        async for event in run_agent(request.message):
            yield json.dumps(event) + "\n"

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
