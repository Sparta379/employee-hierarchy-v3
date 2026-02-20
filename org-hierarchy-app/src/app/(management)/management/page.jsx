'use client';

import React from 'react';
import Link from 'next/link';
import { FaUserPlus, FaBuilding, FaSitemap, FaUsersCog, FaChartBar } from 'react-icons/fa';


const managementItems = [
  { label: 'Add Employee', href: '/management/employees', icon: <FaUserPlus /> },
  { label: 'Manage Branches', href: '/management/branches', icon: <FaBuilding /> },
  { label: 'Manage Departments', href: '/management/departments', icon: <FaSitemap /> },
  { label: 'Manage Roles', href: '/management/roles', icon: <FaUsersCog /> },
  { label: 'View Org Chart', href: '/management', icon: <FaChartBar /> }, // Link to itself for now, will point to actual org chart
];

export default function ManagementDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Management Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementItems.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className="group block bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className="text-blue-600 group-hover:text-blue-800 transition-colors duration-300 text-5xl mb-4">
                {icon}
              </div>
              <span className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                {label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
