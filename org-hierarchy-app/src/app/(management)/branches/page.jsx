'use client';

import { useState, useEffect } from 'react';
// import styles from '../management.module.css'; // Removed as styles are now Tailwind

export default function EditEntitiesPage() {
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingBranch, setEditingBranch] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        if (!res.ok) throw new Error('Failed to fetch branches');
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    };

    fetchBranches();
  }, []);

  const addBranch = async () => {
    if (!newBranch.trim()) {
      setError('Please enter a valid branch name');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBranch.trim() }),
      });

      if (!res.ok) throw new Error('Failed to add branch - Duplicate name?');

      const updated = await fetch('/api/branches').then(res => res.json());
      setBranches(updated);
      setNewBranch('');
      setMessage('Branch added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (branch) => {
    setEditingBranch(branch);
    setEditName(branch.name);
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setError('Branch name cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/branches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id:editingBranch.branch_id, name: editName.trim() }),
      });

      if (!res.ok) throw new Error('Failed to update branch');

      setBranches(prev =>
        prev.map(b => (b.branch_id === editingBranch.branch_id ? { ...b, name: editName.trim() } : b))
      );
      setMessage('Branch updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteBranch = async (branch_id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      const res = await fetch('/api/branches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id }),
      });

      if (!res.ok) throw new Error('Failed to delete branch');

      setBranches(prev => prev.filter(b => b.branch_id !== branch_id));
      setMessage('Branch deleted successfully!');
      setTimeout(() => setMessage(''), 3000);

      if (editingBranch?.branch_id === branch_id) cancelEdit();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };


  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Manage Branches</h2>

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
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Branch</h3>
        <div className="flex space-x-3">
          <input
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            placeholder="Enter new branch name"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={addBranch}>
            Add
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Branches</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search branches..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredBranches.length > 0 ? (
            filteredBranches.map(branch => (
              <div key={branch.branch_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                {editingBranch?.branch_id === branch.branch_id ? (
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
                    <span className="text-gray-800 text-lg">{branch.name}</span>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        onClick={() => startEdit(branch)}
                        aria-label={`Edit ${branch.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={() => deleteBranch(branch.branch_id)}
                        aria-label={`Delete ${branch.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No branches match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
