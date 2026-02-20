'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gravatarUrl, setGravatarUrl] = useState('');
  const [userRole, setUserRole] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role') || '';

    setIsLoggedIn(!!token);
    setUserRole(role);

    if (email) {
      // Gravatar hash is computed on the server in /api/profile
      // For now, client-side hash for gravatar display (will be replaced by actual profile fetch)
      const hashEmail = email.trim().toLowerCase();
      // Using a simple hash for client-side display, ideally fetched from server-side profile endpoint.
      // Crypto module is not available in client-side environment.
      // For local testing, can manually hash or use a placeholder.
      // const hash = crypto.createHash('sha256').update(hashEmail).digest('hex');
      // setGravatarUrl(`https://0.gravatar.com/avatar/${hash}`);
      setGravatarUrl(`https://www.gravatar.com/avatar/?d=mp`); // Placeholder for now
    }

    const syncToken = () => {
      const updatedToken = localStorage.getItem('session_token');
      setIsLoggedIn(!!updatedToken);
      setUserRole(localStorage.getItem('user_role') || '');
    };

    window.addEventListener('login', syncToken);
    window.addEventListener('logout', syncToken);

    return () => {
      window.removeEventListener('login', syncToken);
      window.removeEventListener('logout', syncToken);
    };
  }, [pathname]); // Added pathname to dependency array

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_email'); // Also remove email on logout
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('logout'));
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/public/images/EHM-Light.png" // Use appropriate logo path
            alt="EPI-USE Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight">EPI-USE Hierarchy</span>
        </Link>
      </div>

      <nav className="flex-grow flex justify-center">
        <ul className="flex space-x-8">
          <li>
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
          </li>
          {isLoggedIn && (
            <>
              <li>
                <Link href="/management/employees" className="hover:text-blue-400 transition-colors">
                  Employees
                </Link>
              </li>
              <li>
                <Link href="/management" className="hover:text-blue-400 transition-colors">
                  Org Chart
                </Link>
              </li>
              <li>
                <Link href="/user-manual" className="hover:text-blue-400 transition-colors">
                  User Manual
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <Link href="/profile" className="flex items-center">
              <Image
                src={gravatarUrl || '/public/images/default-avatar.png'} // Use dynamic gravatarUrl or default
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full border-2 border-white hover:border-blue-400 transition-colors"
              />
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded-md transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
