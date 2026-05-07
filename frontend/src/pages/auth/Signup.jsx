import React, { useState } from "react";
import API from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { registerUserSchema } from "../../validators/index";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error for that field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = registerUserSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }
    try {
      await API.post("/users/register", formData);
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      const field = error.response?.data?.field;
      const message = error.response?.data?.message;

      if (field) {
        setErrors((prev) => ({
          ...prev,
          [field]: message,
        }));
      } else {
        alert(message || "Registration failed");
      }
    }
  };

  return (
    <div className="authPage-container">
      <form className="authPage-form" onSubmit={handleSubmit} noValidate>
        <h2>Signup</h2>
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
          className={`auth-input ${errors.name ? "input-error" : ""}`}
        />
        {errors.name && <p className="error">{errors.name}</p>}
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className={`auth-input ${errors.email ? "input-error" : ""}`}
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          name="phone"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Phone Number"
          onChange={handleChange}
          minLength={10}
          maxLength={15}
          required
          className={`auth-input ${errors.phone ? "input-error" : ""}`}
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
        <input
          name="password"
          type="password"
          minLength={6}
          placeholder="Password"
          onChange={handleChange}
          required
          className={`auth-input ${errors.password ? "input-error" : ""}`}
        />
        {errors.password && <p className="error">{errors.password}</p>}
        <input
          name="street"
          placeholder="Street"
          onChange={handleChange}
          className={`auth-input ${errors.street ? "input-error" : ""}`}
        />
        {errors.street && <p className="error">{errors.street}</p>}
        <input
          name="city"
          placeholder="City"
          onChange={handleChange}
          className={`auth-input ${errors.city ? "input-error" : ""}`}
        />
        {errors.city && <p className="error">{errors.city}</p>}
        <input
          name="state"
          placeholder="State"
          onChange={handleChange}
          className={`auth-input ${errors.state ? "input-error" : ""}`}
        />
        {errors.state && <p className="error">{errors.state}</p>}
        <input
          name="pincode"
          placeholder="Pincode"
          maxLength={6}
          onChange={handleChange}
          className={`auth-input ${errors.pincode ? "input-error" : ""}`}
        />
        {errors.pincode && <p className="error">{errors.pincode}</p>}
        <button type="submit">Signup</button>
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
