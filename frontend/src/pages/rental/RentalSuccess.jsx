import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import "./RentalSuccess.css";

const RentalSuccess = () => {
  const { id } = useParams();
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await API.get(`/rentals/${id}`);
        setRental(res.data);
      } catch (err) {
        console.error("Error fetching rental:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [id]);

  if (loading) return <div className="success-loading">Loading...</div>;
  if (!rental) return <div className="success-loading">Rental not found</div>;

  const laptop = rental.laptopId;

  return (
    <div className="success-container">
      {/* HEADER */}
      <div className="success-header">
        <h1> Payment Successful</h1>
        <p>Your rental has been confirmed</p>
      </div>

      {/* LAPTOP CARD */}
      <div className="success-card">
        <img
          src={`${baseURL}${laptop?.images?.[0]}`}
          alt="laptop"
          className="success-img"
        />

        <div className="success-info">
          <h2>
            {laptop?.brand} {laptop?.model}
          </h2>

          <p>{laptop?.specs?.processor}</p>
          <p>
            {laptop?.specs?.ram} • {laptop?.specs?.storage}
          </p>
          <p>{laptop?.specs?.gpu}</p>
          <p>{laptop?.specs?.display}</p>
        </div>
      </div>

      {/* RENTAL DETAILS */}
      <div className="success-section">
        <h3>Rental Details</h3>
        <p><span>Rental ID:</span> {rental._id}</p>
        <p><span>Status:</span> {rental.status}</p>
        <p><span>From:</span> {new Date(rental.rentedFrom).toDateString()}</p>
        <p><span>To:</span> {new Date(rental.rentedTo).toDateString()}</p>
        <p><span>Total Days:</span> {rental.totalDays}</p>
      </div>

      {/* PAYMENT */}
      <div className="success-section">
        <h3>Payment Details</h3>
        <p><span>Base Amount:</span> ₹{rental.pricing.baseAmount}</p>
        <p><span>Deposit:</span> ₹{rental.securityDeposit}</p>
        <h2 className="total">Total Paid: ₹{rental.pricing.totalAmount}</h2>
      </div>

      {/* USER */}
      <div className="success-section">
        <h3>User</h3>
        <p><span>Name:</span> {rental.userId?.name}</p>
        <p><span>Email:</span> {rental.userId?.email}</p>
      </div>

      <div className="success-footer">
        ✔ Thank you for your booking!
      </div>
    </div>
  );
};

export default RentalSuccess;
