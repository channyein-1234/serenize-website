import React, { useState } from 'react';
import '../css/registerForm.css';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const RegisterForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.password.trim()) newErrors.password = 'Password is required';

    if (form.email && !form.email.endsWith('@gmail.com')) {
      newErrors.email = 'Input a valid email address (@gmail.com)';
    }

    if (form.password) {
      const password = form.password;
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[^a-zA-Z0-9]/.test(password);

      if (!hasLetter || !hasNumber || !hasSpecial) {
        newErrors.password =
          'Create a password that contains letters, numbers, and special characters';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone
        }
      }
    });

    if (error) {
      alert('Sign-up failed: ' + error.message);
      return;
    }

    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <div className="registerForm-container max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Confirm Your Email</h2>
        <p>
          Thank you for registering, <strong>{form.name}</strong>!<br />
          A confirmation email has been sent to <strong>{form.email}</strong>.<br />
          Please check your inbox and confirm to activate your account.
        </p>
        <button
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="registerForm-container">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded shadow"
      >
        <button
          type="button"
          className="previous-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="submit-btn w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
