import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckOut.css";
import API from "../../api/axios.js";
import KYCModal from "../../components/kyc/KYCModal";

const Checkout = () => {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";
  const location = useLocation();
  const navigate = useNavigate();
  const { laptop } = location.state || {};

  const [rentedFrom, setRentedFrom] = useState("");
  const [rentedTo, setRentedTo] = useState("");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);

  if (!laptop) {
    return <div>No laptop selected.</div>;
  }

  const days =
    rentedFrom && rentedTo
      ? Math.max(
          Math.ceil(
            (new Date(rentedTo) - new Date(rentedFrom)) / (1000 * 60 * 60 * 24),
          ),
          0,
        )
      : 0;

  const baseAmount = days * laptop.pricing?.perDay;
  const totalAmount = baseAmount + laptop.securityDeposit;

  const createRental = async () => {
    const res = await API.post("/rentals", {
      laptopId: laptop._id,
      rentedFrom,
      rentedTo,
      deliveryType,
      deliveryAddress: address,
    });
    return res.data._id;
  };

  const createOrder = async (rentalId) => {
    const res = await API.post("/payments/create-order", {
      rentalId,
    });
    return res.data;
  };

  const verifyPayment = async (paymentData, rentalId) => {
    await API.post("/payments/verify", {
      ...paymentData,
      rentalId,
    });
    navigate(`/rental-success/${rentalId}`);
  };

  const handleKYCSuccess = () => {
    setError("KYC submitted! Wait for admin verification.");
    setTimeout(() => setError(null), 3000);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const rentalId = await createRental();
      const order = await createOrder(rentalId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Laptop Rental",
        description: laptop.model,
        handler: async function (response) {
          await verifyPayment(response, rentalId);
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setShowKYCModal(true);
        setError("KYC verification required.");
      } else {
        setError("Payment failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkoutPageWrapper">
      <h1 className="checkoutPageTitle">Checkout</h1>

      {/* ERROR */}
      {error && <div className="checkoutErrorBox">❌ {error}</div>}

      <div className="checkoutPageLayout">
        {/* ================= LEFT ================= */}
        <div className="checkoutLeftSection">
          {/* PRODUCT CARD */}
          <div className="checkoutCard checkoutProductCard">
            <img
              src={`${baseURL}${laptop.images?.[0]}`}
              alt={laptop.model}
              className="checkoutProductImg"
            />

            <div className="checkoutProductInfo">
              <h3>{laptop.model}</h3>
              <p>₹{laptop.pricing?.perDay} / day</p>
              <p>Deposit: ₹{laptop.securityDeposit}</p>
              <p>{laptop.availableUnits} units available</p>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="checkoutCard checkoutFormCard">
            <h3>Rental Details</h3>

            <div className="checkoutFormGroup">
              <label>Start Date</label>
              <input
                type="date"
                className="checkoutInput"
                value={rentedFrom}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRentedFrom(e.target.value)}
              />
            </div>

            <div className="checkoutFormGroup">
              <label>End Date</label>
              <input
                type="date"
                className="checkoutInput"
                value={rentedTo}
                min={rentedFrom}
                onChange={(e) => setRentedTo(e.target.value)}
              />
            </div>

            <div className="checkoutFormGroup">
              <label>Delivery Type</label>
              <input
                type="text"
                className="checkoutSelect"
                value="Pickup"
                disabled
              />
            </div>

            {deliveryType === "delivery" && (
              <textarea
                className="checkoutTextarea"
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="checkoutRightSection">
          <div className="checkoutCard checkoutPriceCard">
            <h3>Price Details</h3>

            <div className="checkoutPriceRow">
              <span>Days</span>
              <span>{days}</span>
            </div>

            <div className="checkoutPriceRow">
              <span>Base Price</span>
              <span>₹{baseAmount}</span>
            </div>

            <div className="checkoutPriceRow">
              <span>Security Deposit</span>
              <span>₹{laptop.securityDeposit}</span>
            </div>

            <div className="checkoutTotal">Total: ₹{totalAmount}</div>

            <button
              className="checkoutPayBtn"
              onClick={handlePayment}
              disabled={!rentedFrom || !rentedTo || days <= 0 || loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>

      {/* KYC MODAL */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={handleKYCSuccess}
      />
    </div>
  );
};

export default Checkout;
