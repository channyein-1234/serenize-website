import React from 'react';
import logo from '../img/serenize_logo.png';
import '../css/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMarker, faBook, faUser, faSpa, faRobot, faLink } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <div className='nav-container'>
      <div className='sub-container'>
      
        <div className='logo-container'>
        <Link to="/home">
           <img className="logo" src={logo} alt="Logo" style={{ cursor: 'pointer' }} />
</Link>          <h3>Serenize</h3>
        </div>

        <div className='emoji-divider'>
          <span>⋆✴︎˚｡⋆</span>
          <span>🌸</span>
          <span>📝</span>
          <span>🎀</span>
          <span>🫧</span>
          <span>🔮</span>
          <span>°❀⋆.ೃ࿔*:･</span>
        </div>

        <nav className='navbar'>
          <Link to="/planning"><button><FontAwesomeIcon icon={faMarker} /> <br /> <p>PlanTasks</p></button></Link>
          <Link to="/journaling"><button><FontAwesomeIcon icon={faBook} /><br /> <p>Journaling</p></button></Link>
          <Link to="/wellness"><button><FontAwesomeIcon icon={faSpa} /><br /> <p>Journaling</p></button></Link>
          <Link to="/chatbot"><button><FontAwesomeIcon icon={faRobot} /><br /><p> Chatbot</p></button></Link>
          <Link to="/contact"><button><FontAwesomeIcon icon={faLink} /><br /> <p>Contact</p></button></Link>
          <Link to="/userprofile"><button><FontAwesomeIcon icon={faUser} /><br /><p>Profile</p></button></Link>

        </nav>
      </div>
    </div>
  );
};

export default Navbar;
