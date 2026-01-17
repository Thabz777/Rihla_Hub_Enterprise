import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Plus, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Orders() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    brand_id: '',
    product_id: '',
    category: '',
    items_count: 1,
    currency: 'SAR',
    subtotal: 0,
    apply_vat: true,
    shipping_charges: 0,
    status: 'pending'
  });

  useEffect(() => {
    fetchBrands();
    fetchProducts();
    fetchOrders();
  }, [selectedBrand, statusFilter]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand !== 'all') params.append('brand_id', selectedBrand);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`${API}/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_email && !formData.customer_phone) {
      toast.error('Please provide either email or phone number');
      return;
    }
    
    try {
      await axios.post(`${API}/orders`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order created successfully!');
      setDialogOpen(false);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        brand_id: '',
        product_id: '',
        category: '',
        items_count: 1,
        currency: 'SAR',
        subtotal: 0,
        apply_vat: true,
        shipping_charges: 0,
        status: 'pending'
      });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
    }
  };

  const calculateTotal = () => {
    const vatRate = formData.apply_vat ? (formData.currency === 'SAR' ? 0.15 : 0.18) : 0;
    const vat = formData.subtotal * vatRate;
    const total = formData.subtotal + vat + formData.shipping_charges;
    return { vat, total, vatRate };
  };

  const { vat, total, vatRate } = calculateTotal();

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        product_id: productId,
        brand_id: product.brand_id,
        category: product.category,
        subtotal: product.price * formData.items_count
      });
    }
  };

  const filteredProducts = formData.brand_id 
    ? products.filter(p => p.brand_id === formData.brand_id)
    : products;

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const statusColors = {
    pending: 'hsl(var(--warning))',
    processing: 'hsl(var(--chart-3))',
    completed: 'hsl(var(--success))',
    cancelled: 'hsl(var(--destructive))'
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="orders-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Orders</h1>
            <p className="font-body text-lg text-muted-foreground">Manage orders across all brands</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200" data-testid="create-order-button">
                <Plus size={20} />
                New Order
              </button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Create New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-5" data-testid="create-order-form">
                {/* Customer Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-heading font-semibold uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Customer Information</h3>
                  
                  <div>
                    <label className="block text-sm font-heading font-medium text-foreground mb-2">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="customer-name-input"
                      placeholder="Enter customer name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Customer Email</label>
                      <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                        data-testid="customer-email-input"
                        placeholder="customer@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Customer Phone</label>
                      <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                        data-testid="customer-phone-input"
                        placeholder="+966 5XX XXX XXX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-heading font-medium text-foreground mb-2">Customer Address</label>
                    <textarea
                      value={formData.customer_address}
                      onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground resize-none"
                      data-testid="customer-address-input"
                      placeholder="Enter customer address"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-heading font-semibold uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Order Details</h3>
                  
                  <div>
                    <label className="block text-sm font-heading font-medium text-foreground mb-2">Brand *</label>
                    <Select 
                      value={formData.brand_id} 
                      onValueChange={(value) => setFormData({ ...formData, brand_id: value, product_id: '', category: '', subtotal: 0 })}
                      required
                    >
                      <SelectTrigger className="w-full" data-testid="brand-select">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Select Product *</label>
                      <Select 
                        value={formData.product_id} 
                        onValueChange={handleProductSelect} 
                        required
                        disabled={!formData.brand_id}
                      >
                        <SelectTrigger className="w-full" data-testid="product-select">
                          <SelectValue placeholder={formData.brand_id ? "Choose from inventory" : "Select brand first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredProducts.length === 0 ? (
                            <div className="px-2 py-4 text-sm text-muted-foreground text-center">No products available</div>
                          ) : (
                            filteredProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - SAR {product.price} (Stock: {product.stock})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Category</label>
                      <input
                        type="text"
                        value={formData.category}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base text-foreground"
                        data-testid="category-input"
                        placeholder="Auto-filled from product"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Items Count *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.items_count}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 1;
                          const product = products.find(p => p.id === formData.product_id);
                          setFormData({ 
                            ...formData, 
                            items_count: count,
                            subtotal: product ? product.price * count : 0
                          });
                        }}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                        data-testid="items-count-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Currency *</label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger className="w-full" data-testid="currency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                          <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Order Summary Section */}
                <div className="bg-accent rounded-lg p-5 space-y-3 border border-border">
                  <h3 className="text-sm font-heading font-semibold uppercase tracking-wide text-muted-foreground">Order Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground">Subtotal:</span>
                    <span className="font-mono font-medium text-foreground">{formData.currency} {formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground">VAT ({(vatRate * 100).toFixed(0)}%):</span>
                    <span className="font-mono font-medium text-foreground">{formData.currency} {vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-border">
                    <span className="font-heading text-lg font-bold text-foreground">Total:</span>
                    <span className="font-mono text-lg font-bold text-foreground">{formData.currency} {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!formData.product_id || (!formData.customer_email && !formData.customer_phone)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="submit-order-button"
                >
                  Create Order
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-secondary border border-border/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="orders-table">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Order #</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Customer</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Product</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Items</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground font-body">
                      No orders found. Create your first order!
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150" data-testid={`order-row-${order.id}`}>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{order.customer_name}</p>
                          {order.customer_email && <p className="text-xs text-muted-foreground">{order.customer_email}</p>}
                          {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.product_name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.brand_name}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.items_count}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{order.currency} {order.total.toFixed(2)}</p>
                          {order.vat_amount && (
                            <p className="text-xs text-muted-foreground">VAT: {order.currency} {order.vat_amount.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={order.status} onValueChange={(value) => handleUpdateStatus(order.id, value)}>
                          <SelectTrigger 
                            className="w-32 h-8 text-xs"
                            style={{
                              backgroundColor: `${statusColors[order.status]}15`,
                              color: statusColors[order.status],
                              border: `1px solid ${statusColors[order.status]}50`
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
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