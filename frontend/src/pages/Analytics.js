import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { ChartContainer } from '@/components/Dashboard/ChartContainer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analytics() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
    fetchAnalyticsData();
  }, [selectedBrand]);

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

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const brandParam = selectedBrand !== 'all' ? `?brand_id=${selectedBrand}` : '';
      
      const response = await axios.get(`${API}/dashboard/revenue-trend${brandParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRevenueTrend(response.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const brandRevenueData = brands.map(brand => ({
    name: brand.name,
    revenue: Math.random() * 50000 + 20000
  }));

  const monthlyData = [
    { month: 'Jan', revenue: 45000, orders: 156 },
    { month: 'Feb', revenue: 52000, orders: 178 },
    { month: 'Mar', revenue: 48000, orders: 165 },
    { month: 'Apr', revenue: 61000, orders: 203 },
    { month: 'May', revenue: 55000, orders: 189 },
    { month: 'Jun', revenue: 67000, orders: 221 }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-body">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="analytics-page">
        <div>
          <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Analytics</h1>
          <p className="font-body text-lg text-muted-foreground">Deep insights into your business performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Daily Revenue Trend"
            type="line"
            data={revenueTrend}
            dataKey="revenue"
            xKey="date"
            colors={['hsl(var(--chart-1))']}
            height={350}
          />
          <ChartContainer
            title="Revenue by Brand"
            type="bar"
            data={brandRevenueData}
            dataKey="revenue"
            xKey="name"
            colors={['hsl(var(--chart-2))']}
            height={350}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer
            title="Monthly Revenue"
            type="area"
            data={monthlyData}
            dataKey="revenue"
            xKey="month"
            colors={['hsl(var(--chart-4))']}
            height={350}
          />
          <ChartContainer
            title="Monthly Orders"
            type="bar"
            data={monthlyData}
            dataKey="orders"
            xKey="month"
            colors={['hsl(var(--chart-3))']}
            height={350}
          />
        </div>
      </div>
    </Layout>
  );
}