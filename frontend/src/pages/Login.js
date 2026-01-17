import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type) => {
    setLoading(true);
    try {
      if (type === 'admin') {
        await login('admin@rihla.com', 'admin123');
        toast.success('Logged in as Admin!');
      } else {
        await login('user@rihla.com', 'user123');
        toast.success('Logged in as User!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-secondary to-accent items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="font-display text-6xl font-bold text-primary-foreground mb-6 tracking-tighter">
            Rihla
          </h1>
          <p className="font-heading text-2xl text-primary-foreground/90 mb-4">
            Enterprise Cloud Platform
          </p>
          <p className="font-body text-lg text-primary-foreground/70">
            Multi-brand e-commerce command center for luxury retail excellence
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="font-body text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Quick Login Buttons */}
          <div className="mb-6 space-y-3">
            <p className="text-sm font-heading font-medium text-muted-foreground mb-3">Quick Login:</p>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-chart-1 text-white hover:bg-chart-1/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="quick-login-admin"
            >
              <Shield size={20} />
              Login as Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-chart-3 text-white hover:bg-chart-3/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="quick-login-user"
            >
              <User size={20} />
              Login as User
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-body">Or login with credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-heading font-medium text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                placeholder="you@example.com"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-heading font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground pr-12"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-button"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-secondary/50 rounded-lg border border-border/50">
            <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-sm font-body text-foreground">
              <p><strong>Admin:</strong> admin@rihla.com / admin123</p>
              <p><strong>User:</strong> user@rihla.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}