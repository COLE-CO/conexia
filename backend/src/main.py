from fastapi import FastAPI
from src.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from src.modules.auth.router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Conexia API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "API is running"}