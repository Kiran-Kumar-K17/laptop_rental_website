import { useState } from "react";
import API from "../../api/axios";
import "../../pages/admin/KYC.css";
const UserCard = ({ user }) => {
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/";

  const docUrl = user.kycDocument
    ? `${BASE_URL}${user.kycDocument.replace(/\\/g, "/")}`
    : null;

  const handleApprove = async () => {
    await API.put(`/users/kyc/${user._id}`, { status: "approved" });
    window.location.reload();
  };

  const handleReject = async () => {
    await API.put(`/users/kyc/${user._id}`, { status: "rejected" });
    window.location.reload();
  };

  return (
    <div className="kyc-card">
      <div className="kyc-info">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`badge ${user.kycStatus}`}>{user.kycStatus}</span>
        </p>
      </div>

      <div className="kyc-actions">
        {/* ✅ View Button */}
        {docUrl && (
          <button className="btn btn-view" onClick={() => setShowModal(true)}>
            View Document
          </button>
        )}

        <button className="btn btn-approve" onClick={handleApprove}>
          Approve
        </button>

        <button className="btn btn-reject" onClick={handleReject}>
          Reject
        </button>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>KYC Document</h3>

            {/* Image preview */}
            {docUrl?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={docUrl}
                title="PDF Preview"
                width="100%"
                height="500px"
                style={{ borderRadius: "8px" }}
              />
            ) : (
              <img
                src={docUrl}
                alt="KYC Document"
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            )}

            <br />
            <br />

            {/* Open full */}
            <a href={docUrl} target="_blank" rel="noreferrer">
              Open Full Image
            </a>

            <br />
            <br />

            <button
              className="btn btn-reject"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
