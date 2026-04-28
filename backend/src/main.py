from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.modules.auth.router import router as auth_router
from src.modules.cole_co.cash_flow.router import router as cash_flow_router
from src.modules.cole_co.payments.router import router as payments_router
from src.modules.family_office.balances.router import router as balances_router
from src.modules.family_office.companies.router import router as companies_router
from src.modules.family_office.deadlines.router import router as deadlines_router
from src.modules.family_office.reports.router import router as reports_router
from src.scheduler import start_scheduler, stop_scheduler

app = FastAPI(title="Conexia API")

origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cash_flow_router)
app.include_router(payments_router)
app.include_router(companies_router)
app.include_router(balances_router)
app.include_router(deadlines_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {"message": "API is running"}


@app.on_event("startup")
def startup_event():
    start_scheduler()


@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()
