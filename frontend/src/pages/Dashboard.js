import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { KPICard } from '@/components/Dashboard/KPICard';
import { ChartContainer } from '@/components/Dashboard/ChartContainer';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBrand]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const brandParam = selectedBrand !== 'all' ? `?brand_id=${selectedBrand}` : '';
      
      const [metricsRes, trendRes, ordersRes] = await Promise.all([
        axios.get(`${API}/dashboard/metrics${brandParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/dashboard/revenue-trend${brandParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/orders?${new URLSearchParams({ ...(selectedBrand !== 'all' && { brand_id: selectedBrand }) })}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMetrics(metricsRes.data);
      setRevenueTrend(trendRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'hsl(var(--warning))',
    processing: 'hsl(var(--chart-3))',
    completed: 'hsl(var(--success))',
    cancelled: 'hsl(var(--destructive))'
  };

  const orderStatusData = [
    { name: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length },
    { name: 'Processing', value: recentOrders.filter(o => o.status === 'processing').length },
    { name: 'Completed', value: recentOrders.filter(o => o.status === 'completed').length },
    { name: 'Cancelled', value: recentOrders.filter(o => o.status === 'cancelled').length }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-body">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard-page">
        <div>
          <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            Welcome to your multi-brand command center
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Revenue"
            value={metrics?.total_revenue || 0}
            change={metrics?.revenue_change}
            icon={DollarSign}
            format="currency"
            brandColor="hsl(var(--success))"
          />
          <KPICard
            title="Total Orders"
            value={metrics?.total_orders || 0}
            change={metrics?.orders_change}
            icon={ShoppingCart}
            brandColor="hsl(var(--chart-3))"
          />
          <KPICard
            title="Customers"
            value={metrics?.total_customers || 0}
            icon={Users}
            brandColor="hsl(var(--chart-1))"
          />
          <KPICard
            title="Products"
            value={metrics?.total_products || 0}
            icon={Package}
            brandColor="hsl(var(--chart-2))"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer
              title="Revenue Trend (Last 30 Days)"
              type="area"
              data={revenueTrend}
              dataKey="revenue"
              xKey="date"
              colors={['hsl(var(--chart-1))']}
              height={350}
            />
          </div>
          <div>
            <ChartContainer
              title="Order Status"
              type="pie"
              data={orderStatusData}
              dataKey="value"
              xKey="name"
              colors={[
                statusColors.pending,
                statusColors.processing,
                statusColors.completed,
                statusColors.cancelled
              ]}
              height={350}
            />
          </div>
        </div>

        <div className="bg-secondary border border-border/50 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="recent-orders-table">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Order #</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Customer</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground font-body">
                      No orders yet. Create your first order!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm font-mono text-foreground">{order.order_number}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.brand_name}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">SAR {order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-heading font-medium uppercase tracking-wide`}
                          style={{
                            backgroundColor: `${statusColors[order.status]}15`,
                            color: statusColors[order.status],
                            border: `1px solid ${statusColors[order.status]}50`
                          }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}