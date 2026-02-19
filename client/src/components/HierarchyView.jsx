import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  TextField,
  Divider,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { useDrop, useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { hierarchy, tree } from 'd3-hierarchy';
import { 
  ZoomIn, 
  ZoomOut, 
  FitScreen, 
  Search, 
  Clear,
  Edit as EditIcon,
  AccountTree as HierarchyIcon,
  Info as InfoIcon,
  Badge as BadgeIcon,
  Payments as SalaryIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  KeyboardArrowDown
} from '@mui/icons-material';
import md5 from 'blueimp-md5';
import { employeeApi, handleApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmployeeForm from './EmployeeForm';

// ok staff card in the tree
function StaffNode({ emp, onDrop, onSelect, pos, canDrag, canDrop, isSelected }) {
  const isVirtual = emp.id === 'virtual-root';

  const [{ dragging }, drag] = useDrag(() => ({
    type: 'staff',
    item: { id: emp.id, name: emp.name },
    canDrag: () => canDrag && !isVirtual,
    collect: (m) => ({ dragging: m.isDragging() }),
  }));

  const [{ over }, drop] = useDrop(() => ({
    accept: 'staff',
    drop: (item) => canDrop && !isVirtual && onDrop(item.id, emp.id),
    canDrop: () => canDrop && !isVirtual,
    collect: (m) => ({ over: m.isOver() && m.canDrop() }),
  }));

  const img = isVirtual ? '/assets/shield-logo.png' : `https://www.gravatar.com/avatar/${md5((emp.email || '').toLowerCase())}?s=40&d=identicon`;

  return (
    <Box
      ref={(n) => { if (canDrag && !isVirtual) drag(n); if (canDrop && !isVirtual) drop(n); }}
      onClick={(e) => { e.stopPropagation(); if (!isVirtual) onSelect(emp); }}
      sx={{
        position: 'absolute',
        left: (pos?.x || 0) - 90,
        top: (pos?.y || 0) - 30,
        opacity: dragging ? 0.4 : 1,
        border: over ? '2px dashed #D4AF37' : (isSelected ? '2px solid #D4AF37' : (isVirtual ? '3px solid #182563' : '1px solid #E2E8F0')),
        borderRadius: 2,
        p: 1.5,
        bgcolor: isVirtual ? '#F8FAFC' : 'white',
        minWidth: 200,
        cursor: (canDrag && !isVirtual) ? 'move' : (isVirtual ? 'default' : 'pointer'),
        zIndex: isSelected ? 10 : 1,
        boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.4)' : 2,
        transition: 'all 0.2s ease',
        '&:hover': { boxShadow: 4, borderColor: '#182563' }
      }}
    >
      <Box display="flex" alignItems="center">
        <Avatar src={img} sx={{ width: 36, height: 36, mr: 1.5, border: isVirtual ? 'none' : '1px solid #D4AF37', borderRadius: isVirtual ? 0 : '50%' }} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: '#182563', lineHeight: 1.2 }}>
            {emp.name} {emp.surname}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
            {emp.role}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ok main tree view component
function HierarchyView({ refreshTrigger, onNotification }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 400, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchIdx, setMatchIdx] = useState(-1);
  
  const containerRef = useRef(null);
  const zoomRef = useRef(1);

  const isAdmin = user?.permissionLevel === 'admin';
  const isHR = user?.permissionLevel === 'hr';

  // sync zoom ref
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const loadTree = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getHierarchy();
      const data = res.data;
      
      // fix: handle multiple roots (e.g. 2 CEOs or orphans) by creating a virtual root
      if (data && Array.isArray(data) && data.length > 0) {
        // if there's only 1 root, we can use it, but if multiple, we MUST wrap them
        let virtualRoot;
        if (data.length === 1) {
          virtualRoot = data[0];
        } else {
          virtualRoot = {
            id: 'virtual-root',
            name: 'EPI-USE',
            surname: 'Organization',
            role: 'Global Entity',
            email: 'info@epiuse.com',
            children: data
          };
        }

        const root = hierarchy(virtualRoot);
        const layout = tree().nodeSize([250, 180]).separation((a, b) => (a.parent === b.parent ? 1 : 1.3));
        const treeData = layout(root);
        
        // dont show the virtual root itself as a node if possible, or just let it be
        setNodes(treeData.descendants());
        setLinks(treeData.links());
      } else {
        setNodes([]);
        setLinks([]);
      }
    } catch (e) {
      onNotification(handleApiError(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  // fix: robust trackpad wheel handler
  const handleWheel = useCallback((e) => {
    if (!containerRef.current) return;
    
    // pinch zoom
    if (e.ctrlKey) {
      e.preventDefault();
      const sensitivity = 0.005;
      const nextZoom = zoomRef.current - e.deltaY * sensitivity;
      setZoom(Math.max(0.1, Math.min(3, nextZoom)));
    } else {
      // scroll pan
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  }, []);

  const jumpTo = useCallback((n) => {
    if (!n || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setPan({ 
      x: r.width / 2 - (n.x * zoomRef.current), 
      y: r.height / 2 - (n.y * zoomRef.current) 
    });
    setSelected(n.data);
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.addEventListener('wheel', handleWheel, { passive: false });
    return () => c.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    if (isPanning) {
      const onMove = (e) => setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      const onEnd = () => setIsPanning(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd); };
    }
  }, [isPanning, startPan]);

  const onSearch = (e) => {
    const t = e.target.value.toLowerCase();
    setQuery(t);
    if (!t.trim()) { setMatches([]); setMatchIdx(-1); return; }
    const hits = nodes.filter(n => 
      `${n.data.name} ${n.data.surname}`.toLowerCase().includes(t) || 
      (n.data.role && n.data.role.toLowerCase().includes(t))
    );
    setMatches(hits);
    setMatchIdx(hits.length > 0 ? 0 : -1);
    if (hits.length > 0) jumpTo(hits[0]);
  };

  useEffect(() => { loadTree(); }, [refreshTrigger]);

  if (loading) return <Box display="flex" justifyContent="center" p={10}><CircularProgress /></Box>;
  if (editing) return (
    <Box p={2}>
      <Button startIcon={<Clear />} onClick={() => setEditing(null)} sx={{ mb: 2, fontWeight: 700 }}>Back to Map</Button>
      <EmployeeForm employee={editing} onSuccess={() => { setEditing(null); loadTree(); }} onCancel={() => setEditing(null)} />
    </Box>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* toolbar */}
        <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#182563', fontWeight: 900, ml: 1 }}>VISUAL HIERARCHY</Typography>
          <Divider orientation="vertical" flexItem />
          <TextField size="small" placeholder="Locate personnel..." value={query} onChange={onSearch} sx={{ flexGrow: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
          {matches.length > 0 && (
            <Box display="flex" alignItems="center">
              <Typography variant="caption" sx={{ fontWeight: 800 }}>{matchIdx+1}/{matches.length}</Typography>
              <IconButton size="small" onClick={() => { const i = (matchIdx + 1) % matches.length; setMatchIdx(i); jumpTo(matches[i]); }}><KeyboardArrowDown /></IconButton>
            </Box>
          )}
          <Divider orientation="vertical" flexItem />
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}><ZoomOut /></IconButton>
            <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 800 }}>{Math.round(zoom * 100)}%</Typography>
            <IconButton onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn /></IconButton>
            <Button size="small" onClick={() => { setZoom(1); setPan({ x: 400, y: 100 }); }} sx={{ ml: 1, fontWeight: 800 }}>RESET</Button>
          </Box>
        </Paper>

        <Box display="flex" gap={2} sx={{ flexGrow: 1, minHeight: 0 }}>
          {/* chart map */}
          <Paper sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', bgcolor: '#F1F5F9', cursor: isPanning ? 'grabbing' : 'grab' }} 
            ref={containerRef} onMouseDown={(e) => { if (e.button === 0) { setIsPanning(true); setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y }); } }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {links.map((l, i) => (
                  <path key={i} d={`M${l.source.x},${l.source.y} C${l.source.x},${(l.source.y+l.target.y)/2} ${l.target.x},${(l.source.y+l.target.y)/2} ${l.target.x},${l.target.y}`} 
                    fill="none" stroke="#182563" strokeOpacity={0.25} strokeWidth={2} />
                ))}
              </g>
            </svg>
            <Box sx={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
              {nodes.map(n => <StaffNode key={n.data.id} emp={n.data} onDrop={async (dragId, targetId) => {
                if (dragId === targetId) return;
                try { await employeeApi.updateManager(dragId, targetId); onNotification('reassigned ok'); loadTree(); } catch (e) { onNotification(handleApiError(e), 'error'); }
              }} onSelect={setSelected} pos={{ x: n.x, y: n.y }} canDrag={isAdmin || isHR} canDrop={isAdmin || isHR} isSelected={selected?.id === n.data.id} />)}
            </Box>
          </Paper>

          {/* info sidebar */}
          <Paper sx={{ width: 340, display: 'flex', flexDirection: 'column', boxShadow: 4, borderLeft: '4px solid #D4AF37' }}>
            <Box p={2} bgcolor="#182563">
              <Typography variant="subtitle2" sx={{ color: '#D4AF37', fontWeight: 900, letterSpacing: 1.5 }}>PERSONNEL DATA</Typography>
            </Box>
            <Box p={3} sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {selected ? (
                <Box>
                  <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Avatar src={`https://www.gravatar.com/avatar/${md5(selected.email?.toLowerCase())}?s=100&d=identicon`} 
                      sx={{ width: 100, height: 100, mb: 2, border: '4px solid #182563', boxShadow: 3 }} />
                    <Typography variant="h6" align="center" sx={{ fontWeight: 900, color: '#182563' }}>{selected.name} {selected.surname}</Typography>
                    <Chip label={selected.role} size="small" variant="outlined" sx={{ mt: 1, fontWeight: 800, color: '#182563', borderColor: '#182563' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" gap={2} mb={2.5}><BadgeIcon sx={{ color: '#182563' }} /><Box><Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>ID NUMBER</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{selected.employeeNumber}</Typography></Box></Box>
                  <Box display="flex" gap={2} mb={2.5}><PersonIcon sx={{ color: '#182563' }} /><Box><Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>EMAIL</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{selected.email}</Typography></Box></Box>
                  {(isAdmin || isHR || selected.id === user?.id) && (
                    <Box display="flex" gap={2} mb={2.5}>
                      <SalaryIcon sx={{ color: '#182563' }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>COMPENSATION</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>R{Number(selected.salary).toLocaleString()} (Yearly)</Typography>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800 }}>R{Math.round(Number(selected.salary)/12).toLocaleString()} (Monthly)</Typography>
                      </Box>
                    </Box>
                  )}
                  {(isAdmin || (isHR && selected.permissionLevel !== 'admin')) && (
                    <Button fullWidth variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(selected)} sx={{ mt: 3, py: 1.2, bgcolor: '#182563', fontWeight: 800, borderRadius: 2 }}>Update Record</Button>
                  )}
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: '100%', opacity: 0.3 }}>
                  <HierarchyIcon sx={{ fontSize: 80, mb: 2, color: '#182563' }} /><Typography variant="body2" align="center" sx={{ fontWeight: 700 }}>SELECT PERSONNEL</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </DndProvider>
  );
}

export default HierarchyView;
