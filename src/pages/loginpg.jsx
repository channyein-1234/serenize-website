import React, { useState } from 'react';
import '../css/authForm.css';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
  
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (signInError) {
      setLoading(false);
      console.error('Error signing in:', signInError.message);
      alert('Login failed: ' + signInError.message);
      return;
    }
  
    // Wait for the session to be available
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    setLoading(false);
  
    if (sessionError || !sessionData?.session?.user) {
      console.error('Session error:', sessionError?.message);
      alert('Login failed: Could not get user session.');
      return;
    }
  
    const userEmail = sessionData.session.user.email;
  
    // Fetch user role from your custom `users` table
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('email', userEmail)
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
  };
  

  const handleForgetPassword = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }
  
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password', 
    });
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
