import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, Customer, Brand, Product } from './models/index.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'rihla_enterprise';

/**
 * Seed sample orders into the database from the backup data
 */
async function seedSampleOrders() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
        console.log('✅ Connected to MongoDB');

        // Check if orders already exist
        const orderCount = await Order.countDocuments();
        if (orderCount > 0) {
            console.log(`ℹ️  Database already has ${orderCount} orders. Skipping seed.`);
            console.log('💡 To re-seed, delete existing orders first.');
            await mongoose.disconnect();
            return;
        }

        // Get brand and customer IDs
        const brands = await Brand.find();
        const customers = await Customer.find();
        const products = await Product.find();

        if (brands.length === 0 || customers.length === 0) {
            console.log('❌ No brands or customers found. Run main seed first.');
            await mongoose.disconnect();
            return;
        }

        const rihlaAbaya = brands.find(b => b.code === 'RA');
        const rihlaAtelier = brands.find(b => b.code === 'RAT');
        const customer1 = customers.find(c => c.email === 'ahmed@example.com');
        const customer2 = customers.find(c => c.email === 'sara@example.com');
        const luxuryAbaya = products.find(p => p.sku === 'RA-L-001');
        const eveningGown = products.find(p => p.sku === 'RAT-DR-001');

        console.log('📦 Seeding sample orders...');

        const sampleOrders = [
            {
                order_number: 'ORD-001',
                customer_id: customer1?._id,
                customer_name: 'Ahmed Al-Saud',
                customer_email: 'ahmed@example.com',
                customer_phone: '+966 50 111 2222',
                brand_id: rihlaAbaya?._id,
                brand_name: 'Rihla Abaya',
                items: [{
                    product_id: luxuryAbaya?._id,
                    product_name: 'Luxury Abaya',
                    quantity: 2,
                    price: 850,
                    sku: 'RA-L-001'
                }],
                subtotal: 1700,
                vat_amount: 255,
                vat_rate: 0.15,
                apply_vat: true,
                total: 1955,
                currency: 'SAR',
                status: 'completed',
                payment_method: 'Credit Card',
                payment_status: 'paid',
                shipping_address: {
                    city: 'Riyadh',
                    country: 'Saudi Arabia'
                },
                createdAt: new Date(Date.now() - 86400000) // Yesterday
            },
            {
                order_number: 'ORD-002',
                customer_id: customer2?._id,
                customer_name: 'Sara Khan',
                customer_email: 'sara@example.com',
                customer_phone: '+966 50 333 4444',
                brand_id: rihlaAtelier?._id,
                brand_name: 'Rihla Atelier',
                items: [{
                    product_id: eveningGown?._id,
                    product_name: 'Evening Gown',
                    quantity: 1,
                    price: 2500,
                    sku: 'RAT-DR-001'
                }],
                subtotal: 2500,
                vat_amount: 375,
                vat_rate: 0.15,
                apply_vat: true,
                total: 2875,
                currency: 'SAR',
                status: 'processing',
                payment_method: 'Bank Transfer',
                payment_status: 'paid',
                shipping_address: {
                    city: 'Jeddah',
                    country: 'Saudi Arabia'
                },
                createdAt: new Date()
            }
        ];

        // Insert orders
        for (const orderData of sampleOrders) {
            const order = new Order(orderData);
            await order.save();
            console.log(`✅ Created order: ${orderData.order_number}`);
        }

        // Update customer stats
        if (customer1) {
            customer1.total_orders = 1;
            customer1.lifetime_value = 1955;
            customer1.last_order_date = new Date(Date.now() - 86400000);
            await customer1.save();
        }
        if (customer2) {
            customer2.total_orders = 1;
            customer2.lifetime_value = 2875;
            customer2.last_order_date = new Date();
            await customer2.save();
        }

        console.log('🎉 Sample orders seeded successfully!');
        console.log('');
        console.log('📋 Test URLs:');
        console.log('   Public Invoice 1: http://localhost:3000/public/invoice/ORD-001');
        console.log('   Public Invoice 2: http://localhost:3000/public/invoice/ORD-002');

        await mongoose.disconnect();
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedSampleOrders();
