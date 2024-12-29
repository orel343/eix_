import { useState } from 'react';
import Link from 'next/link';
import { User, getAuth, signOut } from 'firebase/auth'; // Import Firebase Auth methods

interface HeaderProps {
  user: User;
  siteName?: string;
  sites?: Site[]; // Mark sites as optional
}

interface Site {
  id: string;
  name: string;
  domain: string;
}

export default function Header({ user, siteName, sites = [] }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Logout function (Firebase sign-out logic)
  const handleLogout = async () => {
    const auth = getAuth(); // Get Firebase Auth instance
    try {
      await signOut(auth); // Sign out the user
      console.log('Successfully logged out!');
      // Optionally redirect to the homepage or login page after logging out
      // window.location.href = '/'; // Or use Next.js routing (e.g., useRouter())
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-xl font-bold text-gray-800 mr-4">
            Website Builder
          </Link>
          {siteName && (
            <span className="text-gray-600 text-sm ml-4">
              Current site: {siteName}
            </span>
          )}
        </div>
        <div className="flex items-center relative">
          {/* Profile Picture and Username */}
          <div onClick={toggleDropdown} className="cursor-pointer flex items-center">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-gray-800">{user.displayName}</span>
          </div>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg p-2">
              <button
                onClick={handleLogout}
                className="w-full text-red-600 hover:bg-red-100 py-2 px-4 rounded-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
