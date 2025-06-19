// src/pages/UpdatePassword.jsx
import React, { useState } from 'react';
import '../css/authForm.css';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setStatus('Error: ' + error.message);
    } else {
      setStatus('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handlePasswordUpdate}>
        <button
          type="button"
          className="previous-btn"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <h2>Reset Your Password</h2>

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {status && <p className="status-message">{status}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
