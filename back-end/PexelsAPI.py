import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment
PEXELS_API_KEY = os.getenv('PEXELS_API_KEY')

# Categories for which we'll query images
categories = {
    "vibes": ["beach", "mountain", "party", "cultural", "museums", "city life", "adventure", "relaxing/spa",
              "remote/nature"],
    "climate": ["tropical", "dry", "temperate", "continental", "polar", "rainy", "snowy", "sunny", "humid", "cool"],
    "ecology": ["low carbon footprint", "access to nature reserves", "public transport friendly", "eco-lodges",
                "green hotels", "vegetarian", "zero-waste cities", "clean air", "renewable energy", "minimal tourism"],
    "food": ["japanese", "italian", "mexican", "indian", "middle eastern", "vegan", "seafood", "street food", "local",
             "wine & cheese", "halal", "kosher"]
}


# Function to fetch images from Pexels API for each category
def fetch_image(query):
    url = f"https://api.pexels.com/v1/search?query={query}&per_page=1"

    headers = {
        'Authorization': PEXELS_API_KEY
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data.get("photos"):
            photo = data["photos"][0]
            return {
                "image_url": photo["back-end"]["original"],
                "description": photo["alt"],
                "photographer": photo["photographer"],
                "photographer_url": photo["photographer_url"]
            }
        else:
            return None
    else:
        print(f"Failed to fetch image for query '{query}': {response.status_code}")
        return None


# Function to get images for all categories
def get_category_images():
    category_images = {}

    for category, queries in categories.items():
        category_images[category] = []
        for query in queries:
            print(f"Fetching image for '{query}'...")
            image_data = fetch_image(query)
            if image_data:
                category_images[category].append({
                    "query": query,
                    "image_url": image_data["image_url"],
                    "description": image_data["description"],
                    "photographer": image_data["photographer"],
                    "photographer_url": image_data["photographer_url"]
                })

    return category_images


# Save images to a JSON file
def save_images_to_file(filename="category_images.json"):
    category_images = get_category_images()

    # Save to a JSON file
    with open(filename, 'w') as f:
        json.dump(category_images, f, indent=4)
    print(f"Images saved to {filename}")


# if __name__ == "__main__":
#     save_images_to_file()
