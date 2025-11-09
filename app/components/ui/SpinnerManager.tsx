// This script handles hiding spinners for teacher users by adding a body class
'use client';

import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function SpinnerManager() {
  const { user } = useAuth();

  useEffect(() => {
    // If user is a teacher, add the class to body
    if (user?.role === 'teacher') {
      document.body.classList.add('teacher-role');
    } else {
      document.body.classList.remove('teacher-role');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('teacher-role');
    };
  }, [user?.role]);

  // This is a client-side only component with no UI
  return null;
}