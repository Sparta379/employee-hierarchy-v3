'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import crypto from 'crypto';
import { GravatarQuickEditor } from '@gravatar-com/quick-editor';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [gravatarUrl, setGravatarUrl] = useState('');
  const [profileData, setProfileData] = useState(null);
  const router = useRouter();

  const quickEditorRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const userEmail = localStorage.getItem('user_email');

    if (!token || !userEmail) {
      router.push('/login');
      return;
    }

    setEmail(userEmail);
    const emailLower = userEmail.trim().toLowerCase();
    const hash = crypto.createHash('sha256').update(emailLower).digest('hex');
    const avatarUrl = `https://0.gravatar.com/avatar/${hash}`;
    setGravatarUrl(avatarUrl);

    // Fetch profile data from backend API
    fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        } else {
          setProfileData(null);
        }
      })
      .catch(() => setProfileData(null));
  }, [router]);

  useEffect(() => {
    if (!gravatarUrl || !email) return;

    if (!quickEditorRef.current) {
      quickEditorRef.current = new GravatarQuickEditor({
        email: email,
        editorTriggerSelector: '#gravatar-avatar',
        avatarSelector: '#gravatar-avatar',
        scope: ['avatars'],
      });
    }
  }, [gravatarUrl, email]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {gravatarUrl && (
        <div
          id="gravatar-avatar"
          className="relative group w-40 h-40 cursor-pointer"
          title="Click to edit your Gravatar"
        >
          <img
            src={gravatarUrl}
            alt="Gravatar"
            className="w-full h-full rounded-full shadow-lg border border-gray-300 dark:border-gray-700 object-cover transition duration-200 group-hover:opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Edit profile photo
          </div>
        </div>
      )}

      <p className="mt-4 text-lg font-semibold">{profileData?.display_name || email}</p>

      <p className="text-sm text-gray-500 mt-2">
        This avatar is managed by Gravatar. Click the image to update it.
      </p>

      {profileData && (
        <div className="mt-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-gray-900 dark:text-white">
          {profileData.description && (
            <>
              <h2 className="text-xl font-semibold mb-2">About Me</h2>
              <p className="mb-4">{profileData.description}</p>
            </>
          )}

          {(profileData.location || profileData.job_title || profileData.company) && (
            <p className="mb-4">
              {profileData.location && <><strong>Location:</strong> {profileData.location}<br /></>}
              {profileData.job_title && profileData.job_title !== '--' && <><strong>Job Title:</strong> {profileData.job_title}<br /></>}
              {profileData.company && <><strong>Company:</strong> {profileData.company}</>}
            </p>
          )}

          {profileData.verified_accounts?.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Verified Accounts</h2>
              <ul className="list-disc list-inside space-y-1">
                {profileData.verified_accounts.map(({ service_label, url, service_icon }, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    {service_icon && <img src={service_icon} alt={service_label} className="w-5 h-5" />}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {service_label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!profileData.description &&
            !profileData.location &&
            (!profileData.verified_accounts || profileData.verified_accounts.length === 0) && (
              <p className="italic text-gray-500">No additional profile information available.</p>
            )}
        </div>
      )}
    </div>
  );
}
