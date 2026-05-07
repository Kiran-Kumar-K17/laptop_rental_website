import { useEffect, useState } from "react";
import API from "../../api/axios";
import "./MyBooking.css";
import ReviewModal from "./ReviewModal";

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/payments/my-history");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDays = (from, to) => {
    if (!from || !to) return 0;
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
  };

  const handleOpen = async (booking) => {
    setSelectedBooking(booking);

    try {
      const rentalId = booking.rentalId?._id || booking.rentalId;
      const res = await API.get(`/reviews/rental/${rentalId}`);

      if (res.data) {
        setExistingReview(res.data);
        setRating(res.data.rating);
        setComment(res.data.comment);
      } else {
        setExistingReview(null);
        setRating(0);
        setComment("");
      }
    } catch {
      setExistingReview(null);
      setRating(0);
      setComment("");
    }
  };

  const handleSubmit = async () => {
    try {
      const rental = selectedBooking.rentalId;
      const rentalId = rental?._id || rental;
      const laptopId =
        rental?.laptopId?._id || rental?.laptopId || selectedBooking?.laptopId;

      if (existingReview) {
        await API.put(`/reviews/${existingReview._id}`, {
          rating,
          comment,
        });
      } else {
        await API.post("/reviews", {
          laptopId,
          rentalId,
          rating,
          comment,
        });
      }

      alert("Review saved!");
      setSelectedBooking(null);
    } catch (err) {
      alert("Please return the laptop to write a review");
    }
  };

  return (
    <div className="bookingPageWrapper">
      {/* HEADER */}
      <div className="bookingHeader">
        <h2>My Bookings</h2>
        <p>Track all your rented laptops and history</p>
      </div>

      {/* EMPTY STATE */}
      {bookings.length === 0 ? (
        <div className="bookingEmpty">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookingGrid">
          {bookings.map((booking) => {
            const laptop = booking.rentalId?.laptopId;
            const from = booking.rentalId?.rentedFrom;
            const to = booking.rentalId?.rentedTo;
            const days = getDays(from, to);

            return (
              <div
                key={booking._id}
                className="bookingCard"
                onClick={() => handleOpen(booking)}
              >
                {/* IMAGE */}
                <div className="bookingCardImage">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/${laptop.images?.[0] || ""}`}
                    alt="laptop"
                  />
                </div>

                {/* CONTENT */}
                <div className="bookingCardContent">
                  <h3>
                    {laptop ? `${laptop.brand} ${laptop.model}` : "Laptop"}
                  </h3>

                  <p className="bookingSpecs">
                    {laptop?.specs?.processor} • {laptop?.specs?.ram} •{" "}
                    {laptop?.specs?.storage}
                  </p>

                  {/* DATE */}
                  <div className="bookingDateSection">
                    <div>
                      <span>Start</span>
                      <p>{formatDate(from)}</p>
                    </div>
                    <div>
                      <span>End</span>
                      <p>{formatDate(to)}</p>
                    </div>
                    <div>
                      <span>Days</span>
                      <p>{days}</p>
                    </div>
                  </div>

                  {/* PRICE + STATUS */}
                  <div className="bookingPriceStatus">
                    <div className="bookingPriceBox">
                      <h4>₹{booking.amount?.toLocaleString()}</h4>
                    </div>

                    <span
                      className={`bookingStatus ${
                        booking.status === "success" ? "paid" : "pending"
                      }`}
                    >
                      {booking.status === "success" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEW MODAL */}
      <ReviewModal
        selectedBooking={selectedBooking}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        existingReview={existingReview}
        onClose={() => setSelectedBooking(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default MyBooking;
