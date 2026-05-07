import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LaptopCard.css";

const LaptopCard = ({ laptops = [] }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const goToCheckout = (laptop, e) => {
    e.stopPropagation(); // ✅ prevent card click
    navigate("/checkout", { state: { laptop } });
  };

  const handleDetails = (laptop) => {
    navigate(`/laptops/details/${laptop._id}`);
  };

  return (
    <div className="row-container">
      {/* LEFT */}
      <button className="nav-btn left" onClick={() => scroll("left")}>
        ‹
      </button>

      {/* ROW */}
      <div className="row" ref={scrollRef}>
        {laptops.map((lap) => (
          <div
            className="card clickable"
            key={lap._id}
            onClick={() => handleDetails(lap)} // ✅ FULL CARD CLICK
          >
            <img
              src={`${baseURL}${lap.images?.[0]}`}
              alt={lap.model}
              className="card-img"
            />

            <div className="card-body">
              <h3>{lap.model}</h3>
              <p className="muted">{lap.brand}</p>

              <div className="tags">
                <span>{lap.specs?.processor}</span>
                <span>{lap.specs?.ram}</span>
                <span>{lap.specs?.storage}</span>
              </div>

              <div className="card-bottom">
                <span className="price">₹{lap.pricing?.perDay}</span>

                <button className ="butt" onClick={(e) => goToCheckout(lap, e)}>Rent</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <button className="nav-btn right" onClick={() => scroll("right")}>
        ›
      </button>
    </div>
  );
};

export default LaptopCard;
