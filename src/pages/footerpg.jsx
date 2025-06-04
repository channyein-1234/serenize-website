// src/components/Footer.js
import React from 'react';
import '../css/footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEnvelope,faPhone } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
          <p><FontAwesomeIcon icon={faEnvelope} />Email: contact@serenize.com</p>
          <h3 className="site-name">Serenize: Daily Planner and Mental Wellness Tracker</h3>
          <p><FontAwesomeIcon icon={faPhone} /> Phone: +65 1234 5678</p>
      </div>
    </footer>
  );
};

export default Footer;
