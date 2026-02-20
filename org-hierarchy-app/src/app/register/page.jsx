'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          email,
          password,
        }),
      });

      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const data = await res.json();
        if (data.error === 'User already exists') {
          setError('User already exists. Please try a different employee number.');
        } else {
          setError(data.error || 'Registration failed');
        }
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
          Register your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="employee_number" className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-400">
              Employee Number
            </label>
            <input
              id="employee_number"
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="e.g. E1A"
              className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

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

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Register
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          {success && (
            <p className="text-green-500 text-sm text-center mt-2">{success}</p>
          )}
        </form>

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?
          <a href="/login" className="text-blue-500 hover:underline ml-1">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
