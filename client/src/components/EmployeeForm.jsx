import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  InputAdornment,
  Container,
  Divider,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Badge as BadgeIcon, 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Payments as SalaryIcon, 
  Work as RoleIcon,
  CalendarMonth as DateIcon,
  SupervisorAccount as ManagerIcon,
  VerifiedUser as SecurityIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { employeeApi, handleApiError } from '../services/api';

// ok this form handles onboarding and staff updates
function EmployeeForm({ employee, onSuccess, onCancel, onError }) {
  const [form, setForm] = useState({
    employeeNumber: '',
    name: '',
    surname: '',
    email: '',
    birthDate: null,
    salary: '',
    role: '',
    permissionLevel: 'employee',
    managerId: '',
    isActive: true
  });
  
  const [mgrList, setMgrList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        ...employee,
        birthDate: employee.birthDate ? dayjs(employee.birthDate) : null,
        managerId: employee.managerId || ''
      });
    }
    
    employeeApi.getAll()
      .then(res => {
        setMgrList(res.data.filter(e => !employee || e.id !== employee.id));
      })
      .catch(e => console.error('couldnt load managers:', e));
  }, [employee]);

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const doSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...form,
        birthDate: form.birthDate ? form.birthDate.format('YYYY-MM-DD') : null,
        managerId: form.managerId || null,
        salary: Number(form.salary)
      };

      if (employee) {
        await employeeApi.update(employee.id, payload);
      } else {
        await employeeApi.create(payload);
      }
      
      onSuccess();
    } catch (e) {
      const msg = handleApiError(e);
      if (onError) onError(msg);
      else console.error('save failed:', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        {/* top header */}
        <Box sx={{ bgcolor: '#182563', py: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#D4AF37', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}>
              {employee ? 'Staff Modification' : 'Staff Enrollment'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
              OFFICIAL PERSONNEL REGISTRY SYSTEM
            </Typography>
          </Box>
          <img src="/assets/shield-logo.png" alt="Logo" style={{ height: '55px' }} />
        </Box>

        <Box component="form" onSubmit={doSave} sx={{ p: 5, bgcolor: '#FFFFFF' }}>
          <Stack spacing={5}>
            
            {/* 1. Identity Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#182563', fontWeight: 900, mb: 1, letterSpacing: 1 }}>1. PERSONNEL IDENTITY</Typography>
              <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: '#D4AF37' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Employee Number / ID" value={form.employeeNumber} onChange={(e) => update('employeeNumber', e.target.value)} required 
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#182563' }} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker label="Birth Date" value={form.birthDate} onChange={(val) => update('birthDate', val)} 
                    slotProps={{ textField: { fullWidth: true, required: true, InputProps: { startAdornment: <InputAdornment position="start"><DateIcon sx={{ color: '#182563' }} /></InputAdornment> } } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" value={form.name} onChange={(e) => update('name', e.target.value)} required 
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#182563' }} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Surname" value={form.surname} onChange={(e) => update('surname', e.target.value)} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Official Corporate Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#182563' }} /></InputAdornment> }} />
                </Grid>
              </Grid>
            </Box>

            {/* 2. Job & Compensation Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#182563', fontWeight: 900, mb: 1, letterSpacing: 1 }}>2. JOB DETAILS & COMPENSATION</Typography>
              <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: '#D4AF37' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Current Designation" value={form.role} onChange={(e) => update('role', e.target.value)} required
                    InputProps={{ startAdornment: <InputAdornment position="start"><RoleIcon sx={{ color: '#182563' }} /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Clearance Level" value={form.permissionLevel} onChange={(e) => update('permissionLevel', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SecurityIcon sx={{ color: '#182563' }} /></InputAdornment> }}>
                    <MenuItem value="employee">Operations (Level 1)</MenuItem>
                    <MenuItem value="manager">Management (Level 2)</MenuItem>
                    <MenuItem value="hr">Human Resources (Level 3)</MenuItem>
                    <MenuItem value="admin">System Admin (Level 4)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Annual Remuneration (ZAR Gross)" type="number" value={form.salary} onChange={(e) => update('salary', e.target.value)} required
                    helperText={form.salary ? `Monthly Payout Calculation: R${Math.round(Number(form.salary)/12).toLocaleString()}` : 'Enter the full yearly salary'}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SalaryIcon sx={{ color: '#182563' }} /></InputAdornment> }} />
                </Grid>
              </Grid>
            </Box>

            {/* 3. Organizational Structure Section - FULL WIDTH BLOCK */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#182563', fontWeight: 900, mb: 1, letterSpacing: 1 }}>3. ORGANIZATIONAL STRUCTURE</Typography>
              <Divider sx={{ mb: 3, borderBottomWidth: 2, borderColor: '#D4AF37' }} />
              
              <Box sx={{ width: '100%' }}>
                <TextField 
                  fullWidth 
                  select 
                  label="Reporting Line Manager" 
                  value={form.managerId} 
                  onChange={(e) => update('managerId', e.target.value)}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><ManagerIcon sx={{ color: '#182563', mr: 1 }} /></InputAdornment>,
                    sx: { height: '65px', fontSize: '1.1rem' } 
                  }}
                >
                  <MenuItem value=""><em>None (Root / CEO Level)</em></MenuItem>
                  {mgrList.map(m => <MenuItem key={m.id} value={m.id}>{m.name} {m.surname} — {m.role}</MenuItem>)}
                </TextField>
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                  * This sets where the employee appears in the official Org Chart.
                </Typography>
              </Box>
            </Box>

            {/* Bottom Actions - Status on the left, buttons on the right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 4, borderTop: '1px solid #F1F5F9' }}>
              <FormControlLabel 
                control={<Switch checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} color="success" />} 
                label={<Typography sx={{ fontWeight: 900, color: form.isActive ? 'success.main' : 'text.secondary', fontSize: '0.9rem' }}>ACCOUNT ACTIVE</Typography>} 
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {onCancel && (
                  <Button onClick={onCancel} variant="outlined" size="large" sx={{ fontWeight: 800, px: 4, borderColor: '#182563', color: '#182563' }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={loading} size="large" 
                  sx={{ bgcolor: '#182563', color: '#D4AF37', px: 6, py: 1.5, fontWeight: 900, borderRadius: 2, boxShadow: '0 6px 20px rgba(24,37,99,0.3)' }}>
                  {loading ? 'Processing...' : 'Commit Record'}
                </Button>
              </Box>
            </Box>

          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default EmployeeForm;
