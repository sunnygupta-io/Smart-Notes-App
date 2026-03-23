from fastapi import FastAPI
import logging 
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import test_connection
from contextlib import asynccontextmanager
from app.routes import users, notes, tags, share, notifications, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting the smart note server")
    test_connection()
    logger.info("Smart notes server is ready")
    
    yield
    
    logger.info("Shutting down smart notes server")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

app  = FastAPI(title = "Smart Notes App", version="1.0.0",lifespan= lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])
app.include_router(share.router, prefix="/api/share", tags=["Share"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"] )


@app.get("/")
def home():
    logger.info("Home API is called")
    return {"message": "Server is running"}

