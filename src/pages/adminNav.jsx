import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/serenize_logo.png';
import '../css/adminNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const AdminNaV = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/adminProfile');
  };

  const handleLogoClick = () => {
    navigate('/admin');
  };

  return (
    <div className="nav-container">
      <nav className="admin-navbar">
        <img
          src={logo}
          alt="Logo"
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }} // Optional: makes it look clickable
        />
        <FontAwesomeIcon
          className="profile-icon"
          size="2x"
          onClick={handleProfileClick}
          icon={faUser}
        />
      </nav>
    </div>
  );
};

export default AdminNaV;
