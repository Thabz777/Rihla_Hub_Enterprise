import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import seedDatabase from './config/seed.js';
import { User, Order, Product, Customer, Employee, Brand } from './models/index.js';
import { generateToken, authMiddleware, optionalAuthMiddleware, requireRole, requirePermission } from './middleware/auth.js';
import speakeasy from 'speakeasy';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Health Check (Primary - responds even if DB fails)
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';

    res.json({
        status: 'healthy',
        version: '2.20.0 (Stable Fix)',
        database_status: dbStatus,
        error: global.dbError || null,
        timestamp: new Date().toISOString()
    });
});

// Middleware
app.use(cors({
    // If CORS_ORIGINS is '*', allow all by reflecting origin (supports credentials)
    origin: process.env.CORS_ORIGINS === '*' ? true : (process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173']),
    credentials: true
}));
app.use(express.json());

// =============================================================================
// AUTH ROUTES
// =============================================================================

app.post('/api/auth/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email?.toLowerCase().trim();

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await User.findOne({ email, is_active: true });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check 2FA
        if (user.two_factor_enabled && user.two_factor_secret) {
            return res.json({ status: '2fa_required', email: user.email });
        }

        // First time 2FA setup
        if (!user.two_factor_secret) {
            const secret = speakeasy.generateSecret({
                length: 20,
                name: `Rihla Enterprise (${user.email})`,
                issuer: 'Rihla Enterprise'
            });

            // Generate QR Code URL
            // Google Charts is deprecated but widely used example; widely compatible otpauth URL:
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`;

            return res.json({
                status: 'setup_2fa',
                email: user.email,
                qr_code: qrCodeUrl,
                temp_secret: secret.base32 // Store base32 secret locally in frontend state or temp storage
            });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        const token = generateToken(user._id);
        res.json({
            access_token: token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
        const { email, token, temp_secret } = req.body;

        const user = await User.findOne({ email: email?.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const secret = user.two_factor_secret || temp_secret;
        if (!secret) {
            return res.status(400).json({ error: 'No 2FA secret available' });
        }

        // Verify TOTP using Speakeasy
        const isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Allow 30sec time drift
        });

        if (isValid) {
            // Save 2FA secret if first time setup
            if (!user.two_factor_secret && temp_secret) {
                user.two_factor_secret = temp_secret;
                user.two_factor_enabled = true;
            }
            user.last_login = new Date();
            await user.save();

            const accessToken = generateToken(user._id);
            res.json({
                access_token: accessToken,
                user: user.toJSON()
            });
        } else {
            res.status(401).json({ error: 'Invalid 2FA code (use 6 digits)' });
        }
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: '2FA verification failed' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json(req.user.toJSON());
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
    // In a production app, you might invalidate the token here
    res.json({ success: true, message: 'Logged out successfully' });
});

// =============================================================================
// DASHBOARD ROUTES
// =============================================================================

// Helper to check if brand_id is valid (not 'undefined' string, 'all', null, or empty)
const isValidBrandId = (id) => id && id !== 'all' && id !== 'undefined' && id !== 'null';

app.get('/api/dashboard/metrics', authMiddleware, async (req, res) => {
    try {
        const { brand_id } = req.query;

        let orderQuery = {};
        let productQuery = {};

        if (isValidBrandId(brand_id)) {
            orderQuery.brand_id = brand_id;
            productQuery.brand_id = brand_id;
        }

        const [orders, products, customers] = await Promise.all([
            Order.find(orderQuery),
            Product.countDocuments(productQuery),
            Customer.countDocuments()
        ]);

        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

        res.json({
            total_revenue: totalRevenue,
            revenue_change: '+12%',
            total_orders: orders.length,
            orders_change: '+8%',
            total_customers: uniqueCustomers || customers,
            total_products: products
        });
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

app.get('/api/dashboard/revenue-trend', authMiddleware, async (req, res) => {
    try {
        const { brand_id, month, year } = req.query;

        let matchQuery = {};
        if (isValidBrandId(brand_id)) {
            matchQuery.brand_id = brand_id;
        }
        if (year && year !== 'all') {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${parseInt(year) + 1}-01-01`);
            matchQuery.createdAt = { $gte: startDate, $lt: endDate };
        }
        if (month && month !== 'all') {
            // Refine month filtering within the year
        }

        const orders = await Order.find(matchQuery).sort({ createdAt: 1 });

        const trend = {};
        orders.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0];
            trend[date] = (trend[date] || 0) + o.total;
        });

        const result = Object.entries(trend).map(([date, revenue]) => ({ date, revenue }));
        res.json(result);
    } catch (error) {
        console.error('Revenue trend error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue trend' });
    }
});

// =============================================================================
// ORDERS ROUTES
// =============================================================================

app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const { brand_id, status, limit = 100 } = req.query;

        let query = {};
        if (isValidBrandId(brand_id)) query.brand_id = brand_id;
        if (status && status !== 'all') query.status = status;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(orders);
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        console.log('📦 Creating order with data:', JSON.stringify(data, null, 2));

        // === 1. CUSTOMER SANITIZATION & CREATION ===
        const sanitizeInput = (val) => {
            if (!val || typeof val !== 'string') return undefined;
            const clean = val.trim();
            if (['-', 'n/a', 'none', 'null', 'undefined', ''].includes(clean.toLowerCase())) return undefined;
            return clean;
        };

        const email = sanitizeInput(data.customer_email)?.toLowerCase();
        const phone = sanitizeInput(data.customer_phone);
        let customer = null;

        try {
            if (email) {
                customer = await Customer.findOne({ email });
            }
            if (!customer && phone) {
                customer = await Customer.findOne({ phone });
            }

            if (!customer && (email || phone)) {
                customer = await Customer.create({
                    name: data.customer_name,
                    email: email,
                    phone: phone,
                    address: { street: data.customer_address || '' }
                });
            }
        } catch (custErr) {
            console.warn('⚠️ Customer handling failed:', custErr.message);
            // Fallback: If creation failed (e.g. race condition), try finding one last time
            if (email) customer = await Customer.findOne({ email });
        }

        // === 2. BRAND NAME ===
        let brandName = 'Brand';
        try {
            const brand = await Brand.findById(data.brand_id);
            brandName = brand?.name || 'Brand';
        } catch (e) { console.warn('Brand lookup failed'); }

        // === 3. PROCESS ITEMS ===
        const itemsWithDetails = [];
        for (const item of data.items || []) {
            try {
                const product = await Product.findById(item.product_id);
                if (product) {
                    product.stock = Math.max(0, product.stock - item.quantity);
                    await product.save();
                    itemsWithDetails.push({
                        product_id: product._id,
                        product_name: product.name,
                        quantity: item.quantity,
                        price: product.price,
                        sku: product.sku
                    });
                }
            } catch (prodErr) {
                console.warn('⚠️ Product error:', prodErr.message);
            }
        }

        if (itemsWithDetails.length === 0) {
            return res.status(400).json({ error: 'No valid products found' });
        }

        // === 4. GENERATE ORDER NUMBER (Timestamp based unique) ===
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const orderNumber = `ORD-${dateStr}-${Date.now()}`;
        // No need for sequence lookup; timestamp ensures uniqueness.

        // === 5. CREATE ORDER ===
        const newOrder = new Order({
            order_number: orderNumber,
            customer_id: customer?._id || null,
            customer_name: data.customer_name,
            customer_email: data.customer_email || undefined,
            customer_phone: data.customer_phone || undefined,
            brand_id: data.brand_id,
            brand_name: brandName,
            items: itemsWithDetails,
            subtotal: data.subtotal || 0,
            vat_amount: data.vat_amount || 0,
            vat_rate: data.vat_rate || 0,
            apply_vat: data.apply_vat !== false,
            shipping_charges: data.shipping_charges || 0,
            total: data.total || 0,
            currency: data.currency || 'SAR',
            status: data.status || 'pending',
            payment_method: data.payment_method || 'Cash',
            created_by_user_id: req.user._id,
            attributed_employee_id: req.user.employee_id || null,
            shipping_address: { street: data.customer_address || '' }
        });

        await newOrder.save();
        console.log('✅ Order saved:', newOrder.order_number);

        // === 6. POST-SAVE UPDATES (won't block response) ===
        setImmediate(async () => {
            try {
                if (req.user.employee_id) {
                    const emp = await Employee.findById(req.user.employee_id);
                    if (emp) {
                        if (typeof emp.resetYearlyTarget === 'function') emp.resetYearlyTarget();
                        emp.achieved = (emp.achieved || 0) + newOrder.total;
                        await emp.save();
                    }
                }
                if (customer) {
                    customer.total_orders = (customer.total_orders || 0) + 1;
                    customer.lifetime_value = (customer.lifetime_value || 0) + newOrder.total;
                    customer.last_order_date = new Date();
                    await customer.save();
                }
            } catch (postErr) {
                console.warn('Post-save updates failed:', postErr.message);
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('❌ Order creation error:', error);
        res.status(500).json({
            error: `Order Creation Failed (v2.16): ${error.message || 'Unknown error'}`,
            details: error.errors || error.stack
        });
    }
});

app.put('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        const updates = req.body;

        if (status) updates.status = status;

        const order = await Order.findByIdAndUpdate(id, updates, { new: true });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Order update error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// =============================================================================
// PRODUCTS (INVENTORY) ROUTES
// =============================================================================

app.get('/api/products', authMiddleware, async (req, res) => {
    try {
        const { brand_id } = req.query;

        let query = {};
        if (isValidBrandId(brand_id)) query.brand_id = brand_id;

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', authMiddleware, requirePermission('can_create'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.body.brand_id);

        const product = new Product({
            ...req.body,
            brand_name: brand?.name
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.query;
        const updates = req.body;

        if (stock) updates.stock = parseInt(stock);

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Product update error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Product delete error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// =============================================================================
// CUSTOMERS ROUTES
// =============================================================================

app.get('/api/customers/with-orders', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            Customer.find()
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            Customer.countDocuments()
        ]);

        // Enrich with order data
        const enriched = await Promise.all(customers.map(async (c) => {
            const orderQuery = {
                $or: [{ customer_id: c._id }]
            };
            if (c.email) orderQuery.$or.push({ customer_email: c.email });

            const orders = await Order.find(orderQuery)
                .sort({ createdAt: -1 })
                .limit(10); // Show recent 10 invoices

            return {
                ...c.toJSON(),
                recent_orders: orders
            };
        }));

        res.json({
            customers: enriched,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Customers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.get('/api/search/invoice', authMiddleware, async (req, res) => {
    try {
        const { order_number, query } = req.query;
        let term = (query || order_number || '').replace(/[—–]/g, '-').trim();

        // Handle common prefixes if user pasted full Invoice ID
        if (term.toUpperCase().startsWith('INV-')) {
            term = term.substring(4);
        }

        const searchConditions = [
            { order_number: { $regex: term, $options: 'i' } },
            { order_number: term }
        ];

        // If it looks like a MongoID, add that to search
        if (term.match(/^[0-9a-fA-F]{24}$/)) {
            searchConditions.push({ _id: term });
        }

        const order = await Order.findOne({
            $or: searchConditions
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const customer = await Customer.findOne({
            $or: [{ _id: order.customer_id }, { email: order.customer_email }]
        });

        res.json({
            customer_id: customer?._id || 'unknown',
            customer_name: order.customer_name,
            order_number: order.order_number
        });
    } catch (error) {
        console.error('Invoice search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// =============================================================================
// EMPLOYEES ROUTES
// =============================================================================

app.get('/api/employees', authMiddleware, async (req, res) => {
    try {
        const { brand_id, department, status } = req.query;

        let query = {};
        if (isValidBrandId(brand_id)) query.brand_id = brand_id;
        if (department && department !== 'all') query.department = department;
        if (status && status !== 'all') query.status = status;

        const employees = await Employee.find(query);
        res.json(employees);
    } catch (error) {
        console.error('Employees fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.get('/api/employees/stats', authMiddleware, async (req, res) => {
    try {
        const employees = await Employee.find();

        const total = employees.length;
        const active = employees.filter(e => e.status === 'active').length;
        const salary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
        const avgAch = total > 0
            ? (employees.reduce((sum, e) => sum + (e.target ? (e.achieved / e.target) : 0), 0) / total * 100).toFixed(1)
            : 0;

        res.json({
            total_employees: total,
            active_employees: active,
            total_salary: salary,
            avg_achievement_rate: avgAch
        });
    } catch (error) {
        console.error('Employee stats error:', error);
        res.status(500).json({ error: 'Failed to fetch employee stats' });
    }
});

app.post('/api/employees', authMiddleware, requirePermission('can_create'), async (req, res) => {
    try {
        const brand = await Brand.findById(req.body.brand_id);

        const employee = new Employee({
            ...req.body,
            brand_name: brand?.name
        });

        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        console.error('Employee creation error:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

app.put('/api/employees/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.brand_id) {
            const brand = await Brand.findById(updates.brand_id);
            updates.brand_name = brand?.name;
        }

        const employee = await Employee.findByIdAndUpdate(id, updates, { new: true });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Employee update error:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.delete('/api/employees/:id', authMiddleware, requirePermission('can_delete'), async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Employee delete error:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// =============================================================================
// BRANDS ROUTES
// =============================================================================

app.get('/api/brands', optionalAuthMiddleware, async (req, res) => {
    try {
        const brands = await Brand.find({ is_active: true });
        res.json(brands);
    } catch (error) {
        console.error('Brands fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch brands' });
    }
});

// =============================================================================
// USER MANAGEMENT ROUTES (Admin Only)
// =============================================================================

app.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const users = await User.find().lean();
        // Manually sanitize to ensure _id is present and password is removed
        const safeUsers = users.map(user => ({
            ...user,
            id: user._id.toString(), // Ensure string ID exists
            _id: user._id.toString(), // Ensure _id exists
            password: undefined, // Remove sensitive data
            two_factor_secret: undefined
        }));
        res.json(safeUsers);
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { email, password, full_name, role, employee_id } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = new User({
            email,
            password,
            full_name,
            role: role || 'user',
            employee_id: employee_id || null
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/users/:email/reset-password', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { email } = req.params;
        const { new_password } = req.query;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = new_password;
        await user.save(); // Pre-save hook will hash the password

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});


app.put('/api/users/:id/reset-2fa', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        let { id } = req.params;
        id = id.trim(); // Sanitization

        console.log(`[Admin] Resetting 2FA for UserID: ${id}`); // Backend Log

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.error(`Invalid User ID format: ${id}`);
            return res.status(400).json({ error: 'Invalid User ID format' });
        }

        const user = await User.findById(id);

        if (!user) {
            console.error(`User not found in DB: ${id}`);
            return res.status(404).json({ error: `User not found (ID: ${id})` });
        }

        user.two_factor_secret = undefined;
        user.two_factor_enabled = false;
        await user.save();

        res.json({ success: true, message: '2FA reset successfully' });
    } catch (error) {
        console.error('Reset 2FA error:', error);
        res.status(500).json({ error: 'Failed to reset 2FA' });
    }
});

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.put('/api/users/:email/permissions', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { email } = req.params;
        const permissions = req.body;

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { permissions },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Permissions update error:', error);
        res.status(500).json({ error: 'Failed to update permissions' });
    }
});

// =============================================================================
// ANALYTICS ROUTES
// =============================================================================

app.get('/api/analytics/user-performance', authMiddleware, async (req, res) => {
    try {
        const stats = {};
        const orders = await Order.find({ created_by_user_id: { $ne: null } });

        for (const order of orders) {
            const userId = order.created_by_user_id.toString();
            if (!stats[userId]) {
                const user = await User.findById(order.created_by_user_id);
                stats[userId] = {
                    id: userId,
                    name: user?.full_name || 'Unknown User',
                    orders_count: 0,
                    revenue: 0
                };
            }
            stats[userId].orders_count++;
            stats[userId].revenue += order.total;
        }

        res.json(Object.values(stats));
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

app.get('/api/admin/orders-by-user', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ created_by_user_id: { $ne: null } });
        const stats = {};

        for (const order of orders) {
            const userId = order.created_by_user_id.toString();
            if (!stats[userId]) {
                const user = await User.findById(order.created_by_user_id);
                stats[userId] = {
                    name: user?.full_name || 'Unknown',
                    total_orders: 0,
                    completed_value: 0
                };
            }
            stats[userId].total_orders++;
            if (order.status === 'completed') {
                stats[userId].completed_value += order.total;
            }
        }

        res.json(Object.values(stats));
    } catch (error) {
        console.error('Orders by user error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// =============================================================================
// PUBLIC INVOICE ROUTES
// =============================================================================

app.get('/api/public/invoice/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const orders = await Order.find({ customer_id: customerId });
        const total_amount = orders.reduce((sum, o) => sum + o.total, 0);

        res.json({
            invoice_id: `INV-${Date.now().toString().slice(-6)}`,
            invoice_date: new Date().toISOString(),
            customer,
            orders,
            total_amount
        });
    } catch (error) {
        console.error('Invoice fetch error:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

app.get('/api/public/invoice-by-order/:orderId', async (req, res) => {
    try {
        let { orderId } = req.params;
        let order = null;

        // Handle INV- prefix
        if (orderId.toUpperCase().startsWith('INV-')) {
            orderId = orderId.substring(4);
        }

        // First try to find by order_number (e.g., "ORD-001")
        order = await Order.findOne({ order_number: orderId });

        // If not found and it looks like a valid ObjectId, try by _id
        if (!order && orderId.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(orderId);
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const customer = await Customer.findOne({
            $or: [{ _id: order.customer_id }, { email: order.customer_email }]
        });

        res.json({
            invoice_id: `INV-${order.order_number}`,
            invoice_date: order.createdAt,
            customer: customer || { name: order.customer_name, email: order.customer_email },
            order
        });
    } catch (error) {
        console.error('Invoice by order error:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

// Health check moved to top of file (line ~15)

// =============================================================================
// START SERVER
// =============================================================================

const startServer = async () => {
    try {
        // Connect to MongoDB
        // Connect to MongoDB
        await connectDB().catch(err => {
            console.error('⚠️ DB Connection Failed, starting server anyway:', err.message);
            global.dbError = err.message;
        });

        // Seed initial data if needed (only if connected)
        if (mongoose.connection.readyState === 1) {
            await seedDatabase().catch(console.error);
        }

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Rihla Backend v2.9 (Debug) running on port ${PORT}`);
            console.log(`📊 API: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        // Do NOT exit, try to keep alive for logs
    }
};

startServer();

export default app;
