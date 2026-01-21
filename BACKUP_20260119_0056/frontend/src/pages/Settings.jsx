import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, User, Mail, Shield, Key, Settings as SettingsIcon, Plus, UserCheck, ShieldOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Dialog States
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  // Form States
  const [newPassword, setNewPassword] = useState('');
  const [permissions, setPermissions] = useState({});
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user',
    employee_id: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`User ${newUser.full_name} created successfully`);
      setAddUserDialogOpen(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'user', employee_id: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEmployeeSelect = (empId) => {
    if (empId === 'none') {
      setNewUser({ ...newUser, employee_id: '', full_name: '', email: '' });
      return;
    }
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setNewUser({
        ...newUser,
        employee_id: emp.id,
        full_name: emp.name,
        email: emp.email
      });
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

  const handleReset2FA = async (userItem) => {
    if (!confirm(`Are you sure you want to reset 2FA for ${userItem.email}? They will need to set up 2FA again on next login.`)) return;

    try {
      await axios.put(
        `${API}/users/${userItem.email}/reset-2fa`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`2FA has been reset for ${userItem.email}`);
    } catch (error) {
      toast.error('Failed to reset 2FA');
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Shield size={24} />
                  User Management (Admin Only)
                </h2>
                <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-heading font-semibold transition-all duration-200">
                      <Plus size={16} />
                      Add New User
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover border-border">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl">Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      {/* Link to Employee */}
                      <div>
                        <label className="text-sm font-heading font-medium text-foreground flex items-center gap-2">
                          <UserCheck size={16} className="text-primary" />
                          Link to Employee (Optional)
                        </label>
                        <Select onValueChange={handleEmployeeSelect}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select an Employee to auto-fill" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.position})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t border-border/50 my-4"></div>

                      <div>
                        <label className="text-sm font-heading font-medium text-foreground">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                          className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-heading font-medium text-foreground">Email</label>
                        <input
                          type="email"
                          required
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-heading font-medium text-foreground">Password</label>
                        <input
                          type="password"
                          required
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-heading font-medium text-foreground">Role</label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 mt-4"
                      >
                        Create User
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {users.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-heading font-medium text-foreground">{userItem.full_name}</p>
                        {userItem.employee_id && (
                          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">LINKED</span>
                        )}
                      </div>
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
                      <button
                        onClick={() => handleReset2FA(userItem)}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-white hover:bg-destructive/90 rounded-lg font-heading font-medium transition-all duration-200"
                        data-testid={`reset-2fa-${userItem.email}`}
                      >
                        <ShieldOff size={16} />
                        Reset 2FA
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
              Rihla Enterprise Cloud Platform v1.0
            </p>
          </div>
        </div>

        {/* Existing Dialogs (Reset/Permissions) - kept same */}
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
                {Object.keys(permissions).map((perm) => (
                  <label key={perm} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border cursor-pointer hover:border-ring transition-colors">
                    <input
                      type="checkbox"
                      checked={permissions[perm] || false}
                      onChange={(e) => setPermissions({ ...permissions, [perm]: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-body text-foreground capitalize">{perm.replace(/_/g, ' ')} Access</span>
                  </label>
                ))}
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