import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, User, Mail } from 'lucide-react';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

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