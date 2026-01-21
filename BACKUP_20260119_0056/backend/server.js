import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Mock 2FA libs
// import speakeasy from 'speakeasy';
// import qrcode from 'qrcode';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---

const BRANDS = [
    { id: 'b1', name: 'Rihla Technologies', logo: '/brands/tech.png', color: '#3B82F6' },
    { id: 'b2', name: 'Rihla Brand Journey', logo: '/brands/journey.png', color: '#10B981' },
    { id: 'b3', name: 'Rihla Abaya', logo: '/brands/abaya.png', color: '#8B5CF6' },
    { id: 'b4', name: 'Rihla Atelier', logo: '/brands/atelier.png', color: '#F59E0B' }
];

let PRODUCTS = [
    { id: 'p1', sku: 'RA-L-001', name: 'Luxury Abaya', brand_id: 'b3', brand_name: 'Rihla Abaya', price: 850, stock: 50, currency: 'SAR', category: 'Clothing' },
    { id: 'p2', sku: 'RA-S-002', name: 'Silk Scarf', brand_id: 'b3', brand_name: 'Rihla Abaya', price: 180, stock: 150, currency: 'SAR', category: 'Accessories' },
    { id: 'p3', sku: 'RAT-DR-001', name: 'Evening Gown', brand_id: 'b4', brand_name: 'Rihla Atelier', price: 2500, stock: 10, currency: 'SAR', category: 'Couture' },
    { id: 'p4', sku: 'RT-SW-001', name: 'Cloud Platform License', brand_id: 'b1', brand_name: 'Rihla Technologies', price: 5000, stock: 999, currency: 'SAR', category: 'Software' }
];

let CUSTOMERS = [
    { id: 'c1', name: 'Ahmed Al-Saud', email: 'ahmed@example.com', phone: '+966 50 111 2222', created_at: '2023-01-15T10:00:00Z' },
    { id: 'c2', name: 'Sara Khan', email: 'sara@example.com', phone: '+966 50 333 4444', created_at: '2023-02-20T14:30:00Z' }
];

let EMPLOYEES = [
    { id: 'e1', name: 'Mohammed Ali', email: 'mohammed@rihla.com', phone: '+966 55 123 4567', position: 'Tech Lead', department: 'Technology', brand_id: 'b1', brand_name: 'Rihla Technologies', salary: 25000, bonus: 5000, target: 100000, achieved: 45000, status: 'active', last_reset_year: 2026 },
    { id: 'e2', name: 'Layla Ahmed', email: 'layla@rihla.com', phone: '+966 55 987 6543', position: 'Fashion Designer', department: 'Operations', brand_id: 'b4', brand_name: 'Rihla Atelier', salary: 18000, bonus: 2000, target: 80000, achieved: 12000, status: 'active', last_reset_year: 2026 }
];

const USERS = [
    { id: 1, email: 'admin@rihla.com', password: 'admin123', full_name: 'Admin User', role: 'admin', permissions: { dashboard: true, orders: true, inventory: true, customers: true, analytics: true, settings: true, can_create: true, can_edit: true, can_delete: true } },
    { id: 2, email: 'user@rihla.com', password: 'user123', full_name: 'Standard User', role: 'user', permissions: { dashboard: true, orders: true, inventory: true, customers: true, analytics: false, settings: false, can_create: true, can_edit: false, can_delete: false } }
];

let ORDERS = [
    {
        id: 'ord_1',
        order_number: 'ORD-001',
        customer_name: 'Ahmed Al-Saud',
        customer_email: 'ahmed@example.com',
        customer_id: 'c1',
        brand_id: 'b3',
        brand_name: 'Rihla Abaya',
        items: [{ product_id: 'p1', product_name: 'Luxury Abaya', quantity: 2, price: 850 }],
        total: 1955.00, // 1700 + 15% VAT
        vat_amount: 255.00,
        currency: 'SAR',
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        payment_method: 'Credit Card'
    },
    {
        id: 'ord_2',
        order_number: 'ORD-002',
        customer_name: 'Sara Khan',
        customer_email: 'sara@example.com',
        customer_id: 'c2',
        brand_id: 'b4',
        brand_name: 'Rihla Atelier',
        items: [{ product_id: 'p3', product_name: 'Evening Gown', quantity: 1, price: 2500 }],
        total: 2875.00, // 2500 + 15% VAT
        vat_amount: 375.00,
        currency: 'SAR',
        status: 'processing',
        created_at: new Date().toISOString(),
        payment_method: 'Bank Transfer'
    }
];

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
        // Check 2FA Status
        if (user.two_factor_secret) {
            return res.json({ status: '2fa_required', email: user.email });
        } else {
            // First time setup - Force Setup (MOCK)
            const secret = 'JBSWY3DPEHPK3PXP'; // Demo Secret (base32)
            const otpauth = `otpauth://totp/Rihla:${user.email}?secret=${secret}&issuer=Rihla`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;

            return res.json({
                status: 'setup_2fa',
                email: user.email,
                qr_code: qrCodeUrl,
                temp_secret: secret
            });
        }
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/verify-2fa', (req, res) => {
    const { email, token, temp_secret } = req.body;
    const user = USERS.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Determine secret to use (Stored or Temp)
    const secret = user.two_factor_secret || temp_secret;
    if (!secret) return res.status(400).json({ error: 'No 2FA secret available' });

    // Verify
    // Acceptance simulation: matches any 6-digit pattern so real Authenticator codes work
    const isValid = /^\d{6}$/.test(token);

    if (isValid) {
        if (!user.two_factor_secret && temp_secret) {
            user.two_factor_secret = temp_secret;
        }

        const accessToken = `mock_token_${user.id}`;
        res.json({
            access_token: accessToken,
            user: { ...user, permissions: user.permissions }
        });
    } else {
        res.status(401).json({ error: 'Invalid 2FA Code (Use 123456)' });
    }
});
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token || !token.startsWith('mock_token_')) {
        // Fallback for dev convenience if needed, or strict 401
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = parseInt(token.replace('mock_token_', ''), 10);
    const user = USERS.find(u => u.id === userId);
    if (user) res.json(user);
    else res.status(401).json({ error: 'Invalid User' });
});

// --- DASHBOARD ---
app.get('/api/dashboard/metrics', (req, res) => {
    const { brand_id } = req.query;
    let filtered = ORDERS;
    if (brand_id && brand_id !== 'all') filtered = filtered.filter(o => o.brand_id === brand_id);

    res.json({
        total_revenue: filtered.reduce((sum, o) => sum + o.total, 0),
        revenue_change: '+10%',
        total_orders: filtered.length,
        orders_change: '+5%',
        total_customers: new Set(filtered.map(o => o.customer_email)).size,
        total_products: PRODUCTS.length
    });
});
app.get('/api/dashboard/revenue-trend', (req, res) => {
    const { brand_id, month, year } = req.query;
    let filtered = ORDERS;
    if (brand_id && brand_id !== 'all') filtered = filtered.filter(o => o.brand_id === brand_id);

    // Filter by Year
    if (year && year !== 'all') {
        filtered = filtered.filter(o => new Date(o.created_at).getFullYear().toString() === year);
    }
    // Filter by Month (1-12)
    if (month && month !== 'all') {
        filtered = filtered.filter(o => (new Date(o.created_at).getMonth() + 1).toString() === month);
    }

    const trend = {};
    filtered.forEach(o => {
        const date = o.created_at.split('T')[0];
        trend[date] = (trend[date] || 0) + o.total;
    });

    const result = Object.entries(trend).map(([date, revenue]) => ({ date, revenue }));
    // Ensure we send at least empty data for the chart if no orders
    res.json(result.sort((a, b) => a.date.localeCompare(b.date)));
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
    const { brand_id, status } = req.query;
    let result = [...ORDERS].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (brand_id && brand_id !== 'all') result = result.filter(o => o.brand_id === brand_id);
    if (status && status !== 'all') result = result.filter(o => o.status === status);
    res.json(result);
});

app.post('/api/orders', (req, res) => {
    const data = req.body;
    // Check if customer exists, else create mock customer
    let customer = CUSTOMERS.find(c => c.email === data.customer_email);
    if (!customer && data.customer_email) {
        customer = {
            id: `c${Date.now()}`,
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone,
            created_at: new Date().toISOString()
        };
        CUSTOMERS.push(customer);
    }

    // Calculate total
    let subtotal = 0;
    const itemsWithNames = data.items.map(item => {
        const p = PRODUCTS.find(prod => prod.id === item.product_id);
        if (p) {
            subtotal += p.price * item.quantity;
            // Decrease stock
            p.stock = Math.max(0, p.stock - item.quantity);
        }
        return {
            ...item,
            product_name: p ? p.name : 'Unknown',
            price: p ? p.price : 0
        };
    });

    const vatRate = data.apply_vat ? (data.currency === 'SAR' ? 0.15 : 0.18) : 0;
    const vat = subtotal * vatRate;
    const total = subtotal + vat + (data.shipping_charges || 0);

    // Identify User
    const authHeader = req.headers.authorization;
    let userId = null;
    let employeeId = null;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token && token.startsWith('mock_token_')) {
            userId = parseInt(token.replace('mock_token_', ''), 10);
            const user = USERS.find(u => u.id === userId);
            if (user && user.employee_id) {
                employeeId = user.employee_id;
            }
        }
    }

    const newOrder = {
        id: `ord_${Date.now()}`,
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString(),
        ...data,
        customer_id: customer ? customer.id : null,
        brand_name: BRANDS.find(b => b.id === data.brand_id)?.name || 'Brand',
        items: itemsWithNames,
        total,
        vat_amount: vat,
        created_by_user_id: userId, // Track who created it
        attributed_employee_id: employeeId
    };

    // Credit Employee Achievement if linked
    if (employeeId) {
        const employee = EMPLOYEES.find(e => e.id === employeeId);
        if (employee) {
            const currentYear = new Date().getFullYear();
            if (!employee.last_reset_year || employee.last_reset_year < currentYear) {
                if (employee.last_reset_year && employee.last_reset_year < currentYear) {
                    employee.achieved = 0;
                }
                employee.last_reset_year = currentYear;
            }
            employee.achieved = (employee.achieved || 0) + total;
        }
    }

    ORDERS.unshift(newOrder);
    res.status(201).json(newOrder);
});

app.get('/api/admin/orders-by-user', (req, res) => {
    const stats = {};
    ORDERS.forEach(order => {
        if (order.created_by_user_id) {
            if (!stats[order.created_by_user_id]) {
                const u = USERS.find(user => user.id === order.created_by_user_id);
                stats[order.created_by_user_id] = {
                    name: u ? u.full_name : 'Unknown',
                    total_orders: 0,
                    completed_value: 0
                };
            }
            stats[order.created_by_user_id].total_orders++;
            if (order.status === 'completed') {
                stats[order.created_by_user_id].completed_value += order.total;
            }
        }
    });

    // Fill in zeros for users who haven't ordered if needed, or just return active ones
    // Let's just return active ones for the chart
    res.json(Object.values(stats));
});

// --- ANALYTICS ---
app.get('/api/analytics/user-performance', (req, res) => {
    const stats = {};
    // Aggregate from Orders
    ORDERS.forEach(order => {
        if (order.created_by_user_id) {
            if (!stats[order.created_by_user_id]) {
                const u = USERS.find(user => user.id === order.created_by_user_id);
                stats[order.created_by_user_id] = {
                    id: order.created_by_user_id,
                    name: u ? u.full_name : 'Unknown User',
                    orders_count: 0,
                    revenue: 0
                };
            }
            stats[order.created_by_user_id].orders_count++;
            stats[order.created_by_user_id].revenue += order.total;
        }
    });

    // Include users with 0 orders (optional, but good for visibility)
    USERS.forEach(user => {
        if (!stats[user.id] && user.role !== 'admin') {
            stats[user.id] = {
                id: user.id,
                name: user.full_name,
                orders_count: 0,
                revenue: 0
            };
        }
    });

    res.json(Object.values(stats));
});

app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.query;
    const order = ORDERS.find(o => o.id === id);
    if (order && status) order.status = status;
    res.json(order);
});

app.get('/api/admin/orders-by-user', (req, res) => res.json({ 'Admin': { count: 5, total_value: 2000 } }));

// --- PRODUCTS (INVENTORY) ---
app.get('/api/products', (req, res) => {
    const { brand_id } = req.query;
    let result = PRODUCTS;
    if (brand_id && brand_id !== 'all') result = result.filter(p => p.brand_id === brand_id);
    res.json(result);
});

app.post('/api/products', (req, res) => {
    const newProd = {
        id: `p${Date.now()}`,
        ...req.body,
        brand_name: BRANDS.find(b => b.id === req.body.brand_id)?.name
    };
    PRODUCTS.push(newProd);
    res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { stock } = req.query;

    let prod = PRODUCTS.find(p => p.id === id);
    if (!prod) return res.status(404).json({ error: 'Not found' });

    if (stock) prod.stock = parseInt(stock); // Handle ?stock= param
    Object.assign(prod, updates); // Handle body updates

    res.json(prod);
});

// --- CUSTOMERS ---
app.get('/api/customers/with-orders', (req, res) => {
    // Enrich customers with order stats
    const enriched = CUSTOMERS.map(c => {
        const cOrders = ORDERS.filter(o => o.customer_email === c.email || o.customer_id === c.id);
        const ltv = cOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            ...c,
            total_orders: cOrders.length,
            lifetime_value: ltv,
            recent_orders: cOrders.slice(0, 3)
        };
    });
    res.json(enriched);
});

app.get('/api/search/invoice', (req, res) => {
    const { order_number, query } = req.query;
    const term = (query || order_number || '').trim();
    const normalized = term.replace(/^INV-/i, ''); // Allow searching by INV-ORD-XXX

    const order = ORDERS.find(o =>
        o.order_number.toLowerCase() === term.toLowerCase() ||
        o.order_number.toLowerCase() === normalized.toLowerCase()
    );

    if (!order) return res.status(404).json({ error: 'Not found' });

    // Find customer for this order
    const customer = CUSTOMERS.find(c => c.id === order.customer_id || c.email === order.customer_email);
    res.json({
        customer_id: customer ? customer.id : 'unknown',
        customer_name: order.customer_name,
        order_number: order.order_number // Return actual order number for navigation
    });
});

// --- EMPLOYEES ---
app.get('/api/employees', (req, res) => {
    const { brand_id, department, status } = req.query;
    let result = [...EMPLOYEES];
    if (brand_id && brand_id !== 'all') result = result.filter(e => e.brand_id === brand_id);
    if (department && department !== 'all') result = result.filter(e => e.department === department);
    if (status && status !== 'all') result = result.filter(e => e.status === status);
    res.json(result);
});

app.get('/api/employees/stats', (req, res) => {
    const total = EMPLOYEES.length;
    const active = EMPLOYEES.filter(e => e.status === 'active').length;
    const salary = EMPLOYEES.reduce((sum, e) => sum + (e.salary || 0), 0);
    const avgAch = EMPLOYEES.length ? (EMPLOYEES.reduce((sum, e) => sum + (e.target ? (e.achieved / e.target) : 0), 0) / EMPLOYEES.length * 100).toFixed(1) : 0;

    res.json({
        total_employees: total,
        active_employees: active,
        total_salary: salary,
        avg_achievement_rate: avgAch
    });
});

app.post('/api/employees', (req, res) => {
    const newEmp = {
        id: `e${Date.now()}`,
        ...req.body,
        brand_name: BRANDS.find(b => b.id === req.body.brand_id)?.name
    };
    EMPLOYEES.push(newEmp);
    res.status(201).json(newEmp);
});

app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const idx = EMPLOYEES.findIndex(e => e.id === id);
    if (idx !== -1) {
        const updates = req.body;
        // If brand_id is updated, update brand_name too
        if (updates.brand_id) {
            updates.brand_name = BRANDS.find(b => b.id === updates.brand_id)?.name;
        }
        Object.assign(EMPLOYEES[idx], updates);
        res.json(EMPLOYEES[idx]);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    EMPLOYEES = EMPLOYEES.filter(e => e.id !== id);
    res.json({ success: true });
});

// --- BRANDS ---
app.get('/api/brands', (req, res) => res.json(BRANDS));

// --- SETTINGS (USER MANAGEMENT) ---
app.get('/api/users', (req, res) => res.json(USERS));

app.post('/api/users', (req, res) => {
    const { email, password, full_name, role, employee_id } = req.body;
    if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (USERS.some(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
        id: USERS.length + 1,
        email,
        password, // In real app, hash this!
        full_name,
        role: role || 'user',
        employee_id: employee_id || null,
        permissions: {
            dashboard: true, orders: true, inventory: true, customers: true,
            analytics: role === 'admin', settings: role === 'admin',
            can_create: true, can_edit: role === 'admin', can_delete: role === 'admin'
        }
    };
    USERS.push(newUser);
    res.status(201).json(newUser);
});

app.put('/api/users/:email/reset-password', (req, res) => {
    const { email } = req.params;
    const { new_password } = req.query;
    const user = USERS.find(u => u.email === email);
    if (user) {
        user.password = new_password;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.put('/api/users/:email/permissions', (req, res) => {
    const { email } = req.params;
    const permissions = req.body;
    const user = USERS.find(u => u.email === email);
    if (user) {
        user.permissions = permissions;
        res.json({ success: true, user });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Admin Reset 2FA for a user
app.put('/api/users/:email/reset-2fa', (req, res) => {
    const { email } = req.params;
    const user = USERS.find(u => u.email === email);
    if (user) {
        delete user.two_factor_secret; // Remove 2FA secret
        res.json({ success: true, message: '2FA has been reset. User will need to set up 2FA on next login.' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- INVOICE ---
// Statement for Customer
app.get('/api/public/invoice/:customerId', (req, res) => {
    const { customerId } = req.params;
    const customer = CUSTOMERS.find(c => c.id === customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const orders = ORDERS.filter(o => o.customer_id === customerId);
    const total_amount = orders.reduce((sum, o) => sum + o.total, 0);

    const safeOrders = orders.map(o => ({
        ...o,
        subtotal: o.total - (o.vat_amount || 0) - (o.shipping_charges || 0),
        vat_rate: o.vat_amount > 0 ? (o.currency === 'SAR' ? 0.15 : 0.18) : 0,
        apply_vat: o.vat_amount > 0
    }));

    res.json({
        invoice_id: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString(),
        customer,
        orders: safeOrders,
        total_amount
    });
});

// Single Invoice by Order ID
app.get('/api/public/invoice-by-order/:orderId', (req, res) => {
    const { orderId } = req.params;
    // Try to find by ID first, then by Order Number
    const order = ORDERS.find(o => o.id === orderId || o.order_number === orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const customer = CUSTOMERS.find(c => c.id === order.customer_id || c.email === order.customer_email);

    const safeOrder = {
        ...order,
        subtotal: order.total - (order.vat_amount || 0) - (order.shipping_charges || 0),
        vat_rate: order.vat_amount > 0 ? (order.currency === 'SAR' ? 0.15 : 0.18) : 0,
        apply_vat: order.vat_amount > 0
    };

    res.json({
        invoice_id: `INV-${order.order_number}`,
        invoice_date: order.created_at,
        customer: customer || { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
        order: safeOrder
    });
});

app.listen(PORT, () => console.log(`Rihla Backend v2 running on ${PORT}`));
