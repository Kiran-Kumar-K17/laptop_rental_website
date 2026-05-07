import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./Laptops.css";
import LaptopForm from "../../components/forms/LaptopForm";

const Laptops = () => {
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const fetchLaptops = async () => {
    try {
      const res = await API.get("/laptops");
      setLaptops(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptops();
  }, []);

  const deleteLaptop = async (id) => {
    try {
      await API.delete(`/laptops/${id}`);
      setLaptops((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-laptops-page">

      {/* HEADER */}
      <div className="laptops-header">
        <div>
          <h2>Laptops</h2>
          
        </div>

        <button
          className="add-laptop-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Laptop
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="laptops-loading">Loading laptops...</div>
      ) : (
        <div className="laptops-container">
          {laptops.map((lap) => (
            <div className="laptop-card" key={lap._id}>
              
              <div className="laptop-image">
                <img
                  src={
                    lap.images?.[0]
                      ? `${BASE_URL}/${lap.images[0]}`
                      : "/no-image.png"
                  }
                  alt={lap.model}
                />
              </div>

              <div className="laptop-content">

                <div className="laptop-header-card">
                  <h3>{lap.model}</h3>
                  <span className="brand">{lap.brand}</span>
                </div>

                <div className="laptop-specs">
                  <span>{lap.specs?.processor}</span>
                  <span>{lap.specs?.ram}</span>
                  <span>{lap.specs?.storage}</span>
                </div>

                <div className="laptop-footer">
                  <div className="admin-price">₹{lap.pricing?.perDay}/day</div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteLaptop(lap._id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="laptop-meta">
                  <span>Status: {lap.status}</span>
                  <span>Available: {lap.availableUnits}</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <LaptopForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchLaptops}
        />
      )}
    </div>
  );
};

export default Laptops;
