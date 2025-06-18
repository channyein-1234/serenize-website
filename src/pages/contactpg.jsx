import React, { useState } from "react";
import "../css/contactpg.css";
import Navbar from "./navbar";
import Footer from "./footerpg";
import supabase from './supabaseClient';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      alert("User not authenticated.");
      return;
    }
  
    const { error } = await supabase.from('messages').insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        created_at: new Date().toISOString(),
        user_id: user.id, 
      },
    ]);
  
    if (error) {
      console.error("Insert error:", error.message);
      alert("Something went wrong. Please try again.");
    } else {
      alert("Thank you for reaching out. We'll get back to you soon! 💌");
      setFormData({ name: "", email: "", message: "" });
    }
  };
  

  return (
    <div className="page-container">
      <Navbar />
      <div className="section-container">
      <div className="contact-container">
        <h1>We’re Here for You 🌸</h1>
        <p>
          Whether you're looking for help, want to share love, or offer a kind suggestion — 
          our hearts and inboxes are open. 💖
        </p>

        <div className="contact-card">
          <div className="form-container">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Write your message here..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Send 💌</button>
          </form>
          </div>
        </div>

        <div className="email-card">
          <h2>Prefer Email?</h2>
          <p>
            📩 <a href="mailto:support@serenize.com">support@serenize.com</a>
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
