import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    logo: {
        type: String,
        default: '/brands/default.png'
    },
    description: String,
    website: String,
    primary_color: {
        type: String,
        default: '#6366f1'
    },
    secondary_color: {
        type: String,
        default: '#8b5cf6'
    },
    contact_email: String,
    contact_phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: { type: String, default: 'Saudi Arabia' }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    settings: {
        default_currency: { type: String, default: 'SAR' },
        vat_rate: { type: Number, default: 0.15 },
        default_shipping_rate: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
