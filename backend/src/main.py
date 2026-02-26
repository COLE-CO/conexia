from fastapi import FastAPI
from src.core.database import Base, engine
from src.modules.auth.router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Conexia API")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "API is running"}