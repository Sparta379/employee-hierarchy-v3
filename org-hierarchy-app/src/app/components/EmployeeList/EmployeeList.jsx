'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// 
import Link from 'next/link';

// Searchable dropdown component
const SearchableDropdown = ({ options, onSelect, placeholder, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const filtered = options.filter(option => {
      const searchLower = searchTerm.toLowerCase();
      return (
        option.employee_number.toString().includes(searchLower) ||
        option.name.toLowerCase().includes(searchLower) ||
        option.surname.toLowerCase().includes(searchLower) ||
        `${option.name} ${option.surname}`.toLowerCase().includes(searchLower)
      );
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onSelect(option.employee_number);
    setSearchTerm('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.employee_number}
                className="p-2 cursor-pointer hover:bg-blue-100"
                onClick={() => handleSelect(option)}
              >
                #{option.employee_number} - {option.name} {option.surname}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">
              {searchTerm ? 'No employees found' : 'Type to search employees...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [hierarchyData, setHierarchyData] = useState([]);
  const [subordinates, setSubordinates] = useState({});
  const [availableEmployees, setAvailableEmployees] = useState([]);

  const [editingEmployeeNumber, setEditingEmployeeNumber] = useState(null);
  const [editForm, setEditForm] = useState({
    employee_number: '',
    branch_number: '',
    dept_number: '',
    role_number: '',
    name: '',
    surname: '',
    birth_date: '',
    salary: '',
  });

  const [filters, setFilters] = useState({
    branch: '',
    department: '',
    role: '',
    salaryMin: '',
    salaryMax: '',
    birthDateFrom: '',
    birthDateTo: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const getReportingChain = useCallback((employeeId) => {
    const chain = [];
    const visited = new Set();
    let current = employeeId;
    
    while (current && !visited.has(current)) {
      visited.add(current);
      const manager = hierarchyData.find(h => h.employee_id === current);
      if (manager) {
        chain.push(manager.manager_id);
        current = manager.manager_id;
      } else {
        break;
      }
    }
    
    return chain;
  }, [hierarchyData]);

  useEffect(() => {
    async function fetchHierarchy() {
      try {
        const res = await fetch('/api/hierarchy');
        if (res.ok) {
          const data = await res.json();
          setHierarchyData(data);
          
          const subMap = {};
          data.forEach(({ manager_id, employee_id }) => {
            if (!subMap[manager_id]) {
              subMap[manager_id] = [];
            }
            subMap[manager_id].push(employee_id);
          });
          setSubordinates(subMap);
        }
      } catch (err) {
        console.error('Error fetching hierarchy:', err);
      }
    }
    fetchHierarchy();
  }, []);

  useEffect(() => {
    if (editingEmployeeNumber) {
      const currentSubs = subordinates[editingEmployeeNumber] || [];
      const reportingChain = getReportingChain(editingEmployeeNumber);
      
      const available = employees.filter(emp => 
        emp.employee_number !== editingEmployeeNumber && 
        !currentSubs.includes(emp.employee_number) &&
        !reportingChain.includes(emp.employee_number)
      );
      setAvailableEmployees(available);
    }
  }, [editingEmployeeNumber, employees, subordinates, getReportingChain]); // Added getReportingChain

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const res = await fetch('/api/employees');
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchDropdowns() {
      setLoadingDropdowns(true);
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
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoadingDropdowns(false);
      }
    }
    fetchDropdowns();
  }, []);

  // Enhanced filtering logic
  useEffect(() => {
    let filtered = employees;

    // Text search filter
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(emp =>
        emp.employee_number.toString().includes(term) ||
        emp.name.toLowerCase().includes(term) ||
        emp.surname.toLowerCase().includes(term)
      );
    }

    // Branch filter
    if (filters.branch) {
      filtered = filtered.filter(emp => emp.branch_number === parseInt(filters.branch));
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(emp => emp.dept_number === parseInt(filters.department));
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(emp => emp.role_number === parseInt(filters.role));
    }

    // Salary range filter
    if (filters.salaryMin) {
      filtered = filtered.filter(emp => emp.salary >= parseFloat(filters.salaryMin));
    }
    if (filters.salaryMax) {
      filtered = filtered.filter(emp => emp.salary <= parseFloat(filters.salaryMax));
    }

    // Birth date range filter
    if (filters.birthDateFrom) {
      filtered = filtered.filter(emp => new Date(emp.birth_date) >= new Date(filters.birthDateFrom));
    }
    if (filters.birthDateTo) {
      filtered = filtered.filter(emp => new Date(emp.birth_date) <= new Date(filters.birthDateTo));
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, employees, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      branch: '',
      department: '',
      role: '',
      salaryMin: '',
      salaryMax: '',
      birthDateFrom: '',
      birthDateTo: '',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (filters.branch) count++;
    if (filters.department) count++;
    if (filters.role) count++;
    if (filters.salaryMin) count++;
    if (filters.salaryMax) count++;
    if (filters.birthDateFrom) count++;
    if (filters.birthDateTo) count++;
    return count;
  };

  const startEdit = emp => {
    setEditingEmployeeNumber(emp.employee_number);
    setEditForm({
      employee_number: emp.employee_number,
      branch_number: emp.branch_number,
      dept_number: emp.dept_number,
      role_number: emp.role_number,
      name: emp.name,
      surname: emp.surname,
      birth_date: emp.birth_date.slice(0, 10),
      salary: emp.salary,
    });
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingEmployeeNumber(null);
    setEditForm({
      employee_number: '',
      branch_number: '',
      dept_number: '',
      role_number: '',
      name: '',
      surname: '',
      birth_date: '',
      salary: '',
    });
    setMessage(null);
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    for (const field of ['employee_number', 'branch_number', 'dept_number', 'role_number', 'name', 'surname', 'birth_date', 'salary']) {
      if (!editForm[field]) {
        setMessage({ type: 'error', text: `Field "${field}" is required.` });
        return;
      }
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: editForm.employee_number,
          branch_number: Number(editForm.branch_number),
          dept_number: Number(editForm.dept_number),
          role_number: Number(editForm.role_number),
          name: editForm.name,
          surname: editForm.surname,
          birth_date: editForm.birth_date,
          salary: Number(editForm.salary),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update employee');

      setEmployees(prev =>
        prev.map(emp =>
          emp.employee_number === editForm.employee_number ? { ...emp, ...editForm, salary: Number(editForm.salary) } : emp
        )
      );
      setFilteredEmployees(prev =>
        prev.map(emp =>
          emp.employee_number === editForm.employee_number ? { ...emp, ...editForm, salary: Number(editForm.salary) } : emp
        )
      );
      setMessage({ type: 'success', text: data.message || 'Employee updated successfully' });
      cancelEdit();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const deleteEmployee = async employee_number => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const res = await fetch(`/api/employees?employee_number=${employee_number}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete employee (Still in hierarchy?)');

      setEmployees(prev => prev.filter(emp => emp.employee_number !== employee_number));
      setFilteredEmployees(prev => prev.filter(emp => emp.employee_number !== employee_number));
      setMessage({ type: 'success', text: data.message || 'Employee deleted successfully' });

      if (editingEmployeeNumber === employee_number) cancelEdit();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Hierarchy management functions
  const addSubordinate = async (managerId, subordinateId) => {
    try {
      const res = await fetch('/api/hierarchy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: subordinateId,
          manager_id: managerId,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add subordinate');
      }
      
      const hierarchyRes = await fetch('/api/hierarchy');
      if (hierarchyRes.ok) {
        const data = await hierarchyRes.json();
        setHierarchyData(data);
        
        const subMap = {};
        data.forEach(({ manager_id, employee_id }) => {
          if (!subMap[manager_id]) {
            subMap[manager_id] = [];
          }
          subMap[manager_id].push(employee_id);
        });
        setSubordinates(subMap);
      }
      
      setMessage({ type: 'success', text: 'Subordinate added successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const removeSubordinate = async (managerId, subordinateId) => {
    try {
      const res = await fetch('/api/hierarchy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: subordinateId,
          manager_id: managerId,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove subordinate');
      }
      
      const hierarchyRes = await fetch('/api/hierarchy');
      if (hierarchyRes.ok) {
        const data = await hierarchyRes.json();
        setHierarchyData(data);
        
        const subMap = {};
        data.forEach(({ manager_id, employee_id }) => {
            if (!subMap[manager_id]) {
                subMap[manager_id] = [];
            }
            subMap[manager_id].push(employee_id);
        });
        setSubordinates(subMap);
      }
      
      setMessage({ type: 'success', text: 'Subordinate removed successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.branch_id === branchId);
    return branch ? branch.name : 'Unknown';
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.dept_id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.role_id === roleId);
    return role ? role.name : 'Unknown';
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.employee_number === empId);
    return emp ? `${emp.name} ${emp.surname}` : `Employee ${empId}`;
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Manage Employees
      </h1>

      {message && (
        <div
          className={`p-3 mb-4 rounded-md text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">
          Search by Employee Number or Name
        </label>
        <input
          id="search"
          type="text"
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter and Clear Filter Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          type="button"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()})`}
        </button>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            type="button"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <h3 className="text-xl font-semibold text-gray-700 col-span-full mb-4">Filter Options</h3>
          
          {/* Branch Filter */}
          <div>
            <label htmlFor="filter-branch" className="block text-gray-700 text-sm font-bold mb-2">Branch</label>
            <select
              id="filter-branch"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.branch}
              onChange={e => handleFilterChange('branch', e.target.value)}
              disabled={loadingDropdowns}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label htmlFor="filter-department" className="block text-gray-700 text-sm font-bold mb-2">Department</label>
            <select
              id="filter-department"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.department}
              onChange={e => handleFilterChange('department', e.target.value)}
              disabled={loadingDropdowns}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="filter-role" className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <select
              id="filter-role"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={e => handleFilterChange('role', e.target.value)}
              disabled={loadingDropdowns}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Range Filter */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">Salary Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min salary"
                value={filters.salaryMin}
                onChange={e => handleFilterChange('salaryMin', e.target.value)}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="number"
                className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Max salary"
                value={filters.salaryMax}
                onChange={e => handleFilterChange('salaryMax', e.target.value)}
              />
            </div>
          </div>

          {/* Birth Date Range Filter */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-gray-700 text-sm font-bold mb-2">Birth Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.birthDateFrom}
                onChange={e => handleFilterChange('birthDateFrom', e.target.value)}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.birthDateTo}
                onChange={e => handleFilterChange('birthDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="text-gray-600 mb-4">
        <p>Showing {filteredEmployees.length} of {employees.length} employees</p>
      </div>

      {loading ? (
        <p className="text-center text-blue-500 text-lg">Loading employees...</p>
      ) : filteredEmployees.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No employees found matching your criteria.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birth Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manages
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(emp => (
                <React.Fragment key={emp.employee_number}>
                  {editingEmployeeNumber === emp.employee_number ? (
                    <tr className="bg-blue-50 hover:bg-blue-100">
                      <td colSpan="9" className="p-4">
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Employee Number - Read Only */}
                            <div>
                              <label htmlFor={`edit-employee_number-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Employee Number</label>
                              <input
                                id={`edit-employee_number-${emp.employee_number}`}
                                type="text"
                                name="employee_number"
                                value={editForm.employee_number}
                                readOnly
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-100"
                                title="Employee Number (cannot be changed)"
                              />
                            </div>

                            {/* Branch */}
                            <div>
                              <label htmlFor={`edit-branch_number-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Branch</label>
                              <select
                                id={`edit-branch_number-${emp.employee_number}`}
                                name="branch_number"
                                value={editForm.branch_number}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                disabled={loadingDropdowns}
                              >
                                <option value="">Select branch...</option>
                                {branches.map(branch => (
                                  <option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Department */}
                            <div>
                              <label htmlFor={`edit-dept_number-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Department</label>
                              <select
                                id={`edit-dept_number-${emp.employee_number}`}
                                name="dept_number"
                                value={editForm.dept_number}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                disabled={loadingDropdowns}
                              >
                                <option value="">Select department...</option>
                                {departments.map(dept => (
                                  <option key={dept.dept_id} value={dept.dept_id}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Role */}
                            <div>
                              <label htmlFor={`edit-role_number-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Role</label>
                              <select
                                id={`edit-role_number-${emp.employee_number}`}
                                name="role_number"
                                value={editForm.role_number}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                disabled={loadingDropdowns}
                              >
                                <option value="">Select role...</option>
                                {roles.map(role => (
                                  <option key={role.role_id} value={role.role_id}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Name */}
                            <div>
                              <label htmlFor={`edit-name-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Name</label>
                              <input
                                id={`edit-name-${emp.employee_number}`}
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Name"
                              />
                            </div>

                            {/* Surname */}
                            <div>
                              <label htmlFor={`edit-surname-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Surname</label>
                              <input
                                id={`edit-surname-${emp.employee_number}`}
                                type="text"
                                name="surname"
                                value={editForm.surname}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Surname"
                              />
                            </div>

                            {/* Birth Date */}
                            <div>
                              <label htmlFor={`edit-birth_date-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Birth Date</label>
                              <input
                                id={`edit-birth_date-${emp.employee_number}`}
                                type="date"
                                name="birth_date"
                                value={editForm.birth_date}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                            </div>

                            {/* Salary */}
                            <div>
                              <label htmlFor={`edit-salary-${emp.employee_number}`} className="block text-sm font-medium text-gray-700">Salary</label>
                              <input
                                id={`edit-salary-${emp.employee_number}`}
                                type="number"
                                step="0.01"
                                name="salary"
                                value={editForm.salary}
                                onChange={handleEditChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Salary"
                              />
                            </div>
                          </div>

                          {/* Hierarchy Management Section */}
                          <div className="mt-6 p-4 border border-gray-200 rounded-md bg-white">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">Manages</h4>
                            <div className="space-y-2">
                              {(subordinates[emp.employee_number] || []).length > 0 ? (
                                subordinates[emp.employee_number].map(subId => (
                                  <div key={subId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <span className="text-gray-700">#{subId} - {getEmployeeName(subId)}</span>
                                    <button
                                      type="button"
                                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                                      onClick={() => removeSubordinate(emp.employee_number, subId)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 italic">No direct reports</p>
                              )}
                            </div>
                            <div className="mt-4">
                              <SearchableDropdown
                                options={availableEmployees}
                                onSelect={(employeeId) => addSubordinate(emp.employee_number, employeeId)}
                                placeholder="Search and add employee to report to this person..."
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr className="even:bg-gray-50 hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {emp.employee_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {emp.name} {emp.surname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getBranchName(emp.branch_number)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDepartmentName(emp.dept_number)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRoleName(emp.role_number)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${emp.salary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(emp.birth_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subordinates[emp.employee_number] && subordinates[emp.employee_number].length > 0 ? (
                          <span>
                            {subordinates[emp.employee_number].length} employee{subordinates[emp.employee_number].length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEdit(emp)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp.employee_number)}
                          className="text-red-600 hover:text-red-900"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
