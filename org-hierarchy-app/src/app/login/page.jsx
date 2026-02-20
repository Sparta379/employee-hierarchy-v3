'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('session_token', data.token);
        localStorage.setItem('user_email', email); 
        localStorage.setItem('user_role', data.role || ''); 
        window.dispatchEvent(new Event('login'));

        // Redirect
        router.push('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };


  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-md border"
        style={{
          background: 'var(--foreground)',
          color: 'var(--text)',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 8px var(--shadow)',
        }}
      >

        <div className="flex justify-center items-center relative h-20">
          {/* Light mode logo */}
          <div className="block dark:hidden">
            <Image
              src="/images/EHM-Light.png"
              alt="Logo (Light Mode)"
              width={180}
              height={80}
              priority
            />
          </div>

          {/* Dark mode logo */}
          <div className="hidden dark:block">
            <Image
              src="/images/EHM-Dark.png"
              alt="Logo (Dark Mode)"
              width={180}
              height={80}
              priority
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          <div className="flex justify-between text-sm text-gray-800 dark:text-gray-400">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Login
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </form>

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?
          <a href="/register" className="text-blue-500 hover:underline ml-1">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
