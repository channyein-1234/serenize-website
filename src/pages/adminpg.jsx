import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/serenize_logo.png';
import '../css/adminpg.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrash } from '@fortawesome/free-solid-svg-icons';
import supabase from './supabaseClient';

const Admin = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [user, setUser] = useState(null);

  const handleProfileClick = () => {
    navigate('/adminProfile');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      if (error || !user) {
        alert("You must be logged in as admin.");
        navigate('/login'); // or redirect appropriately
      } else {
        setUser(user);
      }
    };
  
    fetchUser().then(fetchMessages);
  }, [navigate]);
  

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('read', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error.message);
    } else {
      setMessages(data);
    }
  };

  const markAsRead = async (id) => {
    if (!user) return;
  
    const { error } = await supabase
      .from('messages')
      .update({ read: true })  // add user.id here
      .eq('id', id);
  
    if (error) {
      console.error('Error marking as read:', error.message);
    } else {
      await fetchMessages();  // refresh UI after update
    }
  };
  

  const deleteMessage = async (id) => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (confirmDelete) {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting message:', error.message);
      }

      fetchMessages();
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };



  return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <img src={logo} alt="Logo" className="logo" />
        <FontAwesomeIcon
          className="profile-icon"
          size="2x"
          onClick={handleProfileClick}
          icon={faUser}
        />
      </nav>

      <div className="admin-content">
        <h2>Welcome, Admin!</h2>

        <section className="section">
          <h3>User Messages</h3>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-card ${msg.read ? 'read' : 'unread'}`}
              >
                <div className="message-header">
                  <p><strong>Name:</strong> {msg.name}</p>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="delete-icon"
                    onClick={() => deleteMessage(msg.id)}
                    title="Delete Message"
                  />
                </div>
                <p><strong>Email:</strong> {msg.email}</p>
                <p>
                  <strong>Message:</strong>{' '}
                  {expanded[msg.id]
                    ? msg.message
                    : msg.message.length > 100
                    ? `${msg.message.substring(0, 100)}...`
                    : msg.message}
                  {msg.message.length > 100 && (
                    <button
                      className="expand-button"
                      onClick={() => toggleExpand(msg.id)}
                    >
                      {expanded[msg.id] ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </p>
                <p><strong>Time:</strong> {new Date(msg.created_at).toLocaleString()}</p>

                <a
                  href={`mailto:${msg.email}?subject=Reply to your message&body=Hi ${msg.name},`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reply-button"
                  onClick={() => markAsRead(msg.id)}
                >
                  Reply ✉️
                </a>

                {msg.read && <span className="read-badge">Read ✅</span>}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;
