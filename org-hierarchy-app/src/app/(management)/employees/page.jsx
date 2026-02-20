'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEmployee() {
  const router = useRouter();
  const [form, setForm] = useState({
    employee_number: '',
    branch_number: '',
    dept_number: '',
    role_number: '',
    name: '',
    surname: '',
    birth_date: '',
    salary: '',
  });

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch all dropdown data independently on mount
  useEffect(() => {
    async function fetchAllData() {
      setLoadingBranches(true);
      setLoadingDepartments(true);
      setLoadingRoles(true);

      try {
        const [branchesRes, departmentsRes, rolesRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/departments'),
          fetch('/api/roles'),
        ]);

        if (!branchesRes.ok) throw new Error('Failed to fetch branches');
        if (!departmentsRes.ok) throw new Error('Failed to fetch departments');
        if (!rolesRes.ok) throw new Error('Failed to fetch roles');

        const [branchesData, departmentsData, rolesData] = await Promise.all([
          branchesRes.json(),
          departmentsRes.json(),
          rolesRes.json(),
        ]);

        setBranches(branchesData);
        setDepartments(departmentsData);
        setRoles(rolesData);
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Failed to load dropdown data' });
      } finally {
        setLoadingBranches(false);
        setLoadingDepartments(false);
        setLoadingRoles(false);
      }
    }

    fetchAllData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(null);

    for (const field of [
      'employee_number',
      'branch_number',
      'dept_number',
      'role_number',
      'name',
      'surname',
      'birth_date',
      'salary',
    ]) {
      if (!form[field]) {
        setMessage({ type: 'error', text: `Field "${field}" is required.` });
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: form.employee_number,
          branch_number: Number(form.branch_number),
          dept_number: Number(form.dept_number),
          role_number: Number(form.role_number),
          name: form.name,
          surname: form.surname,
          birth_date: form.birth_date,
          salary: Number(form.salary),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Employee added successfully.' });
        setForm({
          employee_number: '',
          branch_number: '',
          dept_number: '',
          role_number: '',
          name: '',
          surname: '',
          birth_date: '',
          salary: '',
        });
        router.push('/management/employees'); // Redirect to employee list after successful add
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add employee.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Add New Employee</h1>

      {message && (
        <div
          className={`p-3 mb-4 rounded-md text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="employee_number" className="block text-sm font-medium text-gray-700">Employee Number</label>
            <input
              type="text"
              id="employee_number"
              name="employee_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={form.employee_number}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="branch_number" className="block text-sm font-medium text-gray-700">Branch</label>
            <select
              id="branch_number"
              name="branch_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              onChange={handleChange}
              value={form.branch_number}
              disabled={loadingBranches}
              required
            >
              <option value="">Select branch...</option>
              {branches.map(branch => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dept_number" className="block text-sm font-medium text-gray-700">Department</label>
            <select
              id="dept_number"
              name="dept_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              onChange={handleChange}
              value={form.dept_number}
              disabled={loadingDepartments}
              required
            >
              <option value="">Select department...</option>
              {departments.map(dept => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role_number" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role_number"
              name="role_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              onChange={handleChange}
              value={form.role_number}
              disabled={loadingRoles}
              required
            >
              <option value="">Select role...</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
            <input
              type="text"
              id="surname"
              name="surname"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={form.surname}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={form.birth_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
            <input
              type="number"
              step="0.01"
              id="salary"
              name="salary"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={form.salary}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={submitting}
          >
            {submitting ? 'Adding Employee...' : 'Add Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}
