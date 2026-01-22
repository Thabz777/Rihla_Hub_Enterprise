import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        // No unique constraint – multiple customers can share the same email
        sparse: true, // still allow null/undefined values without index errors
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    company: String,
    address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: { type: String, default: 'Saudi Arabia' }
    },
    billing_address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: { type: String, default: 'Saudi Arabia' }
    },
    customer_type: {
        type: String,
        enum: ['individual', 'business', 'vip'],
        default: 'individual'
    },
    tags: [String],
    notes: String,
    preferred_brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    marketing_consent: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    // Calculated fields (updated via aggregation)
    total_orders: {
        type: Number,
        default: 0
    },
    lifetime_value: {
        type: Number,
        default: 0
    },
    last_order_date: Date
}, {
    timestamps: true
});

// Indexes
// Removed explicit email index (unique constraint handled by schema field)
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
