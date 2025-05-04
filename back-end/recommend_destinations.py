import json

def load_destinations(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def load_user_preferences(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)
def recommend_destinations(user_preferences, destinations, top_n=10):
    scored_destinations = []

    for destination in destinations:
        match_score = sum(1 for category in destination.get("categories", []) if category in user_preferences)
        if match_score > 0:
            scored_destinations.append({
                "name": destination["name"],
                "iata": destination["iata"],
                "categories": [cat for cat in destination["categories"] if cat in user_preferences]
            })

    # Sort by number of matched categories (descending)
    scored_destinations.sort(key=lambda x: len(x["categories"]), reverse=True)
    return scored_destinations[:top_n]

def save_recommendations(recommendations, file_path):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(recommendations, file, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    # Example user preferences (replace with dynamic input later)
    user_preferences = load_user_preferences("user_preferences.json")
    destinations = load_destinations("destinations.json")
    top_recommendations = recommend_destinations(user_preferences, destinations, top_n=10)
    save_recommendations(top_recommendations, "recommended_destinations.json")

    print(f"Top {len(top_recommendations)} recommendations saved to recommended_destinations.json.")
