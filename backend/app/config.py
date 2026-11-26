import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    PRODUCTION = os.getenv("RENDER", "").lower() == "true" or os.getenv("APP_ENV") == "production"
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    SECRET_KEY = os.getenv("SECRET_KEY", "chave-temporaria-de-dev")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)

    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS") == "True"
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER") or MAIL_USERNAME

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    CORS_ORIGINS = [
        origin.strip().rstrip("/")
        for origin in os.getenv("CORS_ORIGINS", FRONTEND_URL).split(",")
        if origin.strip()
    ]
    RESET_SENHA_EXPIRA_MINUTOS = int(os.getenv("RESET_SENHA_EXPIRA_MINUTOS", 30))

    LIBRARY_UPLOAD_DIR = os.getenv("LIBRARY_UPLOAD_DIR", "/app/uploads/library")
    UPLOAD_STORAGE = os.getenv("UPLOAD_STORAGE", "local").strip().lower()
    S3_BUCKET = os.getenv("S3_BUCKET", "").strip()
    AWS_ENDPOINT_URL_S3 = os.getenv("AWS_ENDPOINT_URL_S3", "").strip().rstrip("/")
    AWS_REGION = os.getenv("AWS_REGION", "").strip()
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
    LIBRARY_MAX_FILE_SIZE = int(os.getenv("LIBRARY_MAX_FILE_SIZE", 50 * 1024 * 1024))
    LIBRARY_MAX_VIDEO_SIZE = int(
        os.getenv("LIBRARY_MAX_VIDEO_SIZE", 500 * 1024 * 1024)
    )
