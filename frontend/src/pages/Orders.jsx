import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Plus, Filter, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    items: [{ product_id: '', quantity: 1 }],
    category: '',
    currency: 'SAR',
    apply_vat: true,
    shipping_charges: 0,
    payment_method: 'Credit Card',
    status: 'pending'
  });

  useEffect(() => {
    fetchBrands();
    fetchProducts();
    fetchOrders();
  }, [selectedBrand, statusFilter]);

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Only add brand_id if it's valid (not 'all', undefined, or null)
      const isValidBrand = selectedBrand && selectedBrand !== 'all' && selectedBrand !== 'undefined' && selectedBrand !== 'null';
      if (isValidBrand) params.append('brand_id', selectedBrand);
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

    const validItems = formData.items.filter(item => item.product_id);
    if (validItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      await axios.post(`${API}/orders`, { ...formData, items: validItems }, {
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
        items: [{ product_id: '', quantity: 1 }],
        category: '',
        currency: 'SAR',
        apply_vat: true,
        shipping_charges: 0,
        payment_method: 'Cash on delivery',
        status: 'pending'
      });
      fetchOrders();
      fetchProducts();
    } catch (error) {
      console.error('Order creation failed:', error.response?.data || error);
      let errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to create order';

      // Clean up Mongoose validation errors for better UI
      if (errorMsg.includes('Order validation failed:')) {
        errorMsg = errorMsg.replace('Order validation failed:', '').trim();
        // If specific path error, try to show just that
        if (errorMsg.includes('payment_method:')) {
          errorMsg = 'Invalid Payment Method selected';
        }
      }

      toast.error(errorMsg);
    }
  };

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

  const calculateOrderTotal = () => {
    let subtotal = 0;
    formData.items.forEach(item => {
      const product = products.find(p => (p._id || p.id) === item.product_id);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    });

    const vatRate = formData.apply_vat ? (formData.currency === 'SAR' ? 0.15 : 0.18) : 0;
    const vat = subtotal * vatRate;
    const total = subtotal + vat + (formData.shipping_charges || 0);

    return { subtotal, vat, total, vatRate };
  };

  const { subtotal, vat, total, vatRate } = calculateOrderTotal();

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems.length > 0 ? newItems : [{ product_id: '', quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const filteredProducts = formData.brand_id
    ? products.filter(p => (p.brand_id === formData.brand_id) || (p.brand_id?.toString() === formData.brand_id))
    : products;

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
            <DialogContent className="bg-popover border-border max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Create New Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-5" data-testid="create-order-form">
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

                <div className="space-y-4">
                  <h3 className="text-sm font-heading font-semibold uppercase tracking-wide text-muted-foreground border-b border-border pb-2">Order Details</h3>

                  <div>
                    <label className="block text-sm font-heading font-medium text-foreground mb-2">Brand *</label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value) => setFormData({ ...formData, brand_id: value, items: [{ product_id: '', quantity: 1 }] })}
                      required
                    >
                      <SelectTrigger className="w-full" data-testid="brand-select">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id || brand.id} value={brand._id || brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-heading font-medium text-foreground">Products *</label>
                      <button
                        type="button"
                        onClick={addItem}
                        disabled={!formData.brand_id}
                        className="flex items-center gap-1 text-sm bg-chart-3 text-white hover:bg-chart-3/90 px-3 py-1.5 rounded-lg font-heading font-medium transition-all duration-200 disabled:opacity-50"
                        data-testid="add-product-button"
                      >
                        <Plus size={16} />
                        Add Product
                      </button>
                    </div>

                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end bg-background p-4 rounded-lg border border-border">
                        <div className="flex-1">
                          <label className="block text-xs font-heading font-medium text-muted-foreground mb-2">Product {index + 1}</label>
                          <Select
                            value={item.product_id}
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                            disabled={!formData.brand_id}
                          >
                            <SelectTrigger className="w-full" data-testid={`product-select-${index}`}>
                              <SelectValue placeholder={formData.brand_id ? "Choose product" : "Select brand first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredProducts.map((product) => (
                                <SelectItem key={product._id || product.id} value={product._id || product.id}>
                                  {product.name} - {product.currency || 'SAR'} {product.price} (Stock: {product.stock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-heading font-medium text-muted-foreground mb-2">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                            data-testid={`quantity-input-${index}`}
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all duration-200"
                            data-testid={`remove-item-${index}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Payment Method *</label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger className="w-full" data-testid="payment-method-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Mada">Mada</SelectItem>
                          <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                          <SelectItem value="STC Pay">STC Pay</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                      <input
                        type="checkbox"
                        id="apply_vat"
                        checked={formData.apply_vat}
                        onChange={(e) => setFormData({ ...formData, apply_vat: e.target.checked })}
                        className="w-5 h-5 rounded border-border"
                        data-testid="apply-vat-checkbox"
                      />
                      <label htmlFor="apply_vat" className="text-sm font-heading font-medium text-foreground cursor-pointer">
                        Apply VAT ({formData.currency === 'SAR' ? '15%' : '18%'})
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-heading font-medium text-foreground mb-2">Shipping Charges</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.shipping_charges}
                        onChange={(e) => setFormData({ ...formData, shipping_charges: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                        data-testid="shipping-charges-input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-accent rounded-lg p-5 space-y-3 border border-border">
                  <h3 className="text-sm font-heading font-semibold uppercase tracking-wide text-muted-foreground">Order Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-foreground">Subtotal ({formData.items.filter(i => i.product_id).length} items):</span>
                    <span className="font-mono font-medium text-foreground">{formData.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  {formData.apply_vat && (
                    <div className="flex justify-between items-center">
                      <span className="font-body text-sm text-foreground">VAT ({(vatRate * 100).toFixed(0)}%):</span>
                      <span className="font-mono font-medium text-foreground">{formData.currency} {vat.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.shipping_charges > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-body text-sm text-foreground">Shipping:</span>
                      <span className="font-mono font-medium text-foreground">{formData.currency} {formData.shipping_charges.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-border">
                    <span className="font-heading text-lg font-bold text-foreground">Total:</span>
                    <span className="font-mono text-lg font-bold text-foreground">{formData.currency} {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!formData.brand_id || (!formData.customer_email && !formData.customer_phone)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Products</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Payment</th>
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
                    <tr key={order._id || order.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150" data-testid={`order-row-${order._id || order.id}`}>
                      <td className="px-4 py-3 text-sm font-mono text-foreground">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{order.customer_name}</p>
                          {order.customer_email && <p className="text-xs text-muted-foreground">{order.customer_email}</p>}
                          {order.customer_phone && <p className="text-xs text-muted-foreground">{order.customer_phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-xs text-foreground">
                                {item.product_name} (x{item.quantity})
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.brand_name}</td>
                      <td className="px-4 py-3 text-sm font-body text-foreground">{order.payment_method || '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-body font-medium text-foreground">{order.currency} {(order.total || 0).toFixed(2)}</p>
                          {(order.vat_amount || 0) > 0 && (
                            <p className="text-xs text-muted-foreground">VAT: {order.currency} {(order.vat_amount || 0).toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select value={order.status} onValueChange={(value) => handleUpdateStatus(order._id || order.id, value)}>
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
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
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
