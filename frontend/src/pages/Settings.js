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
              {user?.role && (
                <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
                  <Shield size={24} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-heading font-medium text-muted-foreground">Role</p>
                    <p className="text-base font-body text-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              )}
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

          {isAdmin && (
            <div className="bg-secondary border border-border/50 rounded-lg p-6">
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Shield size={24} />
                User Management (Admin Only)
              </h2>
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
                    <div className="flex-1">
                      <p className="text-base font-heading font-medium text-foreground">{userItem.full_name}</p>
                      <p className="text-sm text-muted-foreground">{userItem.email}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">Role: {userItem.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openResetDialog(userItem)}
                        className="flex items-center gap-2 px-4 py-2 bg-chart-3 text-white hover:bg-chart-3/90 rounded-lg font-heading font-medium transition-all duration-200"
                        data-testid={`reset-password-${userItem.email}`}
                      >
                        <Key size={16} />
                        Reset Password
                      </button>
                      <button
                        onClick={() => openPermissionsDialog(userItem)}
                        className="flex items-center gap-2 px-4 py-2 bg-chart-1 text-white hover:bg-chart-1/90 rounded-lg font-heading font-medium transition-all duration-200"
                        data-testid={`manage-permissions-${userItem.email}`}
                      >
                        <SettingsIcon size={16} />
                        Permissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-secondary border border-border/50 rounded-lg p-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">About</h2>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Rihla Enterprise Cloud Platform v1.0 - Multi-brand e-commerce command center for managing
              Rihla Abaya, Rihla Atelier, Rihla Technologies, and Rihla Brand Journey.
            </p>
          </div>
        </div>

        {/* Reset Password Dialog */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent className="bg-popover border-border">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reset password for: <strong>{selectedUser?.email}</strong>
              </p>
              <div>
                <label className="text-sm font-heading font-medium text-foreground">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  placeholder="Enter new password"
                  data-testid="new-password-input"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Password
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="bg-popover border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Manage Permissions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Update permissions for: <strong>{selectedUser?.email}</strong>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.dashboard || false}
                    onChange={(e) => setPermissions({...permissions, dashboard: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Dashboard Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.orders || false}
                    onChange={(e) => setPermissions({...permissions, orders: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Orders Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.inventory || false}
                    onChange={(e) => setPermissions({...permissions, inventory: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Inventory Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.customers || false}
                    onChange={(e) => setPermissions({...permissions, customers: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Customers Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.employees || false}
                    onChange={(e) => setPermissions({...permissions, employees: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Employees Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.analytics || false}
                    onChange={(e) => setPermissions({...permissions, analytics: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Analytics Access</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.can_create || false}
                    onChange={(e) => setPermissions({...permissions, can_create: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Can Create</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.can_edit || false}
                    onChange={(e) => setPermissions({...permissions, can_edit: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Can Edit</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                  <input
                    type="checkbox"
                    checked={permissions.can_delete || false}
                    onChange={(e) => setPermissions({...permissions, can_delete: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-body text-foreground">Can Delete</span>
                </label>
              </div>
              <button
                onClick={handleUpdatePermissions}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200"
              >
                Update Permissions
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}