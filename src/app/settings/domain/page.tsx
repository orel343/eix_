'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { db, doc, updateDoc } from '../../../lib/firebase';

export default function DomainSettings() {
  const [domain, setDomain] = useState('');
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

  const saveDomain = async () => {
    if (!domain || !user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'websites', user.uid), {
        domain: domain,
        updatedAt: new Date().toISOString(),
      });
      router.push('/settings/theme');
    } catch (error) {
      console.error('Error saving domain', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Domain</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Enter Your Domain
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              onClick={saveDomain}
              disabled={!domain || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Domain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

