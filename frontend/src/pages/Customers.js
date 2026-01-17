import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Mail, Phone, ShoppingBag, DollarSign, FileText, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Customers() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/customers/with-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInvoice = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${API}/search/invoice?order_number=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Found: ${response.data.customer_name}`);
      navigate(`/invoice/${response.data.customer_id}`);
    } catch (error) {
      toast.error('Order number not found');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="customers-page">
        <div>
          <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Customers</h1>
          <p className="font-body text-lg text-muted-foreground">View and manage customer relationships</p>
        </div>

        <div className="bg-secondary border border-border/50 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchInvoice()}
                placeholder="Search by Order Number (e.g., ORD-20260117-XXXXXXXX)"
                className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                data-testid="search-invoice-input"
              />
            </div>
            <button
              onClick={handleSearchInvoice}
              disabled={searching}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50"
              data-testid="search-invoice-button"
            >
              {searching ? 'Searching...' : 'Search Invoice'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground font-body">Loading customers...</p>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-secondary border border-border/50 rounded-lg p-12 text-center">
            <p className="text-muted-foreground font-body text-lg">No customers yet. Orders will automatically create customer profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => {
              const recentOrders = customer.recent_orders || [];
              
              return (
                <div key={customer.id} className="bg-secondary border border-border/50 rounded-lg p-6 hover:border-border hover:shadow-lg transition-all duration-200" data-testid={`customer-card-${customer.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-1">{customer.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail size={14} />
                          <span className="font-body">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone size={14} />
                            <span className="font-body">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag size={16} className="text-chart-3" />
                        <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Orders</p>
                      </div>
                      <p className="text-2xl font-heading font-bold text-foreground">{customer.total_orders}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={16} className="text-success" />
                        <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">LTV</p>
                      </div>
                      <p className="text-2xl font-heading font-bold text-foreground">SAR {customer.lifetime_value.toFixed(0)}</p>
                    </div>
                  </div>

                  {recentOrders.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent Orders:</p>
                      <div className="space-y-1">
                        {recentOrders.map((order) => (
                          <p key={order.id} className="text-xs font-mono text-foreground">
                            {order.order_number}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-body mb-3">
                      Customer since {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <button
                      onClick={() => navigate(`/invoice/${customer.id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-chart-1 text-white hover:bg-chart-1/90 px-4 py-2 rounded-lg font-heading font-medium transition-all duration-200"
                      data-testid={`view-invoice-${customer.id}`}
                    >
                      <FileText size={16} />
                      View Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}