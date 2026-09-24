"""
Main FastAPI Application Entrypoint.
NER Smart Logistics & Road Accessibility Intelligence Platform (INNOVEXA - SIH26002).
Ministry of Development of North Eastern Region (MDoNER).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered logistics and road-accessibility intelligence platform designed for the North Eastern Region of India.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for all frontend origins in local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", summary="Root Health Check & System Info")
def root_info():
    return {
        "platform": settings.PROJECT_NAME,
        "team": settings.TEAM_NAME,
        "problem_statement_id": settings.PROJECT_ID,
        "organization": settings.ORGANIZATION,
        "version": settings.VERSION,
        "status": "OPERATIONAL_ONLINE",
        "api_docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
