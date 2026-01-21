import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Plus, Filter, Edit2, Trash2, Target, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/Dashboard/KPICard';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Employees() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    brand_id: '',
    salary: 0,
    bonus: 0,
    target: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchBrands();
    fetchEmployees();
    fetchStats();
  }, [selectedBrand, departmentFilter, statusFilter]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Only add brand_id if it's valid (not 'all', undefined, or null)
      const isValidBrand = selectedBrand && selectedBrand !== 'all' && selectedBrand !== 'undefined' && selectedBrand !== 'null';
      if (isValidBrand) params.append('brand_id', selectedBrand);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${API}/employees?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Only add brand_id if it's valid
      const isValidBrand = selectedBrand && selectedBrand !== 'all' && selectedBrand !== 'undefined' && selectedBrand !== 'null';
      const params = isValidBrand ? `?brand_id=${selectedBrand}` : '';
      const response = await axios.get(`${API}/employees/stats${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.brand_id) {
      toast.error('Please select a brand');
      return;
    }
    try {
      await axios.post(`${API}/employees`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Employee added successfully!');
      setDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        brand_id: '',
        salary: 0,
        bonus: 0,
        target: 0,
        status: 'active'
      });
      fetchEmployees();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await axios.put(`${API}/employees/${selectedEmployee._id || selectedEmployee.id}`, {
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        brand_id: formData.brand_id,
        salary: formData.salary,
        bonus: formData.bonus,
        target: formData.target,
        achieved: formData.achieved,
        status: formData.status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Employee updated successfully!');
      setEditDialogOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Employee deleted successfully!');
      fetchEmployees();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const openEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department,
      brand_id: employee.brand_id,
      salary: employee.salary,
      bonus: employee.bonus,
      target: employee.target,
      achieved: employee.achieved || 0,
      status: employee.status
    });
    setEditDialogOpen(true);
  };

  const departments = ['Sales', 'Marketing', 'Operations', 'Technology', 'Customer Service', 'Finance', 'HR'];
  const statusColors = {
    active: 'hsl(var(--success))',
    inactive: 'hsl(var(--muted-foreground))',
    onleave: 'hsl(var(--warning))'
  };

  const getAchievementColor = (achieved, target) => {
    if (!target) return 'hsl(var(--muted-foreground))';
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return 'hsl(var(--success))';
    if (percentage >= 75) return 'hsl(var(--chart-3))';
    if (percentage >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="employees-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Employees</h1>
            <p className="font-body text-lg text-muted-foreground">Manage team members, salaries, bonuses & targets</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200" data-testid="add-employee-button">
                <Plus size={20} />
                Add Employee
              </button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee} className="space-y-4" data-testid="create-employee-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-name-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-email-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-phone-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Position *</label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-position-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Department *</label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })} required>
                      <SelectTrigger className="w-full mt-2" data-testid="department-select">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Brand *</label>
                    <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })} required>
                      <SelectTrigger className="w-full mt-2" data-testid="brand-select">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Salary (SAR) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-salary-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Bonus (SAR)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-bonus-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Target (SAR)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="employee-target-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 mt-6"
                  data-testid="submit-employee-button"
                >
                  Add Employee
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Employees"
              value={stats.total_employees}
              icon={Users}
              brandColor="hsl(var(--chart-1))"
            />
            <KPICard
              title="Active Employees"
              value={stats.active_employees}
              icon={Users}
              brandColor="hsl(var(--success))"
            />
            <KPICard
              title="Total Salary"
              value={stats.total_salary}
              format="currency"
              icon={DollarSign}
              brandColor="hsl(var(--chart-2))"
            />
            <KPICard
              title="Avg Achievement"
              value={`${stats.avg_achievement_rate}%`}
              icon={TrendingUp}
              brandColor="hsl(var(--chart-3))"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48" data-testid="department-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="onleave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-secondary border border-border/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="employees-table">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Employee</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Position</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Department</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Salary</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Bonus</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Target Achievement</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-muted-foreground font-body">
                      No employees found. Add your first team member!
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => {
                    const achieved = employee.achieved || 0;
                    const target = employee.target || 0;
                    const rawPct = target > 0 ? (achieved / target) * 100 : 0;
                    // Use numbers for Math.min, string for display
                    const achievementPercentage = rawPct.toFixed(1);
                    const widthPct = Math.min(rawPct || 0, 100); // Guard against NaN
                    return (
                      <tr key={employee._id || employee.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150" data-testid={`employee-row-${employee._id || employee.id}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-body font-medium text-foreground">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                            {employee.phone && <p className="text-xs text-muted-foreground">{employee.phone}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-body text-foreground">{employee.position}</td>
                        <td className="px-4 py-3 text-sm font-body text-foreground">{employee.department}</td>
                        <td className="px-4 py-3 text-sm font-body text-foreground">{employee.brand_name}</td>
                        <td className="px-4 py-3 text-sm font-body font-medium text-foreground">SAR {(employee.salary || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-body font-medium text-success">SAR {(employee.bonus || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${widthPct}%`,
                                  backgroundColor: getAchievementColor(achieved, target)
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-mono font-medium"
                              style={{ color: getAchievementColor(achieved, target) }}
                            >
                              {achievementPercentage}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            SAR {achieved.toLocaleString()} / {target.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-heading font-medium uppercase tracking-wide"
                            style={{
                              backgroundColor: `${statusColors[employee.status]}15`,
                              color: statusColors[employee.status],
                              border: `1px solid ${statusColors[employee.status]}50`
                            }}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditDialog(employee)}
                              className="p-2 hover:bg-background rounded-lg transition-colors duration-200"
                              data-testid={`edit-employee-${employee._id || employee.id}`}
                            >
                              <Edit2 size={16} className="text-chart-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee._id || employee.id)}
                              className="p-2 hover:bg-background rounded-lg transition-colors duration-200"
                              data-testid={`delete-employee-${employee._id || employee.id}`}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Employee Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-popover border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Department</label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Brand</label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Salary (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Bonus (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Target (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Achieved (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.achieved}
                    onChange={(e) => setFormData({ ...formData, achieved: parseFloat(e.target.value) })}
                    className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="onleave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 mt-6"
              >
                Update Employee
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
