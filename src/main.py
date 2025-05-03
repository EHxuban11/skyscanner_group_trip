from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PEXELS_BASE_URL = "https://api.pexels.com/v1/search"

food_keywords = ["burger", "biryani", "sushi", "pizza", "pasta", "steak", "salad", "ramen", "tacos", "dumplings"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/images")
async def get_food_images():
    headers = {
        "Authorization": PEXELS_API_KEY
    }
    images = []
    async with httpx.AsyncClient() as client:
        for keyword in food_keywords:
            response = await client.get(PEXELS_BASE_URL, params={"query": keyword, "per_page": 5}, headers=headers)
            data = response.json()
            for photo in data.get("photos", []):
                images.append(photo["src"]["medium"])  # or 'large' or 'original'
    return {"images": images}
