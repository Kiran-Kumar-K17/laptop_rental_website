import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./HeroBanner.css";

const quotes = [
  "Power your ideas with the right machine.",
  "Performance meets affordability.",
  "Upgrade your workflow instantly.",
  "Build faster. Rent smarter.",
];

const HeroBanner = () => {
  const navigate = useNavigate();
  const [laptop, setLaptop] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";

  // 🔥 Fetch featured laptop
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/laptops");
        const randomLaptop =
          res.data[Math.floor(Math.random() * res.data.length)];
        setLaptop(randomLaptop);
      } catch (error) {
        console.error("Error fetching featured laptop:", error);
      }
    };
    fetchFeatured();
  }, []);

  // 🔥 Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!laptop)
    return <div className="hero-loading">Loading Featured Deal...</div>;

  const handleRentNow = () => {
    navigate("/checkout", { state: { laptop } });
  };
  const handleDetails = () => {
    navigate(`/laptops/details/${laptop._id}`);
  };
  return (
    <div className="hero-container">
      <div className="hero-overlay" />

      <div className="hero-content">
        {/* LEFT SIDE */}
        <div className="hero-text">
          <h1>
            Rent Premium Laptops <br />
            <span>Smarter & Faster</span>
          </h1>

          <p className="hero-quote">"{quotes[quoteIndex]}"</p>

          <div className="hero-details">
            <h3>{laptop.model}</h3>
            <p>{laptop.brand}</p>
            <p>
              {laptop.specs?.processor} | {laptop.specs?.ram}
            </p>
            <h2>₹{laptop.pricing?.perDay}/day</h2>
          </div>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleRentNow}>
              Rent Now
            </button>
            <button className="btn-secondary" onClick={handleDetails}>
              View Details
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-image">
          <img src={`${baseURL}${laptop.images?.[0]}`} alt={laptop.model} />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
