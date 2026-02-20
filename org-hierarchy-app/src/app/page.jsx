'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeTree from './components/EmployeeTree';
import EmployeeList from './components/EmployeeList/EmployeeList';
import styles from './HomePage.module.css';

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState('hierarchy'); // default to hierarchy

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          localStorage.removeItem('session_token');
          router.push('/login');
          return;
        }

        const sessionData = await res.json();
        const now = new Date();
        const expiryDate = new Date(sessionData.expiry);

        if (expiryDate <= now) {
          localStorage.removeItem('session_token');
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
      }
    };

    checkSessionAndFetch();
  }, [router]);

  return (
    <>
      <div className={styles.page}>

        {/* View Toggle Bar */}
        <div className={styles.viewToggleBar}>
          <button
            className={`${styles.toggleButton} ${view === 'hierarchy' ? styles.active : ''}`}
            onClick={() => setView('hierarchy')}
          >
            Hierarchy View
          </button>
          <button
            className={`${styles.toggleButton} ${view === 'list' ? styles.active : ''}`}
            onClick={() => setView('list')}
          >
            List View
          </button>
        </div>

        <main className={styles.treeWrapper}>
          {view === 'hierarchy' ? <EmployeeTree /> : <EmployeeList />}
        </main>
      </div>
    </>
  );
}
