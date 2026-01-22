import { User, Brand, Product, Customer, Employee } from '../models/index.js';
import bcrypt from 'bcryptjs';

/**
 * Seed initial data into the database
 * This runs only if no data exists
 */
export const seedDatabase = async () => {
    try {
        console.log('🌱 Checking if database needs seeding...');

        // Check if brands exist
        const brandCount = await Brand.countDocuments();
        if (brandCount === 0) {
            console.log('📦 Seeding brands...');
            const brands = await Brand.insertMany([
                {
                    name: 'Rihla Technologies',
                    code: 'RT',
                    logo: '/brands/tech.png',
                    description: 'Enterprise technology solutions',
                    primary_color: '#3b82f6',
                    settings: { default_currency: 'SAR', vat_rate: 0.15 }
                },
                {
                    name: 'Rihla Brand Journey',
                    code: 'RBJ',
                    logo: '/brands/journey.png',
                    description: 'Brand consulting and marketing',
                    primary_color: '#8b5cf6',
                    settings: { default_currency: 'SAR', vat_rate: 0.15 }
                },
                {
                    name: 'Rihla Abaya',
                    code: 'RA',
                    logo: '/brands/abaya.png',
                    description: 'Premium abaya fashion',
                    primary_color: '#1e293b',
                    settings: { default_currency: 'SAR', vat_rate: 0.15 }
                },
                {
                    name: 'Rihla Atelier',
                    code: 'RAT',
                    logo: '/brands/atelier.png',
                    description: 'Luxury couture and bespoke fashion',
                    primary_color: '#b91c1c',
                    settings: { default_currency: 'SAR', vat_rate: 0.15 }
                }
            ]);
            console.log(`✅ Created ${brands.length} brands`);

            // Now seed products with brand IDs
            const rihlaTech = brands.find(b => b.code === 'RT');
            const rihlaAbaya = brands.find(b => b.code === 'RA');
            const rihlaAtelier = brands.find(b => b.code === 'RAT');

            const products = await Product.insertMany([
                {
                    sku: 'RA-L-001',
                    name: 'Luxury Abaya',
                    brand_id: rihlaAbaya._id,
                    brand_name: 'Rihla Abaya',
                    price: 850,
                    stock: 50,
                    currency: 'SAR',
                    category: 'Clothing',
                    description: 'Premium quality abaya with intricate embroidery'
                },
                {
                    sku: 'RA-S-002',
                    name: 'Silk Scarf',
                    brand_id: rihlaAbaya._id,
                    brand_name: 'Rihla Abaya',
                    price: 180,
                    stock: 150,
                    currency: 'SAR',
                    category: 'Accessories',
                    description: 'Pure silk scarf with elegant patterns'
                },
                {
                    sku: 'RAT-DR-001',
                    name: 'Evening Gown',
                    brand_id: rihlaAtelier._id,
                    brand_name: 'Rihla Atelier',
                    price: 2500,
                    stock: 10,
                    currency: 'SAR',
                    category: 'Couture',
                    description: 'Handcrafted evening gown for special occasions'
                },
                {
                    sku: 'RT-SW-001',
                    name: 'Cloud Platform License',
                    brand_id: rihlaTech._id,
                    brand_name: 'Rihla Technologies',
                    price: 5000,
                    stock: 999,
                    currency: 'SAR',
                    category: 'Software',
                    description: 'Annual license for Rihla Cloud Platform'
                }
            ]);
            console.log(`✅ Created ${products.length} products`);

            // Seed employees
            const employees = await Employee.insertMany([
                {
                    name: 'Mohammed Ali',
                    email: 'mohammed@rihla.com',
                    phone: '+966 55 123 4567',
                    position: 'Tech Lead',
                    department: 'Technology',
                    brand_id: rihlaTech._id,
                    brand_name: 'Rihla Technologies',
                    salary: 25000,
                    bonus: 5000,
                    target: 100000,
                    achieved: 45000,
                    status: 'active'
                },
                {
                    name: 'Layla Ahmed',
                    email: 'layla@rihla.com',
                    phone: '+966 55 987 6543',
                    position: 'Fashion Designer',
                    department: 'Design',
                    brand_id: rihlaAtelier._id,
                    brand_name: 'Rihla Atelier',
                    salary: 18000,
                    bonus: 2000,
                    target: 80000,
                    achieved: 12000,
                    status: 'active'
                }
            ]);
            console.log(`✅ Created ${employees.length} employees`);

            // Seed customers
            const customers = await Customer.insertMany([
                {
                    name: 'Ahmed Al-Saud',
                    email: 'ahmed@example.com',
                    phone: '+966 50 111 2222',
                    customer_type: 'vip',
                    address: { city: 'Riyadh', country: 'Saudi Arabia' }
                },
                {
                    name: 'Sara Khan',
                    email: 'sara@example.com',
                    phone: '+966 50 333 4444',
                    customer_type: 'individual',
                    address: { city: 'Jeddah', country: 'Saudi Arabia' }
                }
            ]);
            console.log(`✅ Created ${customers.length} customers`);
        }

        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'admin@rihla.com' });
        if (!adminExists) {
            console.log('👤 Creating admin user...');

            const adminUser = new User({
                email: 'admin@rihla.com',
                password: 'admin123', // Will be hashed by pre-save hook
                full_name: 'Admin User',
                role: 'admin',
                permissions: {
                    dashboard: true,
                    orders: true,
                    inventory: true,
                    customers: true,
                    analytics: true,
                    settings: true,
                    can_create: true,
                    can_edit: true,
                    can_delete: true
                }
            });
            await adminUser.save();
            console.log('✅ Admin user created (admin@rihla.com / admin123)');
            console.log('ℹ️  Add new users through the Settings page in the app');
        }

        console.log('🎉 Database seeding complete!');
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};

export default seedDatabase;
