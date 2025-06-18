import React, { useState } from 'react';
import '../css/authForm.css'; // use the same css file
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

    const password = form.password;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (password && (!hasLetter || !hasNumber || !hasSpecial)) {
      newErrors.password =
        'Create a password that contains letters, numbers, and special characters';
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

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      alert('Sign-up failed: ' + error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: 'user'
        }
      ]);

      if (insertError) {
        alert('Something went wrong saving your profile.' + insertError.message);
        return;
      }
    }

    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <div className="login-container">
        <div className="login-form">
          <p>
            Thank you for registering, <strong>{form.name}</strong>! <br />
            
            
          </p>
          <button
            className="submit-btn"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <button
          type="button"
          className="previous-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ←
        </button>
        <h2>Register</h2>

        {/* Name */}
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}

        {/* Email */}
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}

        {/* Phone */}
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}

        {/* Password */}
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
