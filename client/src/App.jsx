import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Logout, AccountCircle } from '@mui/icons-material';

import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import HierarchyView from './components/HierarchyView';
import Login from './components/Login';
import PasswordChange from './components/PasswordChange';
import { AuthProvider, useAuth } from './context/AuthContext';

// ok this is the royal theme specs for the whole app
const royalTheme = createTheme({
  palette: {
    primary: {
      main: '#182563', // the deep royal blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AF37', // polished gold
      contrastText: '#182563',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 800,
      letterSpacing: '0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#182563',
          borderBottom: '3px solid #D4AF37',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          '&.Mui-selected': {
            color: '#182563',
          },
        },
      },
    },
  },
});

// quick helper for tab panels
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ok this is the main shell when logged in
function MainApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.permissionLevel === 'admin';
  const canAdd = isAdmin || user?.permissionLevel === 'hr';

  // fix: make sure msg is always a string to avoid react render errors
  const notify = (msg, type = 'success') => {
    const text = typeof msg === 'object' ? (msg.message || msg.error || 'Unknown error') : String(msg);
    setToast({ show: true, msg: text, type });
  };
  
  const doRefresh = () => setRefreshKey(prev => prev + 1);

  // check if server is actually alive
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .catch(err => {
        console.error('health check failed');
        // dont notify on health check fail to avoid annoying toasts
      });
  }, []);

  // mapping for hidden tabs
  const getIdx = (name) => {
    const tabs = ['list', 'add', 'tree', 'pass'];
    let count = 0;
    for (let t of tabs) {
      if (t === name) return count;
      if (t === 'list') count++;
      else if (t === 'add' && canAdd) count++;
      else if (t === 'tree') count++;
      else if (t === 'pass') count++;
    }
    return count;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/assets/shield-logo.png" alt="Logo" style={{ height: '40px' }} />
            <Typography variant="h6">EPIUSE APP</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}>
                <AccountCircle sx={{ color: 'primary.main' }} />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1 }}>{user?.name || user?.username}</Typography>
                <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700 }}>{user?.permissionLevel?.toUpperCase()}</Typography>
              </Box>
            </Box>
            <Button variant="contained" color="secondary" onClick={logout} startIcon={<Logout />} size="small" sx={{ boxShadow: 2 }}>
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} indicatorColor="secondary">
            <Tab label="Employee List" sx={{ fontWeight: 800 }} />
            {canAdd && <Tab label="Add Employee" sx={{ fontWeight: 800 }} />}
            <Tab label="Hierarchy View" sx={{ fontWeight: 800 }} />
            <Tab label="Change Password" sx={{ fontWeight: 800 }} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <EmployeeList refreshTrigger={refreshKey} onNotification={notify} onRefresh={doRefresh} />
        </TabPanel>

        {canAdd && (
          <TabPanel value={activeTab} index={getIdx('add')}>
            <EmployeeForm onSuccess={() => { notify('staff member enrolled'); doRefresh(); setActiveTab(0); }} onError={(m) => notify(m, 'error')} />
          </TabPanel>
        )}

        <TabPanel value={activeTab} index={getIdx('tree')}>
          <HierarchyView refreshTrigger={refreshKey} onNotification={notify} />
        </TabPanel>

        <TabPanel value={activeTab} index={getIdx('pass')}>
          <PasswordChange onSuccess={(m) => notify(m)} onError={(m) => notify(m, 'error')} />
        </TabPanel>
      </Container>

      <Snackbar open={toast.show} autoHideDuration={5000} onClose={() => setToast(p => ({ ...p, show: false }))}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%', boxShadow: 3 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

// auth guard layer
function AppContent() {
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#182563' }}>
        <CircularProgress size={60} sx={{ color: '#D4AF37' }} />
      </Box>
    );
  }

  if (!user) return <Login onLogin={login} />;

  return <MainApp />;
}

// ok main entry point
function App() {
  return (
    <ThemeProvider theme={royalTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
