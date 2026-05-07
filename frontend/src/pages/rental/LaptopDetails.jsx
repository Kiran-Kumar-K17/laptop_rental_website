import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import {
  Cpu,
  HardDrive,
  Monitor,
  MemoryStick,
  Laptop,
  BadgeCheck,
  Gpu,
  MonitorCog,
} from "lucide-react";
import "./LaptopDetails.css";

const LaptopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [laptop, setLaptop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const laptopRes = await API.get(`/laptops/${id}`);
        setLaptop(laptopRes.data);
      } catch (err) {
        setError("Failed to load laptop");
      }

      try {
        const reviewRes = await API.get(`/reviews/laptop/${id}`);
        setReviews(reviewRes.data);
      } catch (err) {
        setReviews([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleRentNow = () => {
    navigate("/checkout", { state: { laptop } });
  };

  /* ===== STATES ===== */
  if (loading) return <div className="laptopLoading">Loading...</div>;
  if (error) return <div className="laptopLoading">Error: {error}</div>;
  if (!laptop) return <div className="laptopLoading">No laptop found</div>;

  return (
    <div className="laptopDetailsWrapper">
      <div className="laptopDetailsLayout">
        {/* ===== IMAGE ===== */}
        <div>
          <div className="laptopImageSection laptopDetailsCard">
            <img
             src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/${laptop.images?.[0] || ""}`}
              alt={laptop.model}
            />
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div className="laptopInfoSection laptopDetailsCard">
          {/* TITLE */}
          <div>
            <h1 className="laptopTitle">
              {laptop.brand} {laptop.model}
            </h1>
            <p className="laptopCategory">{laptop.category}</p>
          </div>

          {/* AVAILABILITY */}
          <div className="laptopAvailability">
            <BadgeCheck size={14} />
            {laptop.availableUnits > 0
              ? `${laptop.availableUnits} units available`
              : "Out of stock"}
          </div>

          {/* SPECS */}
          <div className="laptopSpecsGrid">
            <div className="laptopSpecItem">
              <MemoryStick size={14} /> {laptop.specs?.ram || "N/A"}
            </div>
            <div className="laptopSpecItem">
              <Cpu size={14} /> {laptop.specs?.processor || "N/A"}
            </div>
            <div className="laptopSpecItem">
              <HardDrive size={14} /> {laptop.specs?.storage || "N/A"}
            </div>
            <div className="laptopSpecItem">
              <Monitor size={14} /> {laptop.specs?.display || "N/A"}
            </div>
            <div className="laptopSpecItem">
              <Gpu size={14} /> {laptop.specs?.gpu || "N/A"}
            </div>
            <div className="laptopSpecItem">
              <MonitorCog size={14} /> {laptop.specs?.os || "N/A"}
            </div>
          </div>

          {/* PRICING */}
          <div className="laptopPricingBox">
            <h3>Pricing</h3>
            <p className="laptopPriceMain">
              ₹{laptop.pricing?.perDay || "0"} <span>/ day</span>
            </p>

            <div className="laptopPriceSub">
              <p>₹{laptop.pricing?.perWeek || "0"} / week</p>
              <p>₹{laptop.pricing?.perMonth || "0"} / month</p>
            </div>
          </div>

          {/* EXTRA */}
          <div className="laptopExtraInfo">
            <p>
              Condition: <span>{laptop.condition || "N/A"}</span>
            </p>
            <p>
              Deposit: <span>₹{laptop.securityDeposit || "0"}</span>
            </p>
          </div>

          {/* BUTTON */}
          <button className="laptopRentBtn" onClick={handleRentNow}>
            Rent Now
          </button>
        </div>
      </div>

      {/* ===== REVIEWS ===== */}
      <div className="laptopReviewsSection">
        <h3>Customer Reviews</h3>

        {reviews.length === 0 ? (
          <p className="laptopNoReviews">No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="laptopReviewCard">
              <div className="laptopReviewHeader">
                <span className="laptopReviewUser">
                  {r.userId?.name || "Anonymous"}
                </span>
                <span className="laptopReviewRating">
                  {"⭐".repeat(r.rating)}
                </span>
              </div>

              <p className="laptopReviewComment">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LaptopDetails;
