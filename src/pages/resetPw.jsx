import React, { useState, useEffect } from 'react';
import '../css/resetpw.css';
import supabase from './supabaseClient';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Ensure Supabase picks up the access token from URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus('Reset link is invalid or expired. Please request a new one.');
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      alert('Failed to reset password: ' + error.message);
    } else {
      alert('Password updated successfully! You can now log in.');
      window.location.href = '/login'; // Redirect to login page
    }
  };

  return (
    <div className="reset-container">
      <form onSubmit={handleReset} className="reset-form">
        <h2>Reset Your Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Reset Password'}
        </button>
        {status && <p className="status-message">{status}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
