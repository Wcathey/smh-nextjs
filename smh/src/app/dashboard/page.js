'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for session when the page loads
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('/login'); // Redirect to login if not authenticated
      } else {
        setSession(session); // Set session data when authenticated
      }
    };

    getSession();
  }, [router]);

  if (!session) {
    return <div>Loading...</div>; // Show loading state while fetching session
  }

  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      {/* Render content for authenticated users here */}
    </div>
  );
}
