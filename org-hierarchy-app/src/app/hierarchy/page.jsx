'use client';

import { useState, useEffect } from 'react';

export default function HierarchyPage() {
  const [employees, setEmployees] = useState([]);
  const [reportingLines, setReportingLines] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const employeesRes = await fetch('/api/employees');
      const employeesData = await employeesRes.json();
      setEmployees(employeesData);

      const reportingLinesRes = await fetch('/api/hierarchy');
      const reportingLinesData = await reportingLinesRes.json();
      setReportingLines(reportingLinesData);
    }
    fetchData();
  }, []);

  const buildHierarchy = () => {
    const employeeMap = new Map(employees.map(e => [e.employee_number, { ...e, children: [] }]));
    const rootEmployees = [];

    reportingLines.forEach(({ employee_id, manager_id }) => {
      const employee = employeeMap.get(employee_id);
      const manager = employeeMap.get(manager_id);
      if (manager) {
        manager.children.push(employee);
      }
    });

    employees.forEach(employee => {
        const hasManager = reportingLines.some(rl => rl.employee_id === employee.employee_number);
        if (!hasManager) {
            rootEmployees.push(employeeMap.get(employee.employee_number));
        }
    });


    return rootEmployees;
  };

  const renderHierarchy = (nodes) => {
    return (
      <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
        {nodes.map(node => (
          <li key={node.employee_number}>
            <div style={{ border: '1px solid black', padding: '10px', margin: '5px' }}>
              <p><strong>{node.name} {node.surname}</strong></p>
              <p>{node.employee_number}</p>
            </div>
            {node.children.length > 0 && renderHierarchy(node.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1>Employee Hierarchy</h1>
      {renderHierarchy(buildHierarchy())}
    </div>
  );
}
