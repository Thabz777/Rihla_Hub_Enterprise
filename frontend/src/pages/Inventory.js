import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Inventory() {
  const { token } = useAuth();
  const { selectedBrand } = useTheme();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand_id: '',
    category: '',
    stock: 0,
    price: 0,
    image_url: ''
  });

  useEffect(() => {
    fetchBrands();
    fetchProducts();
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = selectedBrand !== 'all' ? `?brand_id=${selectedBrand}` : '';
      const response = await axios.get(`${API}/products${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product created successfully!');
      setDialogOpen(false);
      setFormData({
        sku: '',
        name: '',
        brand_id: '',
        category: '',
        stock: 0,
        price: 0,
        image_url: ''
      });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await axios.put(`${API}/products/${productId}?stock=${newStock}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Stock updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'hsl(var(--destructive))' };
    if (stock < 10) return { label: 'Low Stock', color: 'hsl(var(--warning))' };
    return { label: 'In Stock', color: 'hsl(var(--success))' };
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="inventory-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold text-foreground mb-2 tracking-tight">Inventory</h1>
            <p className="font-body text-lg text-muted-foreground">Manage products and stock levels</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200" data-testid="create-product-button">
                <Plus size={20} />
                Add Product
              </button>
            </DialogTrigger>
            <DialogContent className="bg-popover border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4" data-testid="create-product-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">SKU</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="sku-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="product-name-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Brand</label>
                    <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })} required>
                      <SelectTrigger className="w-full mt-2" data-testid="brand-select">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="category-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="stock-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-heading font-medium text-foreground">Price (SAR)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full mt-2 bg-background border border-border rounded-lg px-4 py-3 font-body text-base focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 text-foreground"
                      data-testid="price-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-200 mt-6"
                  data-testid="submit-product-button"
                >
                  Add Product
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-secondary border border-border/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="products-table">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">SKU</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Product</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Brand</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Stock</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Price</th>
                  <th className="px-4 py-4 text-left text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground font-body">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <tr key={product.id} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150" data-testid={`product-row-${product.id}`}>
                        <td className="px-4 py-3 text-sm font-mono text-foreground">{product.sku}</td>
                        <td className="px-4 py-3 text-sm font-body font-medium text-foreground">{product.name}</td>
                        <td className="px-4 py-3 text-sm font-body text-foreground">{product.brand_name}</td>
                        <td className="px-4 py-3 text-sm font-body text-foreground">{product.category}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                            className="w-20 bg-background border border-border rounded px-2 py-1 text-sm font-body text-foreground focus:border-ring focus:ring-1 focus:ring-ring/20"
                            data-testid={`stock-input-${product.id}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-body font-medium text-foreground">SAR {product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {product.stock < 10 && product.stock > 0 && (
                              <AlertTriangle size={16} className="text-warning" />
                            )}
                            <span 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-heading font-medium uppercase tracking-wide"
                              style={{
                                backgroundColor: `${stockStatus.color}15`,
                                color: stockStatus.color,
                                border: `1px solid ${stockStatus.color}50`
                              }}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}