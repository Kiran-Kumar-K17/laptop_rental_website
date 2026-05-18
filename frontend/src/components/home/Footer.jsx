import React from "react";
import { FaGithub, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ===== BRAND ===== */}
        <div className="footer-section">
          <h2>LaptopRent</h2>
          <p>
            Rent high-performance laptops at affordable prices. Built for
            students, developers, and professionals.
          </p>
        </div>

        {/* ===== CONTACT ===== */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>
            <FaEnvelope /> rent.byte.0@gmail.com
          </p>
          <p>
            <FaMapMarkerAlt /> India
          </p>
        </div>

        {/* ===== SOCIAL ===== */}
        <div className="footer-section">
          <h4>Connect</h4>
          <a
            href="https://github.com/Kiran-Kumar-K17/laptop_rental_website/tree/dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub /> GitHub
          </a>
        </div>
      </div>

      {/* ===== BOTTOM ===== */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LaptopRent. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
