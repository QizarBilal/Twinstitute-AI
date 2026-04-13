'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CinematicLoading from '@/components/shared/animations/CinematicLoading';

export default function LoadingEntry() {
  const router = useRouter();

  useEffect(() => {
    // Load completes after 6 seconds, then check user
    const timer = setTimeout(async () => {
      try {
        // Get session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        const session = await sessionRes.json();

        if (!session?.user) {
          // Not logged in → go to landing
          router.push('/');
          return;
        }

        // Logged in → check user status
        const userRes = await fetch('/api/user/status', { credentials: 'include' });
        const userData = await userRes.json();

        if (!userData?.user) {
          router.push('/');
          return;
        }

        // Route based on user state
        if (!userData.user.selectedRole) {
          // No role selected → dashboard for initial setup
          router.push('/dashboard');
        } else {
          // Ready → dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth flow error:', error);
        router.push('/');
      }
    }, 6000); // Match loading duration (5.5s + 0.5s buffer)

    return () => clearTimeout(timer);
  }, [router]);

  return <CinematicLoading />;
}
