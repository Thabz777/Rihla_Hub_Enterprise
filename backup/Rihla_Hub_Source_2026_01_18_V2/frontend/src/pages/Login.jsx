import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Smartphone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, verify2FA } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auth Flow State
  const [authStep, setAuthStep] = useState('login'); // 'login', 'setup', 'verify'
  const [setupData, setSetupData] = useState(null); // { qr_code, temp_secret }
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [twoFaCode, setTwoFaCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);

      if (res.access_token) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else if (res.status === 'setup_2fa') {
        setSetupData(res);
        setAuthStep('setup');
        toast.info('Please set up 2-Factor Authentication');
      } else if (res.status === '2fa_required') {
        setAuthStep('verify');
        toast.info('Enter your 2FA Code');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempSecret = authStep === 'setup' ? setupData?.temp_secret : undefined;
      await verify2FA(formData.email, twoFaCode, tempSecret);

      toast.success('Authentication Verified!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid Verification Code');
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
            Secure multi-brand command center
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">

          {authStep === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="font-display text-4xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="font-body text-muted-foreground">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6" data-testid="login-form">
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
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
              </form>
            </>
          )}

          {authStep === 'setup' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Smartphone size={32} />
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Setup 2-Factor Auth</h2>
                <p className="text-sm text-muted-foreground">Scan this QR code with Microsoft Authenticator or Google Authenticator</p>
              </div>

              <div className="flex justify-center p-4 bg-white rounded-xl border border-border shadow-sm">
                {setupData?.qr_code && (
                  <img src={setupData.qr_code} alt="2FA QR Code" className="w-48 h-48" />
                )}
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-heading font-medium text-foreground">Enter 6-digit Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-center text-xl tracking-widest focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                    placeholder="000 000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || twoFaCode.length !== 6}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </form>
            </div>
          )}

          {authStep === 'verify' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">2-Factor Verification</h2>
                <p className="text-sm text-muted-foreground">Enter the code from your authenticator app</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-heading font-medium text-foreground">Authentication Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-center text-xl tracking-widest focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                    placeholder="000 000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || twoFaCode.length !== 6}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthStep('login')}
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            </div>
          )}

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