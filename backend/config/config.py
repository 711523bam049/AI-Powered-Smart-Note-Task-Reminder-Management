from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Smart Capture AI"
    API_V1_STR: str = "/api/v1"
    
    # Security Settings
    # In production, this must be set via environment variable
    SECRET_KEY: str = Field(
        default="SUPER_SECRET_DEVELOPMENT_KEY_CHANGE_IN_PRODUCTION_1234567890", 
        validation_alias="SECRET_KEY"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    DATABASE_URL: str = Field(
        default="sqlite:///./smart_capture.db", 
        validation_alias="DATABASE_URL"
    )
    
    # ML/NLP Weights Paths
    MODEL_WEIGHTS_DIR: str = Field(
        default="./ml_weights", 
        validation_alias="MODEL_WEIGHTS_DIR"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
