import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const API = `${BACKEND_URL}/api`;

export const Header = () => {
  const { isDark, toggleTheme, selectedBrand, changeBrand } = useTheme();
  const { user, token } = useAuth();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const getBrandColor = (brandId) => {
    const brand = Array.isArray(brands) ? brands.find(b => b.id === brandId) : null;
    return brand?.color || 'hsl(0, 0%, 98%)';
  };

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-50 flex items-center justify-between px-8" data-testid="header">
      <div className="flex items-center gap-6">
        <Select value={selectedBrand} onValueChange={changeBrand}>
          <SelectTrigger className="w-64 font-heading" data-testid="brand-switcher">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {Array.isArray(brands) && brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.color }} />
                  <span>{brand.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-semibold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-heading font-medium text-foreground">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground font-body">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};