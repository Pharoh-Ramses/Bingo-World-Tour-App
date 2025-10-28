"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export const useAdmin = () => {
  const { isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isSignedIn || !user?.id) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/check-admin');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isSignedIn, user?.id]);

  return { isAdmin, isLoading };
};