import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/images")
      .then(res => {
        setImages(res.data.images);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <h1>🍽️ Food Gallery</h1>
      <div className="gallery">
        {images.map((src, i) => (
          <img key={i} src={src} alt={`food-${i}`} />
        ))}
      </div>
    </div>
  );
}

export default App;
