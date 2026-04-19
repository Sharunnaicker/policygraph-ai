from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.ingest import router as ingest_router
from .api.decisions import router as decisions_router
from .api.beliefs import router as beliefs_router

app = FastAPI(title="PolicyGraph AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router, prefix="/api")
app.include_router(decisions_router, prefix="/api")
app.include_router(beliefs_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
