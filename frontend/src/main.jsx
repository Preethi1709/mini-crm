import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

// Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Validation Helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const isValidPhone = (phone) => /^\d{10}$/.test(String(phone || '').trim());
const isValidUrl = (url) => /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(String(url || '').trim());

const getInitials = (name) => {
  if (!name) return 'L';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ==========================================
// SVG ICONS
// ==========================================
function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function IconCheckSquare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ==========================================
// TOAST COMPONENT
// ==========================================
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? <IconCheck /> : <IconAlertCircle />}
          </span>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <IconClose />
          </button>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MODAL & CONFIRM DIALOG
// ==========================================
function Modal({ isOpen, onClose, title, children, footer, maxWidth = '580px' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IconClose />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'btn-danger', loading = false }) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : confirmText}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
        {message}
      </p>
    </Modal>
  );
}

// ==========================================
// LOGIN COMPONENT
// ==========================================
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Check if redirected with flash toast (e.g. from logout)
    const flash = sessionStorage.getItem('flashToast');
    if (flash) {
      sessionStorage.removeItem('flashToast');
      try {
        const parsed = JSON.parse(flash);
        showToast(parsed.message, parsed.type);
      } catch {}
    }

    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      sessionStorage.setItem('flashToast', JSON.stringify({ type: 'success', message: 'Login successfully!' }));
      navigate('/');
    } catch {
      showToast('Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <IconBuilding />
          </div>
          <h1>Mini CRM</h1>
          <p>Sign in to manage your leads, companies, and tasks</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">
              Email Address <span className="required-asterisk">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password <span className="required-asterisk">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
                aria-label={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentUser, setCurrentUser] = useState({});
  const [summary, setSummary] = useState({});
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filter States
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('All');

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Image Preview Modal
  const [previewImageModal, setPreviewImageModal] = useState({ isOpen: false, url: '', title: '' });

  // ------------------------------------------
  // LEADS STATE & VALIDATION
  // ------------------------------------------
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalMode, setLeadModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [activeLead, setActiveLead] = useState(null);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    source: '',
    image: '',
    notes: ''
  });
  const [leadFormErrors, setLeadFormErrors] = useState({});
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  // ------------------------------------------
  // COMPANIES STATE & VALIDATION
  // ------------------------------------------
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [activeCompany, setActiveCompany] = useState(null);
  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    contactPerson: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    notes: ''
  });
  const [companyFormErrors, setCompanyFormErrors] = useState({});
  const [companySubmitting, setCompanySubmitting] = useState(false);

  // ------------------------------------------
  // TASKS STATE & VALIDATION
  // ------------------------------------------
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [activeTask, setActiveTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    lead: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending'
  });
  const [taskFormErrors, setTaskFormErrors] = useState({});
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'btn-danger',
    onConfirm: () => {},
    loading: false
  });

  const navigate = useNavigate();

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth & Initial Fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
      return;
    }
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        setCurrentUser({});
      }
    }

    // Check flash toast from login
    const flash = sessionStorage.getItem('flashToast');
    if (flash) {
      sessionStorage.removeItem('flashToast');
      try {
        const parsed = JSON.parse(flash);
        showToast(parsed.message, parsed.type);
      } catch {}
    }

    refreshAllData();
  }, [navigate]);

  async function refreshAllData() {
    setLoadingData(true);
    try {
      const [dashRes, leadsRes, compRes, tasksRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/leads?limit=200'),
        api.get('/companies'),
        api.get('/tasks')
      ]);

      setSummary(dashRes.data);
      setLeads(leadsRes.data.items || []);
      setCompanies(compRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        showToast(err.response?.data?.message || 'Failed to sync data with server', 'error');
      }
    } finally {
      setLoadingData(false);
    }
  }

  function handleLogout() {
    sessionStorage.setItem('flashToast', JSON.stringify({ type: 'success', message: 'Logout successfully!' }));
    localStorage.clear();
    navigate('/login');
  }

  // ------------------------------------------
  // LEADS ACTIONS & VALIDATION
  // ------------------------------------------
  function openAddLead() {
    setLeadModalMode('add');
    setActiveLead(null);
    setLeadFormData({
      name: '',
      email: '',
      phone: '',
      company: companies[0]?._id || '',
      status: 'New',
      source: '',
      image: '',
      notes: ''
    });
    setLeadFormErrors({});
    setLeadModalOpen(true);
  }

  function openEditLead(lead) {
    setLeadModalMode('edit');
    setActiveLead(lead);
    setLeadFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company?._id || lead.company || '',
      status: lead.status || 'New',
      source: lead.source || '',
      image: lead.image || '',
      notes: lead.notes || ''
    });
    setLeadFormErrors({});
    setLeadModalOpen(true);
  }

  function openViewLead(lead) {
    setLeadModalMode('view');
    setActiveLead(lead);
    setLeadModalOpen(true);
  }

  function handleLeadImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setLeadFormErrors((prev) => ({ ...prev, image: 'Only JPG, JPEG, PNG, and WEBP formats are allowed.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLeadFormErrors((prev) => ({ ...prev, image: 'Image file size must be less than 5 MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLeadFormData((prev) => ({ ...prev, image: reader.result }));
      setLeadFormErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  }

  function validateLeadForm() {
    const errors = {};
    if (!leadFormData.name.trim()) {
      errors.name = 'This field is required';
    }
    if (!leadFormData.email.trim()) {
      errors.email = 'This field is required';
    } else if (!isValidEmail(leadFormData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!leadFormData.phone.trim()) {
      errors.phone = 'This field is required';
    } else if (!isValidPhone(leadFormData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!leadFormData.company) {
      errors.company = 'This field is required';
    }

    if (!leadFormData.status) {
      errors.status = 'This field is required';
    }

    if (!leadFormData.source.trim()) {
      errors.source = 'This field is required';
    }

    // Lead image is mandatory on Add; on Edit it is also mandatory to retain or replace
    if (!leadFormData.image || !leadFormData.image.trim()) {
      errors.image = 'This field is required';
    }

    setLeadFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveLead(e) {
    e.preventDefault();
    if (!validateLeadForm()) {
      return;
    }

    setLeadSubmitting(true);
    try {
      if (leadModalMode === 'add') {
        const res = await api.post('/leads', leadFormData);
        setLeads((prev) => [res.data, ...prev]);
        showToast('Lead created successfully');
      } else if (leadModalMode === 'edit' && activeLead) {
        const res = await api.put(`/leads/${activeLead._id}`, leadFormData);
        setLeads((prev) => prev.map((l) => (l._id === activeLead._id ? res.data : l)));
        setTasks((prev) =>
          prev.map((t) => {
            if (t.lead?._id === activeLead._id || t.lead === activeLead._id) {
              return {
                ...t,
                lead: {
                  ...t.lead,
                  ...res.data
                }
              };
            }
            return t;
          })
        );
        showToast('Lead updated successfully');
      }
      setLeadModalOpen(false);
      api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save lead', 'error');
    } finally {
      setLeadSubmitting(false);
    }
  }

  function confirmArchiveLead(lead) {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Lead',
      message: `Are you sure you want to archive lead "${lead.name}"? It will be removed from your active leads list.`,
      confirmText: 'Archive',
      confirmVariant: 'btn-danger',
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/leads/${lead._id}`);
          setLeads((prev) => prev.filter((l) => l._id !== lead._id));
          showToast(`Lead "${lead.name}" archived`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to archive lead', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  }

  function confirmDeleteLead(lead) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lead Permanently',
      message: `Are you sure you want to permanently delete lead "${lead.name}"? Any linked tasks will be safely unlinked. This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      confirmVariant: 'btn-danger',
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/leads/${lead._id}?permanent=true`);
          setLeads((prev) => prev.filter((l) => l._id !== lead._id));
          api.get('/tasks').then((t) => setTasks(t.data)).catch(() => {});
          showToast(`Lead "${lead.name}" deleted permanently`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete lead', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = leadStatusFilter === 'All' || lead.status === leadStatusFilter;
      const searchLower = leadSearch.toLowerCase().trim();
      if (!searchLower) return matchesStatus;

      const nameMatch = lead.name?.toLowerCase().includes(searchLower);
      const emailMatch = lead.email?.toLowerCase().includes(searchLower);
      const phoneMatch = lead.phone?.toLowerCase().includes(searchLower);
      const compMatch = lead.company?.name?.toLowerCase().includes(searchLower);

      return matchesStatus && (nameMatch || emailMatch || phoneMatch || compMatch);
    });
  }, [leads, leadStatusFilter, leadSearch]);

  // ------------------------------------------
  // COMPANIES ACTIONS & VALIDATION
  // ------------------------------------------
  function openAddCompany() {
    setCompanyModalMode('add');
    setActiveCompany(null);
    setCompanyFormData({
      name: '',
      contactPerson: '',
      industry: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      notes: ''
    });
    setCompanyFormErrors({});
    setCompanyModalOpen(true);
  }

  function openEditCompany(company) {
    setCompanyModalMode('edit');
    setActiveCompany(company);
    setCompanyFormData({
      name: company.name || '',
      contactPerson: company.contactPerson || '',
      industry: company.industry || '',
      email: company.email || '',
      phone: company.phone || '',
      website: company.website || '',
      address: company.address || '',
      notes: company.notes || ''
    });
    setCompanyFormErrors({});
    setCompanyModalOpen(true);
  }

  async function openViewCompany(company) {
    setActiveCompany(company);
    setCompanyModalMode('view');
    setCompanyModalOpen(true);

    try {
      const res = await api.get(`/companies/${company._id}`);
      setActiveCompany(res.data.company ? { ...res.data.company, leads: res.data.leads } : company);
    } catch {
      // Fallback
    }
  }

  function validateCompanyForm() {
    const errors = {};
    if (!companyFormData.name.trim()) {
      errors.name = 'This field is required';
    }
    if (!companyFormData.contactPerson.trim()) {
      errors.contactPerson = 'This field is required';
    }
    if (!companyFormData.industry.trim()) {
      errors.industry = 'This field is required';
    }

    if (!companyFormData.email.trim()) {
      errors.email = 'This field is required';
    } else if (!isValidEmail(companyFormData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!companyFormData.phone.trim()) {
      errors.phone = 'This field is required';
    } else if (!isValidPhone(companyFormData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!companyFormData.website.trim()) {
      errors.website = 'This field is required';
    } else if (!isValidUrl(companyFormData.website)) {
      errors.website = 'Please enter a valid website URL.';
    }

    if (!companyFormData.address.trim()) {
      errors.address = 'This field is required';
    }

    setCompanyFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveCompany(e) {
    e.preventDefault();
    if (!validateCompanyForm()) {
      return;
    }

    setCompanySubmitting(true);
    try {
      if (companyModalMode === 'add') {
        const res = await api.post('/companies', companyFormData);
        setCompanies((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        showToast('Company added successfully');
      } else if (companyModalMode === 'edit' && activeCompany) {
        const res = await api.put(`/companies/${activeCompany._id}`, companyFormData);
        setCompanies((prev) =>
          prev.map((c) => (c._id === activeCompany._id ? res.data : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        api.get('/leads?limit=200').then((r) => setLeads(r.data.items || [])).catch(() => {});
        showToast('Company updated successfully');
      }
      setCompanyModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save company', 'error');
    } finally {
      setCompanySubmitting(false);
    }
  }

  function confirmDeleteCompany(company) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Company',
      message: `Are you sure you want to delete "${company.name}"? Any leads belonging to this company will remain intact with company unlinked.`,
      confirmText: 'Delete Company',
      confirmVariant: 'btn-danger',
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/companies/${company._id}`);
          setCompanies((prev) => prev.filter((c) => c._id !== company._id));
          api.get('/leads?limit=200').then((r) => setLeads(r.data.items || [])).catch(() => {});
          showToast(`Company "${company.name}" deleted`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete company', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  }

  // ------------------------------------------
  // TASKS ACTIONS & VALIDATION
  // ------------------------------------------
  function openAddTask() {
    setTaskModalMode('add');
    setActiveTask(null);
    setTaskFormData({
      title: '',
      description: '',
      lead: leads[0]?._id || '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Pending'
    });
    setTaskFormErrors({});
    setTaskModalOpen(true);
  }

  function openEditTask(task) {
    setTaskModalMode('edit');
    setActiveTask(task);
    setTaskFormData({
      title: task.title || '',
      description: task.description || '',
      lead: task.lead?._id || task.lead || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending'
    });
    setTaskFormErrors({});
    setTaskModalOpen(true);
  }

  function openViewTask(task) {
    setActiveTask(task);
    setTaskModalMode('view');
    setTaskModalOpen(true);
  }

  function validateTaskForm() {
    const errors = {};
    if (!taskFormData.title.trim()) {
      errors.title = 'This field is required';
    }
    if (!taskFormData.description.trim()) {
      errors.description = 'This field is required';
    }
    if (!taskFormData.lead) {
      errors.lead = 'This field is required';
    }
    if (!taskFormData.dueDate) {
      errors.dueDate = 'This field is required';
    }
    if (!taskFormData.priority) {
      errors.priority = 'This field is required';
    }
    if (!taskFormData.status) {
      errors.status = 'This field is required';
    }

    setTaskFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveTask(e) {
    e.preventDefault();
    if (!validateTaskForm()) {
      return;
    }

    setTaskSubmitting(true);
    try {
      if (taskModalMode === 'add') {
        const res = await api.post('/tasks', taskFormData);
        setTasks((prev) => [...prev, res.data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
        showToast('Task created successfully');
      } else if (taskModalMode === 'edit' && activeTask) {
        const res = await api.put(`/tasks/${activeTask._id}`, taskFormData);
        setTasks((prev) =>
          prev.map((t) => (t._id === activeTask._id ? res.data : t)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        );
        showToast('Task updated successfully');
      }
      setTaskModalOpen(false);
      api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setTaskSubmitting(false);
    }
  }

  async function handleUpdateTaskStatus(task, newStatus) {
    try {
      const res = await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      showToast(`Task status changed to ${newStatus}`);
      api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update task status', 'error');
    }
  }

  async function handleToggleCompleteTask(task) {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    await handleUpdateTaskStatus(task, nextStatus);
  }

  function confirmDeleteTask(task) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete task "${task.title}"?`,
      confirmText: 'Delete Task',
      confirmVariant: 'btn-danger',
      loading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
          await api.delete(`/tasks/${task._id}`);
          setTasks((prev) => prev.filter((t) => t._id !== task._id));
          showToast(`Task "${task.title}" deleted`);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          api.get('/dashboard').then((d) => setSummary(d.data)).catch(() => {});
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to delete task', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
      }
    });
  }

  return (
    <div className="shell">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmVariant={confirmDialog.confirmVariant}
        loading={confirmDialog.loading}
      />

      {/* BIG IMAGE PREVIEW MODAL */}
      <Modal
        isOpen={previewImageModal.isOpen}
        onClose={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}
        title={previewImageModal.title || 'Image Preview'}
        maxWidth="500px"
        footer={
          <button className="btn-secondary" onClick={() => setPreviewImageModal({ isOpen: false, url: '', title: '' })}>
            Close
          </button>
        }
      >
        <div className="image-modal-container">
          <img src={previewImageModal.url} alt={previewImageModal.title} className="image-modal-full" />
        </div>
      </Modal>

      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">
            <IconBuilding />
          </div>
          <div className="logo-text">
            <h2>Mini CRM</h2>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            <IconDashboard />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'Leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('Leads')}
          >
            <IconUsers />
            <span>Leads</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'Companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('Companies')}
          >
            <IconBuilding />
            <span>Companies</span>
          </button>
          <button
            className={`nav-link ${activeTab === 'Tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('Tasks')}
          >
            <IconCheckSquare />
            <span>Tasks</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name || 'Admin User'}</div>
              <div className="user-role">{currentUser.role || 'Administrator'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section className="content">
        <header className="top-header">
          <div className="header-title">
            <h1>{activeTab}</h1>
          </div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
              <IconLogout />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="view-container">
          {/* ==================================================== */}
          {/* DASHBOARD VIEW */}
          {/* ==================================================== */}
          {activeTab === 'Dashboard' && (
            <div>
              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-info">
                    <small>Total Leads</small>
                    <h2>{summary.totalLeads ?? 0}</h2>
                  </div>
                  <div className="stat-icon blue">
                    <IconUsers />
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-info">
                    <small>Qualified Leads</small>
                    <h2>{summary.qualifiedLeads ?? 0}</h2>
                  </div>
                  <div className="stat-icon green">
                    <IconCheck />
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-info">
                    <small>Tasks Due Today</small>
                    <h2>{summary.tasksDueToday ?? 0}</h2>
                  </div>
                  <div className="stat-icon amber">
                    <IconCheckSquare />
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-info">
                    <small>Completed Tasks</small>
                    <h2>{summary.completedTasks ?? 0}</h2>
                  </div>
                  <div className="stat-icon purple">
                    <IconCheckSquare />
                  </div>
                </article>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '8px' }}>Welcome back, {currentUser.name || 'User'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                    Quickly add new records or navigate to any module to manage your sales pipeline and team tasks.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={openAddLead}>
                      <IconPlus /> Add Lead
                    </button>
                    <button className="btn-secondary" onClick={openAddCompany}>
                      <IconPlus /> Add Company
                    </button>
                    <button className="btn-secondary" onClick={openAddTask}>
                      <IconPlus /> Create Task
                    </button>
                  </div>
                </div>

                <div className="table-card" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '12px' }}>System Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Database</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>MongoDB Connected</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Active Companies</span>
                      <span style={{ fontWeight: 600 }}>{companies.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pending Tasks</span>
                      <span style={{ fontWeight: 600 }}>{tasks.filter((t) => t.status !== 'Completed').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* LEADS VIEW */}
          {/* ==================================================== */}
          {activeTab === 'Leads' && (
            <div>
              <div className="section-header">
                <div className="section-header-left">
                  <h2 className="section-title">Leads Management</h2>
                  <div className="search-box">
                    <span className="search-icon"><IconSearch /></span>
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <button onClick={openAddLead}>
                  <IconPlus /> Add Lead
                </button>
              </div>

              <div className="table-card">
                {loadingData ? (
                  <div>
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><IconUsers /></div>
                    <h3>No leads found</h3>
                    <p>
                      {leadSearch || leadStatusFilter !== 'All'
                        ? 'Try adjusting your search criteria or status filter.'
                        : 'Get started by creating your first lead in the CRM.'}
                    </p>
                    <button onClick={openAddLead}>
                      <IconPlus /> Add Lead
                    </button>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '56px' }}>Image</th>
                        <th>Lead Name</th>
                        <th>Contact</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => {
                        const statusClass = `badge-${lead.status ? lead.status.toLowerCase().replace(/\s+/g, '-') : 'new'}`;
                        return (
                          <tr key={lead._id}>
                            <td>
                              {lead.image ? (
                                <img
                                  src={lead.image}
                                  alt={lead.name}
                                  className="lead-avatar-thumb"
                                  title="Click to view larger image"
                                  onClick={() => setPreviewImageModal({ isOpen: true, url: lead.image, title: lead.name })}
                                />
                              ) : (
                                <div className="lead-avatar-default" title={lead.name}>
                                  {getInitials(lead.name)}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{lead.name}</div>
                              {lead.notes && (
                                <small style={{ color: 'var(--text-muted)' }} title={lead.notes}>
                                  {lead.notes.length > 35 ? lead.notes.substring(0, 35) + '...' : lead.notes}
                                </small>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8125rem' }}>{lead.email || '—'}</div>
                              {lead.phone && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.phone}</div>
                              )}
                            </td>
                            <td>
                              {lead.company?.name ? (
                                <span style={{ fontWeight: 500 }}>{lead.company.name}</span>
                              ) : (
                                <span style={{ color: 'var(--text-light)' }}>—</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${statusClass}`}>
                                <span className="badge-dot" />
                                {lead.status || 'New'}
                              </span>
                            </td>
                            <td>{lead.source || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                <button
                                  className="action-btn view"
                                  data-tooltip="View Details"
                                  onClick={() => openViewLead(lead)}
                                  aria-label="View lead details"
                                >
                                  <IconEye />
                                </button>
                                <button
                                  className="action-btn edit"
                                  data-tooltip="Edit Lead"
                                  onClick={() => openEditLead(lead)}
                                  aria-label="Edit lead"
                                >
                                  <IconEdit />
                                </button>
                                <button
                                  className="action-btn archive"
                                  data-tooltip="Archive Lead"
                                  onClick={() => confirmArchiveLead(lead)}
                                  aria-label="Archive lead"
                                >
                                  <IconArchive />
                                </button>
                                <button
                                  className="action-btn delete"
                                  data-tooltip="Delete Permanently"
                                  onClick={() => confirmDeleteLead(lead)}
                                  aria-label="Delete lead permanently"
                                >
                                  <IconTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* COMPANIES VIEW */}
          {/* ==================================================== */}
          {activeTab === 'Companies' && (
            <div>
              <div className="section-header">
                <div className="section-header-left">
                  <h2 className="section-title">Companies Directory</h2>
                </div>
                <button onClick={openAddCompany}>
                  <IconPlus /> Add Company
                </button>
              </div>

              <div className="table-card">
                {loadingData ? (
                  <div>
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                  </div>
                ) : companies.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><IconBuilding /></div>
                    <h3>No companies registered</h3>
                    <p>Add company profiles to organize your accounts and associate leads.</p>
                    <button onClick={openAddCompany}>
                      <IconPlus /> Add Company
                    </button>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Person</th>
                        <th>Industry</th>
                        <th>Contact</th>
                        <th>Website</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            {c.address && (
                              <small style={{ color: 'var(--text-muted)' }}>{c.address}</small>
                            )}
                          </td>
                          <td>{c.contactPerson || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                          <td>
                            {c.industry ? (
                              <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                                {c.industry}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-light)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8125rem' }}>{c.email || '—'}</div>
                            {c.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>}
                          </td>
                          <td>
                            {c.website ? (
                              <a
                                href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.8125rem' }}
                              >
                                {c.website.replace(/^https?:\/\//i, '')}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-light)' }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="action-btn view"
                                data-tooltip="View Details"
                                onClick={() => openViewCompany(c)}
                                aria-label="View company details"
                              >
                                <IconEye />
                              </button>
                              <button
                                className="action-btn edit"
                                data-tooltip="Edit Company"
                                onClick={() => openEditCompany(c)}
                                aria-label="Edit company"
                              >
                                <IconEdit />
                              </button>
                              <button
                                className="action-btn delete"
                                data-tooltip="Delete Company"
                                onClick={() => confirmDeleteCompany(c)}
                                aria-label="Delete company"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TASKS VIEW */}
          {/* ==================================================== */}
          {activeTab === 'Tasks' && (
            <div>
              <div className="section-header">
                <div className="section-header-left">
                  <h2 className="section-title">Tasks & Follow-ups</h2>
                </div>
                <button onClick={openAddTask}>
                  <IconPlus /> Create Task
                </button>
              </div>

              <div className="table-card">
                {loadingData ? (
                  <div>
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><IconCheckSquare /></div>
                    <h3>No tasks available</h3>
                    <p>Keep track of meetings, calls, and follow-ups by creating a task.</p>
                    <button onClick={openAddTask}>
                      <IconPlus /> Create Task
                    </button>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Done</th>
                        <th>Task Title</th>
                        <th>Related Lead</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => {
                        const isDone = t.status === 'Completed';
                        const priorityClass = `priority-${(t.priority || 'medium').toLowerCase()}`;
                        const statusClass = `task-status-${(t.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

                        return (
                          <tr key={t._id} style={{ opacity: isDone ? 0.8 : 1 }}>
                            <td>
                              <button
                                className={`action-btn complete ${isDone ? 'done' : ''}`}
                                data-tooltip={isDone ? 'Mark as In Progress' : 'Mark as Completed'}
                                onClick={() => handleToggleCompleteTask(t)}
                                style={{
                                  backgroundColor: isDone ? 'var(--success-bg)' : 'transparent',
                                  color: isDone ? 'var(--success)' : 'var(--text-light)',
                                  border: '1px solid var(--border-subtle)'
                                }}
                              >
                                <IconCheck />
                              </button>
                            </td>
                            <td>
                              <div style={{
                                fontWeight: 600,
                                textDecoration: isDone ? 'line-through' : 'none',
                                color: isDone ? 'var(--text-muted)' : 'var(--text-main)'
                              }}>
                                {t.title}
                              </div>
                              {t.description && (
                                <small style={{ color: 'var(--text-muted)' }}>
                                  {t.description.length > 40 ? t.description.substring(0, 40) + '...' : t.description}
                                </small>
                              )}
                            </td>
                            <td>
                              {t.lead?.name ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {t.lead.image ? (
                                    <img
                                      src={t.lead.image}
                                      alt={t.lead.name}
                                      className="task-lead-avatar"
                                      title={t.lead.name}
                                      onClick={() => setPreviewImageModal({ isOpen: true, url: t.lead.image, title: t.lead.name })}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  ) : (
                                    <div className="task-lead-avatar-default" title={t.lead.name}>
                                      {getInitials(t.lead.name)}
                                    </div>
                                  )}
                                  <span style={{ fontWeight: 500 }}>{t.lead.name}</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-light)' }}>—</span>
                              )}
                            </td>
                            <td>
                              {t.dueDate ? (
                                <span>{new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              ) : (
                                <span style={{ color: 'var(--text-light)' }}>—</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${priorityClass}`}>
                                {t.priority || 'Medium'}
                              </span>
                            </td>
                            <td>
                              <select
                                className={`badge ${statusClass}`}
                                style={{ cursor: 'pointer', border: 'none', fontWeight: 600 }}
                                value={t.status || 'Pending'}
                                onChange={(e) => handleUpdateTaskStatus(t, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                <button
                                  className="action-btn view"
                                  data-tooltip="View Details"
                                  onClick={() => openViewTask(t)}
                                  aria-label="View task details"
                                >
                                  <IconEye />
                                </button>
                                <button
                                  className="action-btn edit"
                                  data-tooltip="Edit Task"
                                  onClick={() => openEditTask(t)}
                                  aria-label="Edit task"
                                >
                                  <IconEdit />
                                </button>
                                <button
                                  className="action-btn delete"
                                  data-tooltip="Delete Task"
                                  onClick={() => confirmDeleteTask(t)}
                                  aria-label="Delete task"
                                >
                                  <IconTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================== */}
      {/* LEAD MODAL (ADD / EDIT / VIEW) */}
      {/* ==================================================== */}
      <Modal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        title={
          leadModalMode === 'add'
            ? 'Add New Lead'
            : leadModalMode === 'edit'
            ? 'Edit Lead Details'
            : 'Lead Profile'
        }
        footer={
          leadModalMode === 'view' ? (
            <button className="btn-secondary" onClick={() => setLeadModalOpen(false)}>
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setLeadModalOpen(false)}
                disabled={leadSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="lead-form"
                disabled={leadSubmitting}
              >
                {leadSubmitting ? <span className="spinner" /> : leadModalMode === 'add' ? 'Create Lead' : 'Save Changes'}
              </button>
            </>
          )
        }
      >
        {leadModalMode === 'view' && activeLead ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              {activeLead.image ? (
                <img
                  src={activeLead.image}
                  alt={activeLead.name}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                />
              ) : (
                <div className="lead-avatar-default" style={{ width: '64px', height: '64px', fontSize: '1.25rem' }}>
                  {getInitials(activeLead.name)}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.125rem' }}>{activeLead.name}</h3>
                <span className={`badge badge-${activeLead.status ? activeLead.status.toLowerCase().replace(/\s+/g, '-') : 'new'}`} style={{ marginTop: '4px' }}>
                  <span className="badge-dot" />
                  {activeLead.status || 'New'}
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{activeLead.email || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{activeLead.phone || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Company</span>
                <span className="detail-value">{activeLead.company?.name || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Lead Source</span>
                <span className="detail-value">{activeLead.source || '—'}</span>
              </div>
              {activeLead.notes && (
                <div className="detail-item full-width">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{activeLead.notes}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Created At</span>
                <span className="detail-value">
                  {activeLead.createdAt ? new Date(activeLead.createdAt).toLocaleString() : '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Assigned To</span>
                <span className="detail-value">{activeLead.assignedTo?.name || 'Assigned Agent'}</span>
              </div>
            </div>
          </div>
        ) : (
          <form id="lead-form" onSubmit={handleSaveLead} noValidate>
            {/* Lead Image Upload Field */}
            <div className="form-group">
              <label>
                Lead Image <span className="required-asterisk">*</span>
              </label>
              <div className={`lead-image-upload-card ${leadFormErrors.image ? 'has-error' : ''}`}>
                <div className="lead-image-preview-box">
                  {leadFormData.image ? (
                    <img src={leadFormData.image} alt="Lead preview" />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center' }}>No image</span>
                  )}
                </div>
                <div className="lead-image-upload-actions">
                  <label className="btn-upload-label">
                    <IconUpload /> {leadFormData.image ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleLeadImageUpload}
                    />
                  </label>
                  {leadFormData.image && (
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => setLeadFormData((prev) => ({ ...prev, image: '' }))}
                    >
                      Remove image
                    </button>
                  )}
                  <span className="lead-image-help-text">JPG, JPEG, PNG, or WEBP (Max 5 MB)</span>
                </div>
              </div>
              {leadFormErrors.image && <div className="field-error">{leadFormErrors.image}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-name">
                Lead Name <span className="required-asterisk">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                className={leadFormErrors.name ? 'input-error' : ''}
                value={leadFormData.name}
                onChange={(e) => {
                  setLeadFormData({ ...leadFormData, name: e.target.value });
                  if (leadFormErrors.name) setLeadFormErrors({ ...leadFormErrors, name: '' });
                }}
                placeholder="e.g. Ramesh Kumar"
              />
              {leadFormErrors.name && <div className="field-error">{leadFormErrors.name}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lead-email">
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  className={leadFormErrors.email ? 'input-error' : ''}
                  value={leadFormData.email}
                  onChange={(e) => {
                    setLeadFormData({ ...leadFormData, email: e.target.value });
                    if (leadFormErrors.email) setLeadFormErrors({ ...leadFormErrors, email: '' });
                  }}
                  placeholder="ramesh@example.com"
                />
                {leadFormErrors.email && <div className="field-error">{leadFormErrors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="lead-phone">
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <input
                  id="lead-phone"
                  type="text"
                  maxLength={10}
                  className={leadFormErrors.phone ? 'input-error' : ''}
                  value={leadFormData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setLeadFormData({ ...leadFormData, phone: val });
                    if (leadFormErrors.phone) setLeadFormErrors({ ...leadFormErrors, phone: '' });
                  }}
                  placeholder="9876543210"
                />
                {leadFormErrors.phone && <div className="field-error">{leadFormErrors.phone}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lead-company">
                  Company <span className="required-asterisk">*</span>
                </label>
                <select
                  id="lead-company"
                  className={leadFormErrors.company ? 'input-error' : ''}
                  value={leadFormData.company}
                  onChange={(e) => {
                    setLeadFormData({ ...leadFormData, company: e.target.value });
                    if (leadFormErrors.company) setLeadFormErrors({ ...leadFormErrors, company: '' });
                  }}
                >
                  <option value="">Select a Company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {leadFormErrors.company && <div className="field-error">{leadFormErrors.company}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="lead-status">
                  Lead Status <span className="required-asterisk">*</span>
                </label>
                <select
                  id="lead-status"
                  className={leadFormErrors.status ? 'input-error' : ''}
                  value={leadFormData.status}
                  onChange={(e) => {
                    setLeadFormData({ ...leadFormData, status: e.target.value });
                    if (leadFormErrors.status) setLeadFormErrors({ ...leadFormErrors, status: '' });
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
                {leadFormErrors.status && <div className="field-error">{leadFormErrors.status}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lead-source">
                Lead Source <span className="required-asterisk">*</span>
              </label>
              <input
                id="lead-source"
                type="text"
                className={leadFormErrors.source ? 'input-error' : ''}
                value={leadFormData.source}
                onChange={(e) => {
                  setLeadFormData({ ...leadFormData, source: e.target.value });
                  if (leadFormErrors.source) setLeadFormErrors({ ...leadFormErrors, source: '' });
                }}
                placeholder="e.g. Website, Referral, Social Media, Cold Call"
              />
              {leadFormErrors.source && <div className="field-error">{leadFormErrors.source}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-notes">Notes (Optional)</label>
              <textarea
                id="lead-notes"
                value={leadFormData.notes}
                onChange={(e) => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                placeholder="Add background information, deal context, or requirements (optional)..."
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* COMPANY MODAL (ADD / EDIT / VIEW) */}
      {/* ==================================================== */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title={
          companyModalMode === 'add'
            ? 'Add New Company'
            : companyModalMode === 'edit'
            ? 'Edit Company Details'
            : 'Company Details'
        }
        footer={
          companyModalMode === 'view' ? (
            <button className="btn-secondary" onClick={() => setCompanyModalOpen(false)}>
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCompanyModalOpen(false)}
                disabled={companySubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="company-form"
                disabled={companySubmitting}
              >
                {companySubmitting ? <span className="spinner" /> : companyModalMode === 'add' ? 'Add Company' : 'Save Changes'}
              </button>
            </>
          )
        }
      >
        {companyModalMode === 'view' && activeCompany ? (
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Company Name</span>
              <span className="detail-value" style={{ fontWeight: 600 }}>{activeCompany.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Industry</span>
              <span className="detail-value">{activeCompany.industry || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact Person</span>
              <span className="detail-value">{activeCompany.contactPerson || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{activeCompany.email || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{activeCompany.phone || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Website</span>
              <span className="detail-value">
                {activeCompany.website ? (
                  <a
                    href={activeCompany.website.startsWith('http') ? activeCompany.website : `https://${activeCompany.website}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    {activeCompany.website}
                  </a>
                ) : '—'}
              </span>
            </div>
            {activeCompany.address && (
              <div className="detail-item full-width">
                <span className="detail-label">Address</span>
                <span className="detail-value">{activeCompany.address}</span>
              </div>
            )}
            {activeCompany.notes && (
              <div className="detail-item full-width">
                <span className="detail-label">Notes</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{activeCompany.notes}</span>
              </div>
            )}
            {activeCompany.leads && activeCompany.leads.length > 0 && (
              <div className="detail-item full-width" style={{ marginTop: '10px' }}>
                <span className="detail-label">Associated Leads ({activeCompany.leads.length})</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {activeCompany.leads.map((l) => (
                    <span
                      key={l._id}
                      className="badge"
                      style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px' }}
                    >
                      {l.name} ({l.status})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form id="company-form" onSubmit={handleSaveCompany} noValidate>
            <div className="form-group">
              <label htmlFor="company-name">
                Company Name <span className="required-asterisk">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                className={companyFormErrors.name ? 'input-error' : ''}
                value={companyFormData.name}
                onChange={(e) => {
                  setCompanyFormData({ ...companyFormData, name: e.target.value });
                  if (companyFormErrors.name) setCompanyFormErrors({ ...companyFormErrors, name: '' });
                }}
                placeholder="e.g. Tata Consultancy Services"
              />
              {companyFormErrors.name && <div className="field-error">{companyFormErrors.name}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-contact">
                  Contact Person <span className="required-asterisk">*</span>
                </label>
                <input
                  id="company-contact"
                  type="text"
                  className={companyFormErrors.contactPerson ? 'input-error' : ''}
                  value={companyFormData.contactPerson}
                  onChange={(e) => {
                    setCompanyFormData({ ...companyFormData, contactPerson: e.target.value });
                    if (companyFormErrors.contactPerson) setCompanyFormErrors({ ...companyFormErrors, contactPerson: '' });
                  }}
                  placeholder="e.g. Rajesh Sharma"
                />
                {companyFormErrors.contactPerson && <div className="field-error">{companyFormErrors.contactPerson}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="company-industry">
                  Industry <span className="required-asterisk">*</span>
                </label>
                <input
                  id="company-industry"
                  type="text"
                  className={companyFormErrors.industry ? 'input-error' : ''}
                  value={companyFormData.industry}
                  onChange={(e) => {
                    setCompanyFormData({ ...companyFormData, industry: e.target.value });
                    if (companyFormErrors.industry) setCompanyFormErrors({ ...companyFormErrors, industry: '' });
                  }}
                  placeholder="e.g. Information Technology"
                />
                {companyFormErrors.industry && <div className="field-error">{companyFormErrors.industry}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-email">
                  Email Address <span className="required-asterisk">*</span>
                </label>
                <input
                  id="company-email"
                  type="email"
                  className={companyFormErrors.email ? 'input-error' : ''}
                  value={companyFormData.email}
                  onChange={(e) => {
                    setCompanyFormData({ ...companyFormData, email: e.target.value });
                    if (companyFormErrors.email) setCompanyFormErrors({ ...companyFormErrors, email: '' });
                  }}
                  placeholder="contact@tata.com"
                />
                {companyFormErrors.email && <div className="field-error">{companyFormErrors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="company-phone">
                  Phone Number <span className="required-asterisk">*</span>
                </label>
                <input
                  id="company-phone"
                  type="text"
                  maxLength={10}
                  className={companyFormErrors.phone ? 'input-error' : ''}
                  value={companyFormData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCompanyFormData({ ...companyFormData, phone: val });
                    if (companyFormErrors.phone) setCompanyFormErrors({ ...companyFormErrors, phone: '' });
                  }}
                  placeholder="9876543210"
                />
                {companyFormErrors.phone && <div className="field-error">{companyFormErrors.phone}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="company-website">
                Website <span className="required-asterisk">*</span>
              </label>
              <input
                id="company-website"
                type="text"
                className={companyFormErrors.website ? 'input-error' : ''}
                value={companyFormData.website}
                onChange={(e) => {
                  setCompanyFormData({ ...companyFormData, website: e.target.value });
                  if (companyFormErrors.website) setCompanyFormErrors({ ...companyFormErrors, website: '' });
                }}
                placeholder="https://www.tcs.com"
              />
              {companyFormErrors.website && <div className="field-error">{companyFormErrors.website}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="company-address">
                Address <span className="required-asterisk">*</span>
              </label>
              <input
                id="company-address"
                type="text"
                className={companyFormErrors.address ? 'input-error' : ''}
                value={companyFormData.address}
                onChange={(e) => {
                  setCompanyFormData({ ...companyFormData, address: e.target.value });
                  if (companyFormErrors.address) setCompanyFormErrors({ ...companyFormErrors, address: '' });
                }}
                placeholder="Plot No. 1, Sector 2, Electronic City, Bengaluru"
              />
              {companyFormErrors.address && <div className="field-error">{companyFormErrors.address}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="company-notes">Notes (Optional)</label>
              <textarea
                id="company-notes"
                value={companyFormData.notes}
                onChange={(e) => setCompanyFormData({ ...companyFormData, notes: e.target.value })}
                placeholder="Company profile details, account tier, key decision makers (optional)..."
              />
            </div>
          </form>
        )}
      </Modal>

      {/* ==================================================== */}
      {/* TASK MODAL (ADD / EDIT / VIEW) */}
      {/* ==================================================== */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={
          taskModalMode === 'add'
            ? 'Create New Task'
            : taskModalMode === 'edit'
            ? 'Edit Task'
            : 'Task Details'
        }
        footer={
          taskModalMode === 'view' ? (
            <button className="btn-secondary" onClick={() => setTaskModalOpen(false)}>
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setTaskModalOpen(false)}
                disabled={taskSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="task-form"
                disabled={taskSubmitting}
              >
                {taskSubmitting ? <span className="spinner" /> : taskModalMode === 'add' ? 'Create Task' : 'Save Changes'}
              </button>
            </>
          )
        }
      >
        {taskModalMode === 'view' && activeTask ? (
          <div className="detail-grid">
            <div className="detail-item full-width">
              <span className="detail-label">Task Title</span>
              <span className="detail-value" style={{ fontWeight: 600, fontSize: '1rem' }}>{activeTask.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                <span className={`badge task-status-${(activeTask.status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
                  {activeTask.status || 'Pending'}
                </span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Priority</span>
              <span className="detail-value">
                <span className={`badge priority-${(activeTask.priority || 'medium').toLowerCase()}`}>
                  {activeTask.priority || 'Medium'}
                </span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Related Lead</span>
              <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeTask.lead?.image ? (
                  <img
                    src={activeTask.lead.image}
                    alt={activeTask.lead.name}
                    className="task-lead-avatar"
                    style={{ width: '28px', height: '28px' }}
                  />
                ) : activeTask.lead?.name ? (
                  <div className="task-lead-avatar-default" style={{ width: '28px', height: '28px', fontSize: '0.6875rem' }}>
                    {getInitials(activeTask.lead.name)}
                  </div>
                ) : null}
                {activeTask.lead?.name || 'None'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Due Date</span>
              <span className="detail-value">
                {activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : '—'}
              </span>
            </div>
            {activeTask.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Description</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{activeTask.description}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span className="detail-value">{activeTask.assignedTo?.name || 'Agent'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">
                {activeTask.createdAt ? new Date(activeTask.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        ) : (
          <form id="task-form" onSubmit={handleSaveTask} noValidate>
            <div className="form-group">
              <label htmlFor="task-title">
                Task Title <span className="required-asterisk">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                className={taskFormErrors.title ? 'input-error' : ''}
                value={taskFormData.title}
                onChange={(e) => {
                  setTaskFormData({ ...taskFormData, title: e.target.value });
                  if (taskFormErrors.title) setTaskFormErrors({ ...taskFormErrors, title: '' });
                }}
                placeholder="e.g. Schedule discovery call with client"
              />
              {taskFormErrors.title && <div className="field-error">{taskFormErrors.title}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="task-description">
                Description <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="task-description"
                className={taskFormErrors.description ? 'input-error' : ''}
                value={taskFormData.description}
                onChange={(e) => {
                  setTaskFormData({ ...taskFormData, description: e.target.value });
                  if (taskFormErrors.description) setTaskFormErrors({ ...taskFormErrors, description: '' });
                }}
                placeholder="Agenda, discussion points, or preparation steps..."
              />
              {taskFormErrors.description && <div className="field-error">{taskFormErrors.description}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-lead">
                  Related Lead <span className="required-asterisk">*</span>
                </label>
                <select
                  id="task-lead"
                  className={taskFormErrors.lead ? 'input-error' : ''}
                  value={taskFormData.lead}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, lead: e.target.value });
                    if (taskFormErrors.lead) setTaskFormErrors({ ...taskFormErrors, lead: '' });
                  }}
                >
                  <option value="">Select a Related Lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} {l.company?.name ? `(${l.company.name})` : ''}
                    </option>
                  ))}
                </select>
                {taskFormErrors.lead && <div className="field-error">{taskFormErrors.lead}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="task-duedate">
                  Due Date <span className="required-asterisk">*</span>
                </label>
                <input
                  id="task-duedate"
                  type="date"
                  className={taskFormErrors.dueDate ? 'input-error' : ''}
                  value={taskFormData.dueDate}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, dueDate: e.target.value });
                    if (taskFormErrors.dueDate) setTaskFormErrors({ ...taskFormErrors, dueDate: '' });
                  }}
                />
                {taskFormErrors.dueDate && <div className="field-error">{taskFormErrors.dueDate}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority">
                  Priority <span className="required-asterisk">*</span>
                </label>
                <select
                  id="task-priority"
                  className={taskFormErrors.priority ? 'input-error' : ''}
                  value={taskFormData.priority}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, priority: e.target.value });
                    if (taskFormErrors.priority) setTaskFormErrors({ ...taskFormErrors, priority: '' });
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {taskFormErrors.priority && <div className="field-error">{taskFormErrors.priority}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="task-status">
                  Status <span className="required-asterisk">*</span>
                </label>
                <select
                  id="task-status"
                  className={taskFormErrors.status ? 'input-error' : ''}
                  value={taskFormData.status}
                  onChange={(e) => {
                    setTaskFormData({ ...taskFormData, status: e.target.value });
                    if (taskFormErrors.status) setTaskFormErrors({ ...taskFormErrors, status: '' });
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {taskFormErrors.status && <div className="field-error">{taskFormErrors.status}</div>}
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ==========================================
// ROOT APP
// ==========================================
function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
