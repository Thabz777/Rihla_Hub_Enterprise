import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { ChartContainer } from '@/components/Dashboard/ChartContainer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analytics() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [revenueTrend, setRevenueTrend] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
    fetchAnalyticsData();
  }, [selectedBrand, selectedYear, selectedMonth]);

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
      const params = new URLSearchParams();
      // Only add brand_id if it's valid (not 'all', undefined, or null)
      const isValidBrand = selectedBrand && selectedBrand !== 'all' && selectedBrand !== 'undefined' && selectedBrand !== 'null';
      if (isValidBrand) params.append('brand_id', selectedBrand);
      if (selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);

      const [trendRes, userPerfRes] = await Promise.all([
        axios.get(`${API}/dashboard/revenue-trend?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/analytics/user-performance`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setRevenueTrend(trendRes.data);
      setUserPerformance(userPerfRes.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for other charts
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

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 2050 - 2023 + 1 }, (_, i) => (2023 + i).toString());

  return (
    <Layout>
      <div className="space-y-8" data-testid="analytics-page">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Analytics</h1>
            <p className="font-body text-lg text-muted-foreground">Deep insights into your business performance</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-body">Loading report...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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

            {/* User Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="User Performance (Revenue)"
                type="bar"
                data={userPerformance}
                dataKey="revenue"
                xKey="name"
                colors={['hsl(var(--chart-5))']}
                height={350}
              />
              <ChartContainer
                title="User Performance (Orders)"
                type="bar"
                data={userPerformance}
                dataKey="orders_count"
                xKey="name"
                colors={['hsl(var(--chart-3))']}
                height={350}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                title="Monthly Revenue (Projection)"
                type="area"
                data={monthlyData}
                dataKey="revenue"
                xKey="month"
                colors={['hsl(var(--chart-4))']}
                height={350}
              />
              <ChartContainer
                title="Monthly Orders (Projection)"
                type="bar"
                data={monthlyData}
                dataKey="orders"
                xKey="month"
                colors={['hsl(var(--chart-3))']}
                height={350}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}