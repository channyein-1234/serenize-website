import React, { useState } from 'react';
import '../css/loginForm.css';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';



const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      console.error('Error signing in:', error.message);
      alert('Login failed: ' + error.message);
    } else {
      const userId = data.user.id;

      // Fetch user role
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (fetchError || !userData) {
        console.error('Error fetching user role:', fetchError?.message);
        alert('Could not retrieve user role.');
        return;
      }

      const role = userData.role;
      console.log('User role:', role);

      // Navigate based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }

    }
  };

  const handleForgetPassword = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      console.error('Error resetting password:', error.message);
      alert('Reset password failed: ' + error.message);
    } else {
      console.log('Password reset email sent:', data);
      alert('Password reset email sent! Please check your inbox.');
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
        }}
      >
        <button
          type="button"
          className="previous-btn"
          onClick={() => window.history.back()}
        >
          ←
        </button>

        <h2>Login to Serenize</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="forgot-password" onClick={handleForgetPassword}>
          Forgot your password?
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
