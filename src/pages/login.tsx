'use client'

import { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero_login';
import Faqs from '../components/Faqs'

export default function login() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Hero />
      </>
  );
}

