import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Email
} from '@mui/icons-material';
import { authApi, handleApiError } from '../services/api';

// ok this is the entry point for the system
function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);

  const update = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (err) setErr('');
  };

  const doLogin = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setErr('credentials cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(form);
      
      // ok save the session
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      onLogin(res.data.user);
    } catch (e) {
      console.error('auth error:', e);
      // ok make SURE this is a string so react doesnt cry
      const msg = handleApiError(e);
      setErr(typeof msg === 'string' ? msg : 'Internal Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #182563 0%, #0a1130 100%)', py: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{ p: 5, width: '100%', maxWidth: 450, borderRadius: 4, borderTop: '5px solid #D4AF37', mx: 'auto' }}>
          <Box textAlign="center" mb={4}>
            <Box sx={{ display: 'inline-flex', p: 1, borderRadius: 2, border: '3px solid #D4AF37', mb: 3, bgcolor: '#FFFFFF' }}>
              <img src="/assets/shield-logo.png" alt="EpiUse" style={{ height: '120px', width: 'auto' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#182563', textTransform: 'uppercase', letterSpacing: 1 }}>Personnel Access</Typography>
          </Box>

          {err && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{String(err)}</Alert>}

          <Box component="form" onSubmit={doLogin}>
            <TextField fullWidth label="ID (Corporate Email)" value={form.email} onChange={update('email')} margin="normal" disabled={loading}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#182563' }} /></InputAdornment>, sx: { borderRadius: 2 } }} />

            <TextField fullWidth label="Security Key" type={show ? 'text' : 'password'} value={form.password} onChange={update('password')} margin="normal" disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#182563' }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                sx: { borderRadius: 2 }
              }} />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ mt: 4, mb: 2, py: 1.8, fontSize: '1.1rem', fontWeight: 700, bgcolor: '#182563', borderRadius: 2, boxShadow: '0 4px 14px rgba(24,37,99,0.4)' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Authorize Access'}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>SECURE AREA</Typography></Divider>

          <Box p={2} sx={{ bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ color: '#182563', fontWeight: 700 }} gutterBottom>System Credentials:</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              ID: admin@epiuseapp.com<br />
              KEY: EpiUse123!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
