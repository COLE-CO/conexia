from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Conexia"
    
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    SECRET_KEY: str = "9dae5c48441468dd716672358411ef2ba77c602c35ee9a4eb9338777128cd75b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()