'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
//  // Will be removed after Tailwind conversion
import { FaSearch, FaRedo, FaExpandArrowsAlt, FaCompressArrowsAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import Image from 'next/image';

// Moved outside to avoid re-creation in render, and ensuring it runs client-side
// Crypto module is not available in client-side environment for this exact usage in Next.js 13+ unless polyfilled or bundled correctly.
// For Gravatar, often the hash is computed on the server.
// For now, removing the direct crypto usage here and relying on default or pre-fetched gravatar URLs.
// async function sha256(str) {
//   const buf = await crypto.subtle.digest(
//     'SHA-256',
//     new TextEncoder().encode(str.trim().toLowerCase())
//   );
//   return Array.from(new Uint8Array(buf))
//     .map(x => x.toString(16).padStart(2, '0'))
//     .join('');
// }

// async function getGravatarUrl(email, size = 80, defaultImage = 'identicon') {
//   if (!email) return '/public/images/default-avatar.png'; // Fallback to default local image
//   // If we can't reliably hash client-side, return a generic gravatar or default image.
//   // In a real app, this hash might come from the server or be pre-computed.
//   // For now, returning generic gravatar if no hash can be computed safely client-side in all environments.
//   // return `https://0.gravatar.com/avatar/${await sha256(email)}?s=${size}&d=${encodeURIComponent(defaultImage)}`;
//   return `https://www.gravatar.com/avatar/?d=mp&s=${size}`; // Generic Gravatar placeholder
// }

export default function EmployeeTree() {
  const canvasRef = useRef(null);
  const [treeData, setTreeData] = useState(null);
  const gravatarsRef = useRef({}); // Store Image objects for canvas drawing
  const [employeeData, setEmployeeData] = useState({});
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [showUnassignedDropdown, setShowUnassignedDropdown] = useState(false);
  const [draggingUnassigned, setDraggingUnassigned] = useState(null);

  const [isOverTrash, setIsOverTrash] = useState(false);

  // Memoize colors to prevent re-creation on every render
  const colors = useMemo(() => ({
    dark: {
      nodeBg: 'var(--color-surface)',
      nodeHover: 'var(--color-accent)',
      borderColor: 'var(--color-text-secondary)',
      dragNodeBg: 'var(--color-secondary)',
      dropTargetBg: 'var(--color-primary)',
      textColor: 'var(--color-text-default)',
      shadowColor: 'rgba(0, 0, 0, 0.5)'
    },
    light: {
      nodeBg: 'var(--color-surface)',
      nodeHover: 'var(--color-accent)',
      borderColor: 'var(--color-text-secondary)',
      dragNodeBg: 'var(--color-secondary)',
      dropTargetBg: 'var(--color-primary)',
      textColor: 'var(--color-text-default)',
      shadowColor: 'rgba(0, 0, 0, 0.2)'
    }
  }), []);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(
        window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    };
    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // Memoize handleWheel function
  const handleWheel = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const contentMouseX = (mouseX - position.x) / scale;
    const contentMouseY = (mouseY - position.y) / scale;

    const zoomSpeed = 0.001;
    const delta = -e.deltaY * zoomSpeed;
    const newScale = Math.min(Math.max(scale + delta, 0.10), 3);

    const newX = mouseX - contentMouseX * newScale;
    const newY = mouseY - contentMouseY * newScale;

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  }, [scale, position]);

  // Add wheel event listener to prevent page scrolling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventPageScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      handleWheel(e);
    };

    canvas.addEventListener('wheel', preventPageScroll, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', preventPageScroll);
    };
  }, [handleWheel]);

  useEffect(() => {
    async function fetchUnassignedEmployees() {
      try {
        const response = await fetch('/api/not_assigned');
        const data = await response.json();
        setUnassignedEmployees(data);
      } catch (err) {
        console.error('Error fetching unassigned employees:', err);
      }
    }
    
    fetchUnassignedEmployees();
  }, []);

  const handleUnassignedDragStart = (employee) => {
    setDraggingUnassigned(employee);
    setIsDraggingNode(true);
    setDraggedNode({
      employee_number: employee.employee_number,
      name: `${employee.name} ${employee.surname}`,
      title: employee.role_name || 'Unknown Role', // Assuming role_name might be part of employee
      data: employee,
      children: [],
      width: 350,
      height: 400
    });
    setShowUnassignedDropdown(false);
  };

  const findNode = (tree, term) => {
    if (!tree) return null;
    
    term = term.toLowerCase();
    
    if (tree.employee_number.toLowerCase().includes(term) ||
        tree.name.toLowerCase().includes(term)) {
      return tree;
    }
    
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNode(child, term);
        if (found) return found;
      }
    }
    
    return null;
  };

  const ExpandParents = async (node) => {
    if (!node || !canvasRef.current || !treeData) return;

    const expandParents = (nodeId, tree) => {
      const findParent = (currentNode) => {
        if (currentNode.children) {
          for (const child of currentNode.children) {
            if (child.employee_number === nodeId) {
              return currentNode;
            }
            const found = findParent(child);
            if (found) return found;
          }
        }
        return null;
      };

      const parent = findParent(tree);
      if (parent) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          newSet.add(parent.employee_number);
          return newSet;
        });
        expandParents(parent.employee_number, tree);
      }
    };

    expandParents(node.employee_number, treeData);
  };

  const handleRemoveFromHierarchy = async (employeeId) => {
    try {
      setIsUpdating(true);
      
      // Find the current manager of the employee
      const currentManager = findCurrentManager(employeeId, treeData);
      
      if (currentManager) {
        const response = await fetch('/api/hierarchy', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employeeId,
            manager_id: currentManager
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove from hierarchy');
        }
        
        // Refresh the tree data
        await refreshTreeData();
        await fetchUnassignedEmployees(); // Update unassigned list
      }
    } catch (error) {
      console.error('Error removing from hierarchy:', error);
      alert(`Failed to remove from hierarchy: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const [foundNode, setFoundNode] = useState(null);

  // Update hierarchy in database
  const updateHierarchy = async (employeeId, newManagerId, oldManagerId) => {
    try {
      setIsUpdating(true);
      
      // First, remove the old relationship if it exists
      if (oldManagerId) {
        const response = await fetch('/api/hierarchy', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employeeId,
            manager_id: oldManagerId
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove old hierarchy relationship');
        }
      }
      
      // Then add the new relationship
      if (newManagerId && newManagerId !== 'root') {
        const response = await fetch('/api/hierarchy', {
          method: 'POST', // Changed to POST for adding new relationship
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employeeId,
            manager_id: newManagerId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes('circular')) {
            alert('Cannot set manager to a subordinate or self.');
            return;
          }
          throw new Error(errorData.error || 'Failed to update hierarchy');
        }
      }
      
      // Refresh the tree data
      await refreshTreeData();
      await fetchUnassignedEmployees(); // Update unassigned list
      
    } catch (error) {
      console.error('Error updating hierarchy:', error);
      alert(`Failed to update hierarchy: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to refresh tree data after hierarchy changes
  const refreshTreeData = async () => {
    try {
      const [hierarchyRes, employeesWithDetails] = await Promise.all([
        fetch('/api/hierarchy'),
        fetchEmployeeData() // Refetch detailed employee data
      ]);
      
      const hierarchyData = await hierarchyRes.json();
      const tree = buildTree(hierarchyData, employeesWithDetails);
      setTreeData(tree);
      
    } catch (err) {
      console.error('Error refreshing tree data:', err);
    }
  };

  // Find the current manager of a node
  const findCurrentManager = (nodeId, tree) => {
    const findParent = (currentNode) => {
      if (currentNode.children) {
        for (const child of currentNode.children) {
          if (child.employee_number === nodeId) {
            return currentNode.employee_number === 'root' ? null : currentNode.employee_number;
          }
          const found = findParent(child);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };

    return findParent(tree);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !treeData) return;
    
    const node = findNode(treeData, searchTerm.trim());
    if (node) {
      setFoundNode(node);
      await ExpandParents(node);
    } else {
      alert('No employee found matching your search');
      setFoundNode(null);
    }
  };

  const centerFoundNode = () => {
    if (!foundNode || !canvasRef.current) return;
    
    const { nodes } = calculatePositions(treeData);
    const nodeToCenter = nodes.find(n => n.employee_number === foundNode.employee_number);
    
    if (nodeToCenter) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      const targetScale = Math.min(
        1.5,
        Math.max(
          0.5,
          Math.min(
            rect.width / (nodeToCenter.width * 1.5),
            rect.height / (nodeToCenter.height * 2)
          )
        )
      );
      
      const centerX = rect.width / 2 - nodeToCenter.x * targetScale;
      const centerY = rect.height / 3 - nodeToCenter.y * targetScale;
      
      setScale(targetScale);
      setPosition({ x: centerX, y: centerY });
      setHoveredNode(foundNode.employee_number);
      setTimeout(() => setHoveredNode(null), 2000);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const [employeesRes, rolesRes, branchesRes, departmentsRes, usersRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/roles'),
        fetch('/api/branches'),
        fetch('/api/departments'),
        fetch('/api/users')
      ]);

      const employees = await employeesRes.json();
      const roles = await rolesRes.json();
      const branches = await branchesRes.json();
      const departments = await departmentsRes.json();
      const users = await usersRes.json();

      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.role_id] = role.name || `Role ${role.role_id}`;
      });

      const branchMap = {};
      branches.forEach(branch => {
        branchMap[branch.branch_id] = branch.name || `Branch ${branch.branch_number}`;
      });

      const departmentMap = {};
      departments.forEach(dept => {
        departmentMap[dept.dept_id] = dept.name || `Unknown Department`; // Corrected field
      });

      const userMap = {};
      users.forEach(user => {
        userMap[user.employee_number] = user.email || '';
      });

      const employeeMap = {};
      
      await Promise.all(
        employees.map(async (emp) => {
          const email = userMap[emp.employee_number] || '';
          // Using a simple generic gravatar for client-side drawing
          const gravatarUrl = email ? `https://www.gravatar.com/avatar/${btoa(email)}?d=mp&s=80` : '/public/images/default-avatar.png';

          const img = new Image();
          img.src = gravatarUrl;
          gravatarsRef.current[emp.employee_number] = img;

          employeeMap[emp.employee_number] = {
            ...emp,
            role_name: roleMap[emp.role_number] || 'Unknown Role',
            branch_name: branchMap[emp.branch_number] || 'Unknown Branch',
            dept_name: departmentMap[emp.dept_number] || 'Unknown Department',
            email: email || 'No email',
            gravatarUrl,
          };
        })
      );

      setEmployeeData(employeeMap);
      return employeeMap;
    } catch (err) {
      console.error('Error fetching employee data:', err);
      return {};
    }
  };

  function buildTree(hierarchyData, employeeMap) {
    const rootNode = {
      employee_number: 'root',
      name: 'Organization',
      title: 'Root Level',
      data: {},
      children: []
    };

    if (!hierarchyData || hierarchyData.length === 0) {
      // If no hierarchy data, consider all employees as potential top-level
      const allEmployeeNumbers = Object.keys(employeeMap);
      allEmployeeNumbers.forEach(empId => {
        const emp = employeeMap[empId];
        rootNode.children.push({
          employee_number: empId,
          name: emp.name ? `${emp.name} ${emp.surname}` : `Employee ${empId}`,
          title: emp.role_name || 'Unknown Role',
          data: emp,
          children: [],
        });
      });
      return rootNode;
    }

    const nodes = {};
    const hasManager = new Set();

    // Initialize all employees as nodes
    Object.keys(employeeMap).forEach(empId => {
      const emp = employeeMap[empId];
      nodes[empId] = {
        employee_number: empId,
        name: emp.name ? `${emp.name} ${emp.surname}` : `Employee ${empId}`,
        title: emp.role_name || 'Unknown Role',
        data: emp,
        children: [],
      };
    });

    // Build relationships
    hierarchyData.forEach(({ manager_id: managerId, employee_id: subordinateId }) => {
      // Ensure manager node exists (it should if employeeMap is complete)
      if (!nodes[managerId]) {
        const empData = employeeMap[managerId] || {};
        nodes[managerId] = {
          employee_number: managerId,
          name: empData.name ? `${empData.name} ${empData.surname}` : `Employee ${managerId}`,
          title: empData.role_name || 'Unknown Role',
          data: empData,
          children: [],
        };
      }
      
      // Add subordinate to manager's children
      if (nodes[managerId] && nodes[subordinateId]) {
        nodes[managerId].children.push(nodes[subordinateId]);
        hasManager.add(subordinateId);
      }
    });

    // Find true root(s) (employees without a manager in the hierarchy)
    const trueRoots = Object.keys(nodes)
      .filter(empId => !hasManager.has(empId))
      .map(empId => nodes[empId]);

    if (trueRoots.length > 0) {
      rootNode.children = trueRoots;
    }

    return rootNode;
  }

  useEffect(() => {
    async function initTreeData() {
      try {
        const employeesWithDetails = await fetchEmployeeData();
        const hierarchyRes = await fetch('/api/hierarchy');
        
        const hierarchyData = await hierarchyRes.json();
        const tree = buildTree(hierarchyData, employeesWithDetails);
        setTreeData(tree);
        
        // Expand all nodes by default
        const allNodes = new Set();
        const collectNodes = (node) => {
          if (node) {
            allNodes.add(node.employee_number);
            if (node.children) {
              node.children.forEach(collectNodes);
            }
          }
        };
        collectNodes(tree);
        setExpandedNodes(allNodes);
        
      } catch (err) {
        console.error('Error fetching initial tree data:', err);
        setTreeData(null);
      }
    }
    initTreeData();
  }, []); // Run once on mount

  // Memoize calculatePositions function to prevent recreation
  const calculatePositions = useCallback((tree) => {
    if (!tree) return { nodes: [], connections: [] };

    const nodes = [];
    const connections = [];
    const nodeWidth = 350;
    const nodeHeight = 400;
    const levelHeight = 750;

    const calculateSubtreeWidth = (node) => {
      if (!node.children || node.children.length === 0 || !expandedNodes.has(node.employee_number)) {
        return nodeWidth;
      }
      
      // Calculate width considering children and spacing
      let currentChildrenWidth = 0;
      node.children.forEach(child => {
        currentChildrenWidth += calculateSubtreeWidth(child);
      });

      const spacing = (node.children.length - 1) * 20; // Minimal spacing between nodes
      return Math.max(nodeWidth, currentChildrenWidth + spacing);
    };

    const positionNodes = (node, x, y, level = 0) => {
      const nodeId = node.employee_number;
      
      nodes.push({
        ...node,
        x: x,
        y: y,
        level: level,
        width: nodeWidth,
        height: nodeHeight,
        expanded: expandedNodes.has(nodeId),
        hasChildren: node.children && node.children.length > 0
      });

      if (node.children && node.children.length > 0 && expandedNodes.has(nodeId)) {
        const childY = y + levelHeight;
        
        const totalChildrenWidth = node.children.reduce((total, child) => {
          return total + calculateSubtreeWidth(child);
        }, 0);
        
        const spacingPerGap = 40; // Spacing between children groups
        let currentX = x - (totalChildrenWidth + (node.children.length - 1) * spacingPerGap) / 2 + nodeWidth / 2;

        node.children.forEach((child, index) => {
          const childSubtreeWidth = calculateSubtreeWidth(child);
          const childCenterX = currentX + childSubtreeWidth / 2;
          
          connections.push({
            parentX: x,
            parentY: y,
            childX: childCenterX,
            childY: childY,
            parentId: nodeId,
            childId: child.employee_number
          });

          positionNodes(child, childCenterX, childY, level + 1);
          currentX += childSubtreeWidth + spacingPerGap;
        });
      }
    };
    
    // Start positioning from the root
    positionNodes(tree, 0, 0);
    return { nodes, connections };
  }, [expandedNodes, employeeData]);

  useEffect(() => {
    if (treeData && canvasRef.current) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = 100;
        
        setPosition({ x: centerX, y: centerY });
      }, 100);
    }
  }, [treeData, expandedNodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !treeData) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);

    const themeColors = isDarkMode ? colors.dark : colors.light; 

    ctx.clearRect(-position.x/scale, -position.y/scale, rect.width/scale, rect.height/scale); // Clear the canvas

    const { nodes, connections } = calculatePositions(treeData);

    // Draw connections
    ctx.strokeStyle = themeColors.borderColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    connections.forEach(conn => {
      const startX = conn.parentX;
      const startY = conn.parentY + 50; // Offset from bottom of parent node
      const endX = conn.childX;
      const endY = conn.childY - 50; // Offset from top of child node
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Draw a vertical line from parent to control point
      ctx.lineTo(startX, startY + (endY - startY) / 2);
      // Draw a horizontal line from control point to child control point
      ctx.lineTo(endX, startY + (endY - startY) / 2);
      // Draw a vertical line from child control point to child
      ctx.lineTo(endX, endY);
      
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Skip drawing the dragged node at its original position
      if (draggedNode && node.employee_number === draggedNode.employee_number && isDraggingNode) {
        return;
      }

      const isHovered = hoveredNode === node.employee_number;
      const isDropTarget = dropTarget === node.employee_number;
      const nodeX = node.x - node.width / 2;
      const nodeY = node.y - node.height / 2;

      // Node background
      let bgColor = themeColors.nodeBg;
      if (isDropTarget) {
        bgColor = themeColors.dropTargetBg;
      } else if (isHovered) {
        bgColor = themeColors.nodeHover;
      }
      
      ctx.fillStyle = bgColor;
      ctx.shadowColor = themeColors.shadowColor;
      ctx.shadowBlur = isHovered || isDropTarget ? 12 : 6;
      ctx.shadowOffsetY = isHovered || isDropTarget ? 6 : 3;
      
      const radius = 12; // Increased radius for softer corners
      ctx.beginPath();
      ctx.roundRect(nodeX, nodeY, node.width, node.height, radius);
      ctx.fill();
      
      if (isDropTarget) {
        ctx.strokeStyle = themeColors.dropTargetBg; // Highlight border
        ctx.lineWidth = 6;
        ctx.stroke();
      } else if (isHovered) {
        ctx.strokeStyle = themeColors.nodeHover; // Highlight border
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        ctx.strokeStyle = themeColors.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      ctx.shadowColor = 'transparent'; // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      const imgSize = 200;
      const imgY = node.y - node.height / 2 + 60; // Position below top edge

      // Load gravatar image from cache or create new one
      let gravatarImg = gravatarsRef.current[node.employee_number];
      if (!gravatarImg) {
        gravatarImg = new Image();
        gravatarImg.src = employeeData[node.employee_number]?.gravatarUrl || '/public/images/default-avatar.png';
        gravatarsRef.current[node.employee_number] = gravatarImg;
      }

      // Draw image if loaded
      if (gravatarImg && gravatarImg.complete && gravatarImg.naturalWidth !== 0) {
        const imgX = node.x - imgSize / 2;
        ctx.drawImage(gravatarImg, imgX, imgY, imgSize, imgSize);
      } else {
        // Fallback: draw a colored circle or a placeholder if image not loaded
        ctx.fillStyle = isDarkMode ? '#555' : '#ccc';
        ctx.beginPath();
        ctx.arc(node.x, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = themeColors.textColor;
      ctx.textAlign = 'center';

      // Employee Number
      ctx.font = '400 30px var(--font-geist-sans)';
      ctx.globalAlpha = 0.7;
      ctx.fillText(node.employee_number, node.x, imgY - 15);
      ctx.globalAlpha = 1;

      // Employee Name
      ctx.font = '600 40px var(--font-geist-sans)';
      const displayName = node.name.length > 25 ? node.name.substring(0, 22) + '...' : node.name;
      ctx.fillText(displayName, node.x, imgY + imgSize + 50);

      // Employee Title/Role
      ctx.font = '400 28px var(--font-geist-sans)';
      ctx.globalAlpha = 0.8;
      ctx.fillText(node.title, node.x, imgY + imgSize + 90);
      ctx.globalAlpha = 1;

      // Expand/Collapse Indicator
      if (node.hasChildren) {
        ctx.fillStyle = themeColors.textColor;
        ctx.font = '30px var(--font-geist-sans)';
        ctx.fillText(node.expanded ? '▼' : '▶', node.x, node.y + node.height / 2 - 20); // Centered bottom
      }
    });

    ctx.restore();

    // Draw dragged node (on top of everything)
    if (draggedNode && isDraggingNode) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      ctx.save();
      ctx.globalAlpha = 0.8;
      
      const mouseCanvasX = lastMouse.x - rect.left;
      const mouseCanvasY = lastMouse.y - rect.top;
      
      const scaleFactor = 0.4; // Smaller scale for dragged node
      const nodeWidth = draggedNode.width * scaleFactor;
      const nodeHeight = draggedNode.height * scaleFactor;
      
      const nodeX = mouseCanvasX - dragOffset.x * scaleFactor - nodeWidth / 2;
      const nodeY = mouseCanvasY - dragOffset.y * scaleFactor - nodeHeight / 2;

      // Draw dragged node with accent background
      ctx.fillStyle = themeColors.dragNodeBg;
      ctx.shadowColor = themeColors.shadowColor;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      
      const radius = 10;
      ctx.beginPath();
      ctx.roundRect(nodeX, nodeY, nodeWidth, nodeHeight, radius);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Scaled image
      const imgSize = 200 * scaleFactor;
      const imgY = nodeY + 60 * scaleFactor;

      let gravatarImg = gravatarsRef.current[draggedNode.employee_number];
      if (!gravatarImg) { // Fallback if not in ref
        gravatarImg = new Image();
        gravatarImg.src = employeeData[draggedNode.employee_number]?.gravatarUrl || '/public/images/default-avatar.png';
        gravatarsRef.current[draggedNode.employee_number] = gravatarImg;
      }

      if (gravatarImg && gravatarImg.complete && gravatarImg.naturalWidth !== 0) {
        const imgX = nodeX + nodeWidth / 2 - imgSize / 2;
        ctx.drawImage(gravatarImg, imgX, imgY, imgSize, imgSize);
      } else {
         // Fallback: draw a colored circle or a placeholder if image not loaded
        ctx.fillStyle = isDarkMode ? '#666' : '#eee';
        ctx.beginPath();
        ctx.arc(nodeX + nodeWidth / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = themeColors.textColor;
      ctx.textAlign = 'center';
      const centerX = nodeX + nodeWidth / 2;

      ctx.font = `400 ${25 * scaleFactor}px var(--font-geist-sans)`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(draggedNode.employee_number, centerX, imgY - 10 * scaleFactor);
      ctx.globalAlpha = 0.8;

      ctx.font = `600 ${35 * scaleFactor}px var(--font-geist-sans)`;
      const displayName = draggedNode.name.length > 20 ? 
        draggedNode.name.substring(0, 17) + '...' : draggedNode.name;
      ctx.fillText(displayName, centerX, imgY + imgSize + 30 * scaleFactor);

      ctx.font = `400 ${25 * scaleFactor}px var(--font-geist-sans)`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(draggedNode.title, centerX, imgY + imgSize + 60 * scaleFactor);
      
      ctx.restore();
    }

  }, [treeData, expandedNodes, scale, position, hoveredNode, draggedNode, isDraggingNode, dropTarget, lastMouse, dragOffset, isDarkMode, calculatePositions, colors, employeeData]);

  const getNodeAtPosition = (mouseX, mouseY) => {
    const { nodes } = calculatePositions(treeData);
    return nodes.find(node => {
      // Adjusted hitbox for interaction
      const interactiveNodeWidth = node.width;
      const interactiveNodeHeight = node.height;
      const nodeX = node.x - interactiveNodeWidth / 2;
      const nodeY = node.y - interactiveNodeHeight / 2;
      
      return mouseX >= nodeX && mouseX <= nodeX + interactiveNodeWidth &&
             mouseY >= nodeY && mouseY <= nodeY + interactiveNodeHeight;
    });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setLastMouse({ x: e.clientX, y: e.clientY });

    const mouseXInCanvas = (e.clientX - rect.left - position.x) / scale;
    const mouseYInCanvas = (e.clientY - rect.top - position.y) / scale;

    if (isDraggingNode && draggedNode) {
      // Update drop target detection
      const targetNode = getNodeAtPosition(mouseXInCanvas, mouseYInCanvas);
      
      if (targetNode && 
          targetNode.employee_number !== draggedNode.employee_number &&
          targetNode.employee_number !== 'root' &&
          !getReportingChain(draggedNode.employee_number).includes(targetNode.employee_number) && // Cannot drop on a subordinate
          findCurrentManager(draggedNode.employee_number, treeData) !== targetNode.employee_number // Cannot drop on current manager
        ) {
        setDropTarget(targetNode.employee_number);
      } else {
        setDropTarget(null);
      }

      // Detect if over trash can
      const trashRect = document.getElementById('trash-can')?.getBoundingClientRect();
      if (trashRect) {
        if (e.clientX >= trashRect.left && e.clientX <= trashRect.right &&
            e.clientY >= trashRect.top && e.clientY <= trashRect.bottom) {
          setIsOverTrash(true);
        } else {
          setIsOverTrash(false);
        }
      }
      return;
    }

    if (isDragging && !isDraggingNode) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      return;
    }

    // Regular hover detection
    const hoveredNodeData = getNodeAtPosition(mouseXInCanvas, mouseYInCanvas);
    setHoveredNode(hoveredNodeData ? hoveredNodeData.employee_number : null);
    
    if (hoveredNodeData) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handleMouseDown = (e) => {
    if (isUpdating) return; // Prevent interactions while updating

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - position.x) / scale;
    const mouseY = (e.clientY - rect.top - position.y) / scale;

    const clickedNode = getNodeAtPosition(mouseX, mouseY);

    if (clickedNode && clickedNode.employee_number !== 'root' && e.button === 0) { // Only allow left click drag for nodes
      // Start node drag
      setIsDraggingNode(true);
      setDraggedNode(clickedNode);
      
      // Calculate offset from mouse to node center
      const nodeCenterX = clickedNode.x;
      const nodeCenterY = clickedNode.y;
      const mouseCanvasX = e.clientX - rect.left;
      const mouseCanvasY = e.clientY - rect.top;
      
      setDragOffset({
        x: (mouseCanvasX - position.x) / scale - nodeCenterX,
        y: (mouseCanvasY - position.y) / scale - nodeCenterY
      });
      
      canvas.style.cursor = 'grabbing';
    } else if (e.button === 0) { // Only allow left click drag for canvas
      // Start canvas drag
      setIsDragging(true);
      canvas.style.cursor = 'grabbing';
    }

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = async (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingNode) {
      if (draggedNode && dropTarget) {
        // Execute the hierarchy change
        await updateHierarchy(
          draggedNode.employee_number, 
          dropTarget, 
          findCurrentManager(draggedNode.employee_number, treeData)
        );
      } else if (draggingUnassigned && dropTarget) {
        // Handle assigning an unassigned employee
        await updateHierarchy(
          draggingUnassigned.employee_number,
          dropTarget,
          null
        );
      } else if ((draggedNode || draggingUnassigned) && isOverTrash) {
        // Handle removing from hierarchy
        const employeeIdToRemove = draggedNode ? draggedNode.employee_number : draggingUnassigned.employee_number;
        await handleRemoveFromHierarchy(employeeIdToRemove);
      }
    }

    // Reset all drag states
    setIsDragging(false);
    setIsDraggingNode(false);
    setDraggedNode(null);
    setDraggingUnassigned(null);
    setDropTarget(null);
    setIsOverTrash(false);
    setDragOffset({ x: 0, y: 0 });
    
    canvas.style.cursor = 'default';
  };

  const handleClick = (e) => {
    if (isDragging || isDraggingNode || isUpdating) return; // Prevent interaction during drag or update

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - position.x) / scale;
    const mouseY = (e.clientY - rect.top - position.y) / scale;

    const clickedNode = getNodeAtPosition(mouseX, mouseY);

    if (clickedNode) {
      // Check if click was on image area to open details
      const imgX = clickedNode.x - 100;
      const imgY = clickedNode.y - clickedNode.height / 2 + 60;
      const imgSize = 200;
      
      const isOnImage = mouseX >= imgX && mouseX <= imgX + imgSize && 
                        mouseY >= imgY && mouseY <= imgY + imgSize;
      
      if (isOnImage) {
        setSelectedEmployee(clickedNode);
        setShowDetails(true);
        return;
      }

      // Check if click was on expand/collapse indicator
      // Approximate position of indicator for click detection
      const indicatorAreaX = clickedNode.x - 50;
      const indicatorAreaY = clickedNode.y + clickedNode.height / 2 - 80;
      const indicatorAreaWidth = 100;
      const indicatorAreaHeight = 100;
      
      const isOnIndicator = clickedNode.hasChildren &&
                            mouseX >= indicatorAreaX && mouseX <= indicatorAreaX + indicatorAreaWidth &&
                            mouseY >= indicatorAreaY && mouseY <= indicatorAreaY + indicatorAreaHeight;
      
      if (isOnIndicator) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          if (newSet.has(clickedNode.employee_number)) {
            newSet.delete(clickedNode.employee_number);
          } else {
            newSet.add(clickedNode.employee_number);
          }
          return newSet;
        });
      }
    }
  };

  const resetView = () => {
    setScale(1);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = 100;
      setPosition({ x: centerX, y: centerY });
    }
  };

  const expandAll = () => {
    const allNodes = new Set();
    const collectNodes = (node) => {
      if (node) {
        allNodes.add(node.employee_number);
        if (node.children) {
          node.children.forEach(collectNodes);
        }
      }
    };
    collectNodes(treeData);
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    // Only keep the root node expanded
    setExpandedNodes(new Set([treeData?.employee_number].filter(Boolean)));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  if (!treeData || (treeData.employee_number === 'root' && treeData.children.length === 0)) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-lg shadow-md p-8 text-gray-700">
      <p className="text-xl font-semibold mb-4">The organizational hierarchy is currently empty.</p>
      {unassignedEmployees.length > 0 && (
        <p className="text-md text-center">
          To create the hierarchy, add the first employee and assign them as a CEO
          (or to an existing root if one is implicitly defined).
          You can do this from the &quot;Add Unassigned Employee&quot; button.
        </p>
      )}
    </div>
  );
}
  return (
    <div className="flex flex-col h-full relative">
      <div className="p-4 bg-white shadow-md rounded-lg mb-4 flex flex-wrap gap-3 items-center justify-between z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or employee number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isUpdating}
          />
          <button type="submit" className="button bg-blue-600 hover:bg-blue-700 text-white" disabled={isUpdating}>
            <FaSearch className="inline-block mr-1" /> Search
          </button>
          {foundNode && (
            <button 
              type="button" 
              onClick={centerFoundNode}
              className="button bg-green-600 hover:bg-green-700 text-white"
              disabled={isUpdating}
            >
              Center
            </button>
          )}
        </form>

        <div className="relative">
          <button 
            type="button" 
            onClick={async () => {
              if (!showUnassignedDropdown) {
                await fetchUnassignedEmployees();
              }
              setShowUnassignedDropdown(!showUnassignedDropdown);
            }}
            className="button bg-purple-600 hover:bg-purple-700 text-white flex items-center"
            disabled={isUpdating}
          >
            <FaPlus className="mr-2" /> Add Unassigned Employee
          </button>
          
          {showUnassignedDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
              {unassignedEmployees.length > 0 ? (
                unassignedEmployees.map(emp => (
                  <div 
                    key={emp.employee_number}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                    draggable
                    onDragStart={() => handleUnassignedDragStart(emp)}
                    onClick={() => handleUnassignedDragStart(emp)}
                  >
                    <span className="text-gray-800">{emp.name} {emp.surname} (#{emp.employee_number})</span>
                    {/* Optionally add a visual drag handle */}
                    <span className="text-gray-400 text-xs">drag</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No unassigned employees</div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={resetView} className="button bg-gray-500 hover:bg-gray-600 text-white" disabled={isUpdating}>
            <FaRedo className="inline-block mr-1" /> Reset View
          </button>
          
          <button onClick={expandAll} className="button bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isUpdating}>
            <FaExpandArrowsAlt className="inline-block mr-1" /> Expand All
          </button>
          
          <button onClick={collapseAll} className="button bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isUpdating}>
            <FaCompressArrowsAlt className="inline-block mr-1" /> Collapse All
          </button>
        </div>

        <div className="text-gray-600 text-sm">
          Zoom: {Math.round(scale * 100)}%
        </div>

        {isUpdating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
            Updating hierarchy...
          </div>
        )}

        {isDraggingNode && (
          <div id="trash-can" 
               className={`absolute bottom-4 right-4 p-4 rounded-full shadow-lg text-white transition-colors duration-200 ${
                 isOverTrash ? 'bg-red-600' : 'bg-red-400'
               }`}
          >
            <FaTrashAlt className="text-2xl" />
          </div>
        )}
      </div>

      <div className="flex-grow relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          style={{ 
            cursor: isDraggingNode ? 'grabbing' : (isDragging ? 'grabbing' : (hoveredNode ? 'grab' : 'default')),
            pointerEvents: isUpdating ? 'none' : 'auto'
          }}
        />
      </div>

      {/* Employee Details Modal */}
      {showDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Employee Details</h3>
              <button 
                className="text-gray-500 hover:text-gray-800 text-3xl leading-none font-semibold" 
                onClick={() => setShowDetails(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modalBody text-gray-700">
              {selectedEmployee.data && Object.keys(selectedEmployee.data).length > 0 ? (
                <div className="flex flex-col items-center">
                  <Image
                    src={selectedEmployee.data.gravatarUrl || '/public/images/default-avatar.png'}
                    alt="Gravatar"
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-blue-500 mb-4"
                  />
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold mb-1">{selectedEmployee.data.name} {selectedEmployee.data.surname}</h4>
                    <p className="text-blue-600 font-medium">{selectedEmployee.data.role_name}</p>
                    <p className="text-gray-500 text-sm">Employee ID: {selectedEmployee.data.employee_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="col-span-2">
                      <button 
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${selectedEmployee.name} from the hierarchy?`)) {
                            handleRemoveFromHierarchy(selectedEmployee.employee_number);
                            setShowDetails(false);
                          }
                        }}
                        disabled={isUpdating}
                      >
                        Remove from Hierarchy
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="font-semibold">Branch:</span>
                      <span className="ml-2">{selectedEmployee.data.branch_name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="font-semibold">Department:</span>
                      <span className="ml-2">{selectedEmployee.data.dept_name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="font-semibold">Email:</span>
                      <span className="ml-2">{selectedEmployee.data.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="font-semibold">Birth Date:</span>
                      <span className="ml-2">
                        {selectedEmployee.data.birth_date ? formatDate(selectedEmployee.data.birth_date) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="font-semibold">Salary:</span>
                      <span className="ml-2">
                        {selectedEmployee.data.salary ? formatCurrency(selectedEmployee.data.salary) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4">No detailed information available for this employee.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
