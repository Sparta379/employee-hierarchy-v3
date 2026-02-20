'use client';

import { useState, useEffect } from 'react';
// import styles from '../management.module.css'; // Removed as styles are now Tailwind

export default function EditRolesPage() {
  const [roles, setRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingRole, setEditingRole] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/roles');
        if (!res.ok) throw new Error('Failed to fetch roles');
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    };

    fetchRoles();
  }, []);

  const addRole = async () => {
    if (!newRoleName.trim()) {
      setError('Please enter a valid role name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName.trim() }),
      });

      if (!res.ok) throw new Error('Failed to add role - Duplicate name?');

      const updated = await fetch('/api/roles').then(res => res.json());
      setRoles(updated);
      setNewRoleName('');
      setMessage('Role added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (role) => {
    setEditingRole(role);
    setEditName(role.name);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError('Role name cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: editingRole.role_id, name: editName.trim() }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      setRoles(prev =>
        prev.map(r => (r.role_id === editingRole.role_id ? { ...r, name: editName.trim() } : r))
      );
      setMessage('Role updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteRole = async (role_id) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id }),
      });

      if (!res.ok) throw new Error('Failed to delete role');

      setRoles(prev => prev.filter(r => r.role_id !== role_id));
      setMessage('Role deleted successfully!');
      setTimeout(() => setMessage(''), 3000);

      if (editingRole?.role_id === role_id) cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Manage Roles</h2>

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
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Role</h3>
        <div className="flex space-x-3">
          <input
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Enter new role name"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={addRole}>
            Add
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Roles</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredRoles.length > 0 ? (
            filteredRoles.map(role => (
              <div key={role.role_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                {editingRole?.role_id === role.role_id ? (
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
                    <span className="text-gray-800 text-lg">{role.name}</span>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        onClick={() => startEdit(role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={() => deleteRole(role.role_id)}
                        aria-label={`Delete ${role.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No roles match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
