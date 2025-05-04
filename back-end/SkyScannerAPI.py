import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment
API_KEY = os.getenv('API_KEY')
URL = 'https://partners.api.skyscanner.net/apiservices/v3/geo/hierarchy/flights/en-GB'

# Headers for authorization
headers = {
    'x-api-key': API_KEY
}


def fetch_and_save_destinations():
    response = requests.get(URL, headers=headers)

    if response.status_code == 200:
        data = response.json()

        # Extract "places" dictionary
        places_dict = data.get("places", {})

        # Convert to list and take the first 100
        destinations_list = list(places_dict.values())[:100]

        # Save to JSON file
        with open("destinations.json", "w", encoding="utf-8") as f:
            json.dump(destinations_list, f, indent=4, ensure_ascii=False)

        print(f"Saved {len(destinations_list)} destinations to 'destinations.json'")
    else:
        print(f"Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    fetch_and_save_destinations()
