from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from recommend_destinations import recommend_destinations, load_destinations
import json

app = FastAPI()

# CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load all destinations once
destinations = load_destinations("destinations.json")

@app.post("/recommend")
async def get_recommendations(request: Request):
    data = await request.json()
    preferences = data.get("preferences", [])
    recommendations = recommend_destinations(preferences, destinations, top_n=10)
    # Simplify before returning
    simplified = [
        {
            "name": d["name"],
            "iata": d["iata"],
            "categories": d["categories"]
        } for d in recommendations
    ]
    return simplified
