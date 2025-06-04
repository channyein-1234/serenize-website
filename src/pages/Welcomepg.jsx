// src/WelcomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/welcomepg.css'  //Import Css file

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <h1 className="welcome-heading"><p>
      ˚.🎀༘⋆</p>Welcome to Serenize <p>🎀</p></h1> 
      <h2 className='underline'>────୨ৎ────</h2>
      <p className="welcome-subheading">Daily Planner and Mental Wellness Tracker </p>
  
      <div className="buttons-group">
        <h4>"Haven’t created an account yet? Register Now and Let Serenize Take care of You!"</h4>
        <div className='btn-container'>
          <Link to="/register">
            <button className="action-button">Register</button>
          </Link>
        </div>
      </div>
      <div className="buttons-group">
        <h4>"Already have an account!"</h4>
          <div className='btn-container'>
            <Link to="/register">
              <button className="action-button">Sign In</button>
            </Link>
          </div>
      </div>
    </div>
  );
}

export default WelcomePage;
