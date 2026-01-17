import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, User, Mail, Shield, Key, Settings as SettingsIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState({});

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await axios.put(
        `${API}/users/${selectedUser.email}/reset-password?new_password=${newPassword}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Password reset for ${selectedUser.email}`);
      setResetDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `${API}/users/${selectedUser.email}/permissions`,
        permissions,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Permissions updated for ${selectedUser.email}`);
      setPermissionsDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const openResetDialog = (userItem) => {
    setSelectedUser(userItem);
    setResetDialogOpen(true);
  };

  const openPermissionsDialog = (userItem) => {
    setSelectedUser(userItem);
    setPermissions(userItem.permissions || {});
    setPermissionsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-8" data-testid="settings-page">
        <div>
          <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Settings</h1>
          <p className="font-body text-lg text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <div className="bg-secondary border border-border/50 rounded-lg p-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                <User size={24} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-heading font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base font-body text-foreground">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                <Mail size={24} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-heading font-medium text-muted-foreground">Email Address</p>
                  <p className="text-base font-body text-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary border border-border/50 rounded-lg p-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">Appearance</h2>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                {isDark ? <Moon size={24} className="text-muted-foreground" /> : <Sun size={24} className="text-muted-foreground" />}
                <div>
                  <p className="text-sm font-heading font-medium text-foreground">Theme</p>
                  <p className="text-sm font-body text-muted-foreground">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-heading font-semibold transition-all duration-200"
                data-testid="theme-toggle-button"
              >
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          <div className="bg-secondary border border-border/50 rounded-lg p-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">About</h2>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Rihla Enterprise Cloud Platform v1.0 - Multi-brand e-commerce command center for managing
              Rihla Abaya, Rihla Atelier, Rihla Technologies, and Rihla Brand Journey.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}