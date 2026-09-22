import { useEffect, useState } from "react";
import HeroBanner from "../components/home/HeroBanner";
import LaptopCard from "../components/home/LaptopCard";
import API from "../api/axios";
import "./Home.css";
import Footer from "../components/home/Footer";
//home
const Home = () => {
  const [laptops, setLaptops] = useState([]);

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        const res = await API.get("/laptops");
        setLaptops(res.data);
      } catch (error) {
        console.error("Error fetching laptops:", error);
      }
    };

    fetchLaptops();
  }, []);

  // 🔥 Category Filters
  const officeLaptops = laptops.filter((lap) => lap.category === "Office");

  const gamingLaptops = laptops.filter((lap) => lap.category === "Gaming");

  return (
    <div className="home-container">
      {/* HERO */}
      <HeroBanner />

      {/* OFFICE */}
      <div className="category-section">
        <h2>Office Laptops</h2>
        <LaptopCard laptops={officeLaptops} />
      </div>

      {/* GAMING */}
      <div className="category-section">
        <h2>Gaming Laptops</h2>
        <LaptopCard laptops={gamingLaptops} />
      </div>

      {/* MORE CATEGORIES? */}
      <Footer />
    </div>
  );
};

export default Home;
