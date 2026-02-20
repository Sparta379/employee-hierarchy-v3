'use client';

import { useState, useEffect } from 'react';
// import styles from '../management.module.css'; // Removed as styles are now Tailwind

export default function EditDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingDept, setEditingDept] = useState(null);
  const [editName, setEditName] = useState('');


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments');
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    };

    fetchDepartments();
  }, []);

  const addDepartment = async () => {
    if (!newDeptName.trim()) {
      setError('Please enter a valid department name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName.trim()}),
      });

      if (!res.ok) throw new Error('Failed to add department - Duplicate name?');

      const updated = await fetch('/api/departments').then(res => res.json());
      setDepartments(updated);
      setNewDeptName('');
      setMessage('Department added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (dept) => {
    setEditingDept(dept);
    setEditName(dept.name);
  };

  const cancelEdit = () => {
    setEditingDept(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError('Department name cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dept_id: editingDept.dept_id, name: editName.trim()}),
      });

      if (!res.ok) throw new Error('Failed to update department');

      setDepartments(prev =>
        prev.map(d => (d.dept_id === editingDept.dept_id ? { ...d, name: editName.trim() } : d))
      );
      setMessage('Department updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteDepartment = async (dept_id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const res = await fetch('/api/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dept_id }),
      });

      if (!res.ok) throw new Error('Failed to delete department');

      setDepartments(prev => prev.filter(d => d.dept_id !== dept_id));
      setMessage('Department deleted successfully!');
      setTimeout(() => setMessage(''), 3000);

      if (editingDept?.dept_id === dept_id) cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Manage Departments</h2>

      {message && (
        <div className="p-3 mb-4 rounded-md text-center bg-green-100 text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 rounded-md text-center bg-red-100 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Department</h3>
        <div className="flex space-x-3">
          <input
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="Enter new department name"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={addDepartment}>
            Add
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Departments</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search departments..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map(dept => (
              <div key={dept.dept_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                {editingDept?.dept_id === dept.dept_id ? (
                  <>
                    <input
                      className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex space-x-2 ml-4">
                      <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={saveEdit}>Save</button>
                      <button className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-800 text-lg">{dept.name}</span>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        onClick={() => startEdit(dept)}
                        aria-label={`Edit ${dept.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={() => deleteDepartment(dept.dept_id)}
                        aria-label={`Delete ${dept.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No departments match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
