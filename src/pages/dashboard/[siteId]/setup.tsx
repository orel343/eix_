import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, doc, getDoc, updateDoc, storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Header from '../../../components/Header';
import SetupSteps from '../../../components/SetupSteps';
import H_site from '../../../components/h_site';

export default function Sitesetup() {
    const [site, setSite] = useState(null);
    const { user, loading } = useAuth();
    const router = useRouter();
    const { siteId } = router.query;
    const [sites, setSites] = useState([]);

    useEffect(() => {
      if (!loading && user) {
        if (siteId) {
          fetchSite();
        }
      } else if (!loading && !user) {
        router.push('/');
      }
    }, [user, loading, siteId]);

    const fetchSite = async () => {
      if (!user || !siteId) return;
      try {
        const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string);
        const siteSnap = await getDoc(siteRef);
        if (siteSnap.exists()) {
          setSite({ id: siteSnap.id, ...siteSnap.data() });
        } else {
          console.log('Site not found, redirecting...');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching site:', error);
      }
    };

    const handleSetupComplete = async (setupData) => {
      if (!user || !siteId) return;
      try {
        const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string);
        
        // Upload product images
        const uploadedImages = await Promise.all(
          setupData.products[0].images.map(async (image, index) => {
            const imageRef = ref(storage, `users/${user.uid}/sites/${siteId}/products/${setupData.products[0].name}_${index}`);
            const response = await fetch(image);
            const blob = await response.blob();
            await uploadBytes(imageRef, blob);
            return getDownloadURL(imageRef);
          })
        );

        // Update setupData with uploaded image URLs
        setupData.products[0].images = uploadedImages;

        await updateDoc(siteRef, {
          ...setupData,
          setupCompleted: true
        });
        router.push(`/dashboard/${siteId}`);
      } catch (error) {
        console.error('Error updating site:', error);
      }
    };

    if (loading || !user) {
      return <div>Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <Header user={user} siteName={site?.name || 'Site Setup'} />
        <H_site sites={sites} />        
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Welcome to your Setup {site?.name}</h1>
          <SetupSteps onComplete={handleSetupComplete} />
        </main>
      </div>
    );
}

