// src/App.js
import React  from 'react';
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
import UserProfile from './pages/userProfile';

function App() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function (error) {
      console.error('Service Worker registration failed:', error);
    });
  }
  
  
  return (
    // <Router>
    //   <Routes>
    //     {/* Public Routes */}
    //     <Route path="/" element={<WelcomePage />} />
    //     <Route path="/login" element={<LoginForm />} />
    //     <Route path="/register" element={<RegisterForm />} />
    //     <Route path="/reset-password" element={<ResetPassword />} />

    //     {/* Unrestricted Routes */}
    //     <Route path="/home" element={<HomePage />} />
    //     <Route path="/planning" element={<Planning />} />
    //     <Route path="/journaling" element={<JournalEditor />} />
    //     <Route path="/wellness" element={<Wellness />} />
    //     <Route path="/contact" element={<Contact />} />
    //     <Route path="/chatbot" element={<Chatbot />} />
    //     <Route path="/profile" element={<UserProfile />} />
    //     <Route path="/admin" element={<AdminPage />} />
    //   </Routes>
    // </Router>
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
        <Route
          path="/userprofile"
          element={
            <RouteRestriction requiredRole="user">
              <UserProfile/>
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



