import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.ml.model_loader import get_model_manager

# API routers
from app.api.routes import health, users, recognition, dashboard, settings as settings_api

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('FaceVision')

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('Initializing SQLite database...')
    init_db()
    logger.info('Pre-loading ML models into memory...')
    get_model_manager()
    logger.info('FaceVision AI Backend startup complete.')
    yield
    logger.info('FaceVision AI Backend shutting down.')

app = FastAPI(
    title='FaceVision AI API',
    description='Intelligent Face Recognition and Biometric Management REST API',
    version='1.0.0',
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', '*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Register routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(recognition.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)

@app.get('/')
def root():
    return {
        'app': 'FaceVision AI Backend',
        'status': 'online',
        'documentation': '/docs',
        'version': '1.0.0'
    }
