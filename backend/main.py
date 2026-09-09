from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import auth, dashboard, emissions, products, suppliers, reduction, regulatory, analytics

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexgile-DecarbX Environmental Intelligence API",
    description="REST API backend for Nexgile-DecarbX Environmental Intelligence Platform",
    version="1.0.0"
)

# Configure CORS for React frontend (Vite defaults to 5173, 3000, or any local origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(emissions.router)
app.include_router(products.router)
app.include_router(suppliers.router)
app.include_router(reduction.router)
app.include_router(regulatory.router)

@app.get("/")
def root():
    return {
        "platform": "Nexgile-DecarbX Environmental Intelligence Platform",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "sqlite", "auth": "jwt"}
