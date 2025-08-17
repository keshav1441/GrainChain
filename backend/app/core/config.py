from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Project Settings
    PROJECT_NAME: str = "GrainChain MVP"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # MongoDB Settings
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE")
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload Settings
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # External API Keys
    WEATHER_API_KEY: Optional[str] = None
    MARKET_DATA_API_KEY: Optional[str] = None
    SMS_API_KEY: Optional[str] = None
    PAYMENT_GATEWAY_KEY: Optional[str] = None
    
    # AI/ML Configuration
    GEMINI_API_KEY: str = Field(..., env="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-1.5-flash", env="GEMINI_MODEL")
    
    # Groq Configuration for Chatbot
    GROQ_API_KEY: str = Field(..., env="GROQ_API_KEY")
    GROQ_MODEL: str = Field(default="llama3-8b-8192", env="GROQ_MODEL")
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Security Settings
    BCRYPT_ROUNDS: int = 12
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
