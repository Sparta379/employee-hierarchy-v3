import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  PersonOutline as EmployeeIcon,
  PersonOff as InactiveIcon,
  Payments as SalaryIcon,
  Assessment as AssessmentIcon,
  Lock as LockIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import md5 from 'blueimp-md5';
import { employeeApi, authApi, handleApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmployeeForm from './EmployeeForm';

// ok this component shows the big list of everyone
function EmployeeList({ refreshTrigger, onNotification, onRefresh }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(null);
  const [delDlg, setDelDlg] = useState({ open: false, target: null });
  const [resetDlg, setResetDlg] = useState({ open: false, target: null });
  
  // filters for the dashboard
  const [permFilter, setPermFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    hr: 0,
    managers: 0,
    employees: 0,
    inactive: 0,
    avgSalary: 0,
    totalBudget: 0
  });

  const isAdmin = user?.permissionLevel === 'admin';
  const isHR = user?.permissionLevel === 'hr';
  const isManager = user?.permissionLevel === 'manager';

  const canSeeSalary = (emp) => isAdmin || isHR || emp.id === user?.id;
  
  const canEdit = (emp) => {
    if (!emp) return false;
    if (emp.id === user?.id) return true;
    if (isAdmin || isHR) return emp.permissionLevel !== 'admin';
    if (isManager) return emp.manager?.id === user?.id;
    return false;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAll({ search: searchTerm });
      const raw = res.data;
      
      // calculate dashboard numbers
      const totalSal = raw.reduce((acc, emp) => acc + Number(emp.salary || 0), 0);
      setStats({
        total: raw.length,
        admins: raw.filter(e => e.permissionLevel === 'admin').length,
        hr: raw.filter(e => e.permissionLevel === 'hr').length,
        managers: raw.filter(e => e.permissionLevel === 'manager').length,
        employees: raw.filter(e => e.permissionLevel === 'employee').length,
        inactive: raw.filter(e => !e.isActive).length,
        totalBudget: totalSal,
        avgSalary: raw.length > 0 ? totalSal / raw.length : 0
      });

      // apply chips filters
      let filtered = raw;
      if (permFilter) filtered = filtered.filter(e => e.permissionLevel === permFilter);
      if (statusFilter !== null) filtered = filtered.filter(e => e.isActive === statusFilter);
      
      // permission logic for visibility
      const visible = (() => {
        if (isAdmin || isHR) return filtered;
        if (isManager) {
          return filtered.filter(e => 
            e.id === user?.id || e.permissionLevel === 'admin' || e.permissionLevel === 'hr' ||
            e.manager?.id === user?.id || (user?.manager?.id && e.id === user.manager.id)
          );
        }
        return filtered.filter(e => 
          e.id === user?.id || e.permissionLevel === 'admin' || e.permissionLevel === 'hr' ||
          (user?.manager && (e.id === user.manager.id || e.manager?.id === user.manager.id))
        );
      })();

      setEmployees(visible);
    } catch (err) {
      onNotification(handleApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger, searchTerm, permFilter, statusFilter]);

  const resetFilters = () => {
    setPermFilter(null);
    setStatusFilter(null);
    setSearchTerm('');
  };

  const getAvatarUrl = (email) => {
    const hash = md5((email || '').trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?s=40&d=identicon`;
  };

  // ok this triggers the csv download
  const downloadRegistry = () => {
    const token = localStorage.getItem('authToken');
    const url = `/api/employees/export?token=${token}`; // browsers like a url for downloads
    
    // using a hidden link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'EpiUse_Registry.csv');
    // we need to add the auth header, so using fetch instead
    fetch('/api/employees/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const bUrl = window.URL.createObjectURL(blob);
      link.href = bUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      onNotification('registry export started');
    })
    .catch(e => onNotification('export failed', 'error'));
  };

  const columns = [
    { field: 'avatar', headerName: '', width: 60, renderCell: (p) => <Avatar src={getAvatarUrl(p.row.email)} sx={{ width: 32, height: 32, bgcolor: '#182563' }} /> },
    { field: 'employeeNumber', headerName: 'ID', width: 100, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 700, color: '#182563' }}>{p.value}</Typography> },
    { field: 'fullName', headerName: 'Name', width: 180, valueGetter: (v, row) => `${row.name} ${row.surname}` },
    { field: 'role', headerName: 'Designation', width: 160, renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 600, color: '#182563' }} /> },
    { field: 'permissionLevel', headerName: 'Clearance', width: 110, renderCell: (p) => {
        const colors = { admin: { b: '#FEE2E2', t: '#991B1B' }, hr: { b: '#FEF3C7', t: '#92400E' }, manager: { b: '#DBEAFE', t: '#1E40AF' } };
        const style = colors[p.value] || { b: '#F3F4F6', t: '#374151' };
        return <Chip label={p.value.toUpperCase()} size="small" sx={{ bgcolor: style.b, color: style.t, fontWeight: 700, fontSize: '0.65rem' }} />;
    }},
    { field: 'salaryYearly', headerName: 'Annual', width: 130, renderCell: (p) => canSeeSalary(p.row) ? `R${Number(p.row.salary).toLocaleString()}` : '********' },
    { field: 'salaryMonthly', headerName: 'Monthly', width: 130, renderCell: (p) => canSeeSalary(p.row) ? `R${Math.round(Number(p.row.salary) / 12).toLocaleString()}` : '********' },
    { field: 'isActive', headerName: 'Status', width: 90, renderCell: (p) => <Chip label={p.value ? 'ACTIVE' : 'OFF'} size="small" sx={{ bgcolor: p.value ? '#D1FAE5' : '#F3F4F6', fontWeight: 700 }} /> },
    { field: 'actions', headerName: 'Cmd', width: 180, renderCell: (p) => (
      <Box>
        {canEdit(p.row) && <IconButton size="small" onClick={() => setEditing(p.row)}><EditIcon fontSize="small" /></IconButton>}
        {isAdmin && p.row.id !== user?.id && <IconButton size="small" onClick={() => setResetDlg({ open: true, target: p.row })} sx={{ color: '#D4AF37' }}><LockIcon fontSize="small" /></IconButton>}
        {isAdmin && p.row.permissionLevel !== 'admin' && <IconButton size="small" onClick={() => {
          employeeApi.update(p.row.id, { isActive: !p.row.isActive }).then(() => { onNotification('status updated'); onRefresh(); });
        }} color={p.row.isActive ? "warning" : "success"}><InactiveIcon fontSize="small" /></IconButton>}
        {isAdmin && p.row.permissionLevel !== 'admin' && <IconButton size="small" onClick={() => setDelDlg({ open: true, target: p.row })} sx={{ color: '#CC1240' }}><DeleteIcon fontSize="small" /></IconButton>}
      </Box>
    )}
  ];

  if (editing) return (
    <Box>
      <Button startIcon={<ClearIcon />} onClick={() => setEditing(null)} sx={{ mb: 2, fontWeight: 700 }}>Back to Registry</Button>
      <EmployeeForm employee={editing} onSuccess={() => { onNotification('record updated'); setEditing(null); onRefresh(); }} onCancel={() => setEditing(null)} />
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={(isAdmin || isHR) ? 2 : 4}>
          <StatCard title="Total Staff" value={stats.total} icon={PeopleIcon} color="#182563" active={!permFilter && !statusFilter} onClick={resetFilters} />
        </Grid>
        {(isAdmin || isHR) ? (
          <>
            <Grid item xs={12} sm={6} md={2}><StatCard title="Admins" value={stats.admins} icon={AdminIcon} color="#991B1B" active={permFilter === 'admin'} onClick={() => setPermFilter('admin')} /></Grid>
            <Grid item xs={12} sm={6} md={2}><StatCard title="HR Unit" value={stats.hr} icon={SecurityIcon} color="#92400E" active={permFilter === 'hr'} onClick={() => setPermFilter('hr')} /></Grid>
            <Grid item xs={12} sm={6} md={2}><StatCard title="Managers" value={stats.managers} icon={ManagerIcon} color="#1E40AF" active={permFilter === 'manager'} onClick={() => setPermFilter('manager')} /></Grid>
            <Grid item xs={12} sm={6} md={2}><StatCard title="Annual Budget" value={`R${(stats.totalBudget / 1000000).toFixed(1)}M`} icon={SalaryIcon} color="#059669" /></Grid>
            <Grid item xs={12} sm={6} md={2}><StatCard title="Avg Comp (M)" value={`R${Math.round(stats.avgSalary / 12 / 1000).toFixed(0)}K`} icon={AssessmentIcon} color="#D4AF37" /></Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={4}><StatCard title="Direct Reports" value={stats.managers + stats.employees} icon={ManagerIcon} color="#1E40AF" /></Grid>
            <Grid item xs={12} sm={6} md={4}><StatCard title="My Clearance" value={user?.permissionLevel?.toUpperCase()} icon={SecurityIcon} color="#D4AF37" /></Grid>
          </>
        )}
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center" bgcolor="#F8FAFC" borderBottom="1px solid #E2E8F0">
          <TextField size="small" placeholder="Search registry..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 350 }} 
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#182563' }} /></InputAdornment>, sx: { bgcolor: 'white' } }} />
          <Box display="flex" gap={1}>
            {(permFilter || statusFilter !== null || searchTerm) && <Button size="small" onClick={resetFilters} sx={{ color: '#CC1240', fontWeight: 700 }}>Reset</Button>}
            <IconButton onClick={onRefresh} title="Refresh Data"><RefreshIcon /></IconButton>
            <IconButton onClick={downloadRegistry} color="primary" title="Export to CSV"><ExportIcon /></IconButton>
          </Box>
        </Box>
        <Box sx={{ height: 600, width: '100%' }}>
          {loading && <LinearProgress />}
          <DataGrid rows={employees} columns={columns} disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#F8FAFC', color: '#182563', fontWeight: 800 } }} />
        </Box>
      </Paper>

      {/* delete confirm */}
      <Dialog open={delDlg.open} onClose={() => setDelDlg({ open: false, target: null })}>
        <DialogTitle sx={{ color: '#CC1240', fontWeight: 800 }}>Permanent Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to purge the record for {delDlg.target?.name}?</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setDelDlg({ open: false, target: null })}>Abort</Button>
          <Button onClick={() => {
            employeeApi.delete(delDlg.target.id).then(() => { onNotification('staff purged'); setDelDlg({ open: false, target: null }); onRefresh(); });
          }} variant="contained" sx={{ bgcolor: '#CC1240' }}>Confirm Purge</Button>
        </DialogActions>
      </Dialog>

      {/* pass reset confirm */}
      <Dialog open={resetDlg.open} onClose={() => setResetDlg({ open: false, target: null })}>
        <DialogTitle sx={{ fontWeight: 800 }}>Credential Reset</DialogTitle>
        <DialogContent><Typography>Reset password for {resetDlg.target?.name} to default?</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setResetDlg({ open: false, target: null })}>No</Button>
          <Button onClick={() => {
            authApi.resetPassword(resetDlg.target.id).then(() => { onNotification('password reset ok'); setResetDlg({ open: false, target: null }); });
          }} variant="contained" sx={{ bgcolor: '#182563' }}>Reset Now</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// helper stat cards
function StatCard({ title, value, icon: Icon, color, active, onClick }) {
  return (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default', borderTop: active ? `4px solid ${color}` : '4px solid transparent', bgcolor: active ? '#F8FAFC' : 'white' }} onClick={onClick}>
      <CardContent><Box display="flex" justifyContent="space-between" alignItems="center">
        <Box><Typography variant="overline" sx={{ fontWeight: 700 }}>{title}</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#182563' }}>{value}</Typography></Box>
        <Avatar sx={{ bgcolor: `${color}20`, color }}><Icon /></Avatar></Box>
      </CardContent>
    </Card>
  );
}

export default EmployeeList;
