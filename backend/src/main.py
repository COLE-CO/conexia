from fastapi import FastAPI
from src.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from src.modules.auth.router import router as auth_router
from src.modules.family_office.companies.router import router as companies_router
from src.modules.family_office.balances.router import router as balances_router
from src.modules.family_office.deadlines.router import router as deadlines_router

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
app.include_router(companies_router)
app.include_router(balances_router)
app.include_router(deadlines_router)

@app.get("/")
def root():
    return {"message": "API is running"}