import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    product_name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    sku: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    order_number: {
        type: String,
        required: true,
        unique: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    customer_name: {
        type: String,
        required: true
    },
    customer_email: {
        type: String,
        required: true
    },
    customer_phone: String,
    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brand_name: String,
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        default: 0
    },
    vat_amount: {
        type: Number,
        default: 0
    },
    vat_rate: {
        type: Number,
        default: 0.15 // 15% Saudi VAT
    },
    apply_vat: {
        type: Boolean,
        default: true
    },
    shipping_charges: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['SAR', 'USD', 'AED', 'EUR'],
        default: 'SAR'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['Credit Card', 'Bank Transfer', 'Cash', 'Apple Pay', 'Mada', 'STC Pay'],
        default: 'Credit Card'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    shipping_address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: { type: String, default: 'Saudi Arabia' }
    },
    notes: String,
    created_by_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attributed_employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.order_number) {
        const count = await mongoose.model('Order').countDocuments();
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        this.order_number = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Calculate totals before saving
orderSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (this.apply_vat) {
            this.vat_amount = this.subtotal * this.vat_rate;
        } else {
            this.vat_amount = 0;
        }

        this.total = this.subtotal + this.vat_amount + (this.shipping_charges || 0) - (this.discount || 0);
    }
    next();
});

// Index for faster queries
orderSchema.index({ customer_email: 1 });
orderSchema.index({ brand_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
