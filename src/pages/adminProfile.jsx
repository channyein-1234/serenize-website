import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import supabase from './supabaseClient';
import Footer from './footerpg';
import AdminNaV from './adminNav';
import '../css/profile.css';

const AdminProfile = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const fetchProfile = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setStatus('Error fetching user');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('name, email, phone')
      .eq('id', user.id)
      .single();

    if (error) {
      setStatus('Failed to load profile');
    } else {
      setForm(data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('users')
      .update({
        name: form.name,
        email: form.email,
        phone: form.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setStatus('Update failed: ' + error.message);
    } else {
      setStatus('Profile updated successfully!');
    }

    setLoading(false);
  };

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login'); // redirect to login page
    } else {
      setStatus('Logout failed: ' + error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className='page-container'>
      <AdminNaV />
      <div className="user-profile-section">
        <div className="user-profile-container">

          <h2>Admin Profile</h2>
          <form onSubmit={handleUpdate}>
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} />

            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />

            <label>Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />

            <button className='update-button' type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {status && <p className="status">{status}</p>}

          {/* Logout Button */}
          <button className='logout-button' onClick={handleLogout}>
            Log Out
          </button>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProfile;
