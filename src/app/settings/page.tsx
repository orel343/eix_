'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { db, doc, setDoc } from '../../lib/firebase';

export default function Settings() {
  const [websiteType, setWebsiteType] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const createWebsite = async () => {
    if (!websiteType || !user) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'websites', user.uid), {
        type: websiteType,
        createdAt: new Date().toISOString(),
      });
      router.push('/settings/domain');
    } catch (error) {
      console.error('Error creating website', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Your Website</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="website-type" className="block text-sm font-medium text-gray-700">
                Choose Website Type
              </label>
              <select
                id="website-type"
                value={websiteType}
                onChange={(e) => setWebsiteType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a type</option>
                <option value="store">Online Store</option>
                <option value="blog">Blog</option>
                <option value="portfolio">Portfolio</option>
                <option value="business">Business Website</option>
              </select>
            </div>
            <button
              onClick={createWebsite}
              disabled={!websiteType || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Website'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

