// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepg';
import WelcomePage from './pages/Welcomepg';
import LoginForm from './pages/loginpg';
import RegisterForm from './pages/registerpg';
import ResetPassword from './pages/resetpwpg';
import Planning from './pages/planpg';
import JournalEditor from './pages/journalingpg';
import Wellness from './pages/wellnesspg';
import Contact from './pages/contactpg';
import Chatbot from './pages/chatbot';
import AdminPage from './pages/adminpg'; // <-- Assuming you have this page
import RouteRestriction from './pages/routeRestriction';

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <RouteRestriction requiredRole="user">
              <HomePage />
            </RouteRestriction>
          }
        />
        <Route
          path="/planning"
          element={
            <RouteRestriction requiredRole="user">
              <Planning />
            </RouteRestriction>
          }
        />
        <Route
          path="/journaling"
          element={
            <RouteRestriction requiredRole="user">
              <JournalEditor />
            </RouteRestriction>
          }
        />
        <Route
          path="/wellness"
          element={
            <RouteRestriction requiredRole="user">
              <Wellness />
            </RouteRestriction>
          }
        />
        <Route
          path="/contact"
          element={
            <RouteRestriction requiredRole="user">
              <Contact />
            </RouteRestriction>
          }
        />
        <Route
          path="/chatbot"
          element={
            <RouteRestriction requiredRole="user">
              <Chatbot />
            </RouteRestriction>
          }
        />


        {/* Admin-only Route */}
        <Route
          path="/admin"
          element={
            <RouteRestriction requiredRole="admin">
              <AdminPage />
            </RouteRestriction>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
