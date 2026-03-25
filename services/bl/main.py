import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

import config
from routers import (
    availability,
    bids,
    bookmarks,
    categories,
    invitations,
    portfolio,
    profiles,
    projects,
    reviews,
    skills,
    uploads,
    users,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BL Service",
    description="Core business logic for Freelancer MD.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(skills.router)
app.include_router(portfolio.router)
app.include_router(availability.router)
app.include_router(categories.router)
app.include_router(projects.router)
app.include_router(bids.router)
app.include_router(invitations.router)
app.include_router(reviews.router)
app.include_router(bookmarks.router)
app.include_router(uploads.router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "bl"}
