import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./LaptopPage.css";
import { useNavigate } from "react-router-dom";

const LaptopPage = () => {
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    brand: "",
    gpu: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
  });

  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";

  const fetchLaptops = async () => {
    try {
      setLoading(true);

      const res = await API.get("/laptops", { params: filters });

      let data = res.data;

      // 🔥 ADVANCED SEARCH (IMPORTANT FIX)
      if (search.trim() !== "") {
        const term = search.toLowerCase();

        data = data.filter((lap) => {
          return (
            lap.brand?.toLowerCase().includes(term) ||
            lap.model?.toLowerCase().includes(term) ||
            lap.specs?.processor?.toLowerCase().includes(term) ||
            lap.specs?.gpu?.toLowerCase().includes(term) ||
            lap.pricing?.perDay?.toString().includes(term)
          );
        });
      }

      setLaptops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaptops();
  }, [filters, search]); // 🔥 also trigger on search

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="laptops-page">
      <h1>All Laptops</h1>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search "
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 🎯 FILTERS */}
      <div className="filters">
        <input name="brand" placeholder="Brand" onChange={handleChange} />
        <input name="gpu" placeholder="GPU" onChange={handleChange} />

        <select name="condition" onChange={handleChange}>
          <option value="">Condition</option>
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="used">Used</option>
        </select>

        <input
          name="minPrice"
          type="number"
          placeholder="Min Price"
          onChange={handleChange}
        />

        <input
          name="maxPrice"
          type="number"
          placeholder="Max Price"
          onChange={handleChange}
        />
      </div>

      {/* 📦 GRID */}
      <div className="laptop-grid">
        {loading ? (
          <p className="status-text">Loading...</p>
        ) : laptops.length > 0 ? (
          laptops.map((lap) => (
            <div
              key={lap._id}
              className="laptop-card"
              onClick={() => navigate(`/laptops/details/${lap._id}`)}
            >
              <img src={`${baseURL}${lap.images?.[0]}`} alt={lap.model} />

              <div className="card-body">
                <h3>{lap.brand} {lap.model}</h3>
                <p className="cpu">{lap.specs?.processor}</p>

                <div className="bottom">
                  <span className="price">
                    ₹{lap.pricing?.perDay} /day
                  </span>

                 
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="status-text">No laptops found</p>
        )}
      </div>
    </div>
  );
};

export default LaptopPage;
