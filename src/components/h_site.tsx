import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function H_site() {
  const [siteId, setSiteId] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { siteId } = router.query;
    if (siteId) {
      setSiteId(siteId as string);
    }

    // Set active button based on current route
    const path = router.pathname;
    if (path.includes('/settings')) setActiveButton('settings');
    else if (path.includes('/orders')) setActiveButton('orders');
    else if (path.includes('/setup')) setActiveButton('setup');
    else if (path.includes('/editor')) setActiveButton('editor');
    else if (path.includes('/products')) setActiveButton('products');
    else setActiveButton('dashboard');
  }, [router.query, router.pathname]);

  const navigateTo = (route: string) => {
    if (siteId) {
      router.push(`/dashboard/${siteId}${route}`);
    }
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-content">
        <button 
          onClick={() => navigateTo('')} 
          className={`sidebar-button ${activeButton === 'dashboard' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Dashboard</span>
        </button>
        <button 
          onClick={() => navigateTo('/setup')} 
          className={`sidebar-button ${activeButton === 'setup' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Setup</span>
        </button>
        <button 
          onClick={() => navigateTo('/products')} 
          className={`sidebar-button ${activeButton === 'products' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Products</span>
        </button>
        <button 
          onClick={() => navigateTo('/orders')} 
          className={`sidebar-button ${activeButton === 'orders' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Orders</span>
        </button>
        <button 
          onClick={() => navigateTo('/editor')} 
          className={`sidebar-button ${activeButton === 'editor' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Editor</span>
        </button>
        <button 
          onClick={() => navigateTo('/settings')} 
          className={`sidebar-button ${activeButton === 'settings' ? 'active' : ''}`}
        >
          <span className="sidebar-text">Settings</span>
        </button>
      </div>
    </nav>
  );
}