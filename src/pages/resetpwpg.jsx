import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../css/resetpw.css';
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      alert('Failed to reset password: ' + error.message);
    } else {
      alert('New Password', data, 'Password updated! You can now log in.');
      window.location.href = '/login';
    }
  };

  return (
    <div className='reset-container'>
      <form onSubmit={handleReset}>
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
    </form>
    </div>
    
  );
};

export default ResetPassword;
