import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  Security
} from '@mui/icons-material';
import { authApi, handleApiError } from '../services/api';

// ok this is for when staff want to change their own password
function PasswordChange({ onSuccess, onError }) {
  const [form, setForm] = useState({
    old: '',
    new: '',
    confirm: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);

  const update = (f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    if (err) setErr('');
  };

  const doSubmit = async (e) => {
    e.preventDefault();
    
    if (form.new !== form.confirm) {
      setErr('new passwords dont match');
      return;
    }
    
    if (form.new.length < 6) {
      setErr('must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        oldPassword: form.old,
        newPassword: form.new
      });
      
      setForm({ old: '', new: '', confirm: '' });
      if (onSuccess) onSuccess('credentials updated okay');
    } catch (e) {
      const msg = handleApiError(e);
      setErr(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Box display="flex" alignItems="center" mb={3} gap={1.5}>
          <Security sx={{ color: '#182563' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#182563' }}>Update Security Key</Typography>
        </Box>

        {err && <Alert severity="error" sx={{ mb: 3 }}>{err}</Alert>}

        <Box component="form" onSubmit={doSubmit}>
          <TextField fullWidth type={show ? 'text' : 'password'} label="Current Password" value={form.old} onChange={update('old')} margin="normal" required
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment> }} />

          <TextField fullWidth type={show ? 'text' : 'password'} label="New Security Key" value={form.new} onChange={update('new')} margin="normal" required />

          <TextField fullWidth type={show ? 'text' : 'password'} label="Confirm New Key" value={form.confirm} onChange={update('confirm')} margin="normal" required
            InputProps={{
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
            }} />

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 4, py: 1.5, bgcolor: '#182563', fontWeight: 700, borderRadius: 2 }}>
            {loading ? 'Processing...' : 'Modify Credentials'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PasswordChange;
