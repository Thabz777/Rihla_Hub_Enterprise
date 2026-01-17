import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Employees', href: '/employees', icon: UserCog },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-secondary border-r border-border/50 flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border/50">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground" data-testid="sidebar-logo">
          Rihla
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Enterprise Cloud</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              data-testid={`nav-${item.name.toLowerCase()}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={logout}
          data-testid="logout-button"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-medium text-destructive hover:bg-destructive/10 w-full transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};