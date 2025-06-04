import React from 'react';
import logo from '../img/serenize_logo.png';
import '../css/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMarker, faBook, faSpa, faRobot, faLink } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <div className='nav-container'>
      <div className='sub-container'>
      
        <div className='logo-container'>
          <img className='logo' src={logo} alt='Logo' />
          <h3>Serenize</h3>
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
  <Link to="/planning"><button><FontAwesomeIcon icon={faMarker} /> <br /> PlanTasks</button></Link>
  <Link to="/journaling"><button><FontAwesomeIcon icon={faBook} /><br /> Journaling</button></Link>
  <Link to="/wellness"><button><FontAwesomeIcon icon={faSpa} /><br /> Wellness</button></Link>
  <Link to="/chatbot"><button><FontAwesomeIcon icon={faRobot} /><br /> Chatbot</button></Link>
  <Link to="/contact"><button><FontAwesomeIcon icon={faLink} /><br /> Contact</button></Link>
</nav>
      </div>
    </div>
  );
};

export default Navbar;
