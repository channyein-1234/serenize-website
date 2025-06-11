// components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from './supabaseClient';

const RouteRestriction = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Adjusted to use 'users' table and 'id'
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        setIsAllowed(false);
      } else if (!requiredRole || user.role === requiredRole) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
      }

      setLoading(false);
    };

    checkAuthAndRole();
  }, [requiredRole]);

  if (loading) return <div>Loading...</div>;

  return isAllowed ? children : <Navigate to="/not-authorized" />;
};

export default RouteRestriction;
