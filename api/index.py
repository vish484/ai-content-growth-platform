"""
ClipSync — Vercel Serverless API
Phase 1: YouTube URL Validator

This file lives at /api/index.py in the project root.
Vercel's Python runtime passes the full request path to the ASGI app,
so all routes are registered under the /api prefix via APIRouter.
"""

import os
import re
import logging
from typing import Optional

# ── SSL certificates ───────────────────────────────────────────
try:
    import certifi
    os.environ.setdefault('SSL_CERT_FILE', certifi.where())
    os.environ.setdefault('REQUESTS_CA_BUNDLE', certifi.where())
except ImportError:
    pass
# ───────────────────────────────────────────────────────────────

import yt_dlp
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mangum import Mangum

# ─────────────────────────────────────────────
#  Logging
# ─────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clipsync")

# ─────────────────────────────────────────────
#  App
# ─────────────────────────────────────────────
app = FastAPI(
    title="ClipSync API",
    description="AI Content Growth Platform — YouTube processing pipeline",
    version="0.1.0",
)

# CORS — allow any origin in production (Vercel frontend + custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Router — ALL routes carry the /api prefix
# ─────────────────────────────────────────────
# Vercel passes the full URL path (e.g. /api/validate-url) directly to the
# ASGI app without stripping any prefix. Using prefix="/api" on the router
# ensures every route matches exactly what Vercel sends.
router = APIRouter(prefix="/api")

# ─────────────────────────────────────────────
#  Mangum adapter
# ─────────────────────────────────────────────
# Kept for compatibility in case Vercel invokes the function as a Lambda-style
# handler. Do NOT use api_gateway_base_path here — routes already include /api.
handler = Mangum(app, lifespan="off")

# ─────────────────────────────────────────────
#  Schemas
# ─────────────────────────────────────────────
class ValidateUrlRequest(BaseModel):
    url: str


class VideoMetadata(BaseModel):
    valid: bool
    video_id: Optional[str] = None
    title: Optional[str] = None
    channel: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    upload_date: Optional[str] = None
    description_snippet: Optional[str] = None
    error: Optional[str] = None


# ─────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────
YOUTUBE_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?(?:.*&)?v=([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([\w-]{11})",
    r"(?:https?://)?youtu\.be/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/embed/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/v/([\w-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/live/([\w-]{11})",
]


def extract_video_id(url: str) -> Optional[str]:
    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


# ─────────────────────────────────────────────
#  Routes  (all under the /api router)
# ─────────────────────────────────────────────
@router.get("/")
def root():
    return {"service": "ClipSync API", "version": "0.1.0", "status": "healthy"}


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/validate-url", response_model=VideoMetadata)
def validate_url(payload: ValidateUrlRequest):
    """
    Validate a YouTube URL and return rich video metadata.
    """
    url = payload.url.strip()

    if not url:
        return VideoMetadata(valid=False, error="Please enter a URL.")

    video_id = extract_video_id(url)
    if not video_id:
        return VideoMetadata(
            valid=False,
            error="This doesn't look like a YouTube URL. Try pasting a link like https://youtu.be/dQw4w9WgXcQ",
        )

    logger.info(f"Fetching metadata for video ID: {video_id}")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "extract_flat": False,
        "noplaylist": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}",
                download=False,
            )
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        logger.warning(f"yt-dlp error for {video_id}: {error_msg}")

        if "Private video" in error_msg or "private" in error_msg.lower():
            return VideoMetadata(valid=False, error="This video is private and cannot be accessed.")
        if "removed" in error_msg.lower() or "deleted" in error_msg.lower():
            return VideoMetadata(valid=False, error="This video has been removed or deleted.")
        if "unavailable" in error_msg.lower() or "not available" in error_msg.lower():
            return VideoMetadata(valid=False, error="This video is not available in this region or has been taken down.")
        if "age" in error_msg.lower():
            return VideoMetadata(valid=False, error="This video is age-restricted and requires sign-in to access.")

        return VideoMetadata(valid=False, error=f"Could not access this video: {error_msg[:200]}")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching video info.")

    title = info.get("title", "Unknown Title")
    channel = info.get("uploader") or info.get("channel", "Unknown Channel")
    duration = info.get("duration")
    view_count = info.get("view_count")
    like_count = info.get("like_count")
    upload_date = info.get("upload_date")
    description = info.get("description", "")
    description_snippet = (description[:200] + "…") if description and len(description) > 200 else description

    thumbnails = info.get("thumbnails") or []
    thumbnail = None
    for t in reversed(thumbnails):
        if t.get("url"):
            thumbnail = t["url"]
            break
    if not thumbnail:
        thumbnail = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

    logger.info(f"Successfully validated: {title} by {channel}")

    return VideoMetadata(
        valid=True,
        video_id=video_id,
        title=title,
        channel=channel,
        duration=duration,
        thumbnail=thumbnail,
        view_count=view_count,
        like_count=like_count,
        upload_date=upload_date,
        description_snippet=description_snippet,
    )


# Register the router with the main app AFTER all route definitions
app.include_router(router)
