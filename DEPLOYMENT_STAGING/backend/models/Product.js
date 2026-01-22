import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brand_name: String,
    category: {
        type: String,
        required: true
    },
    subcategory: String,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    cost_price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        enum: ['SAR', 'USD', 'AED', 'EUR'],
        default: 'SAR'
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    low_stock_threshold: {
        type: Number,
        default: 10
    },
    images: [{
        url: String,
        alt: String,
        is_primary: { type: Boolean, default: false }
    }],
    attributes: {
        size: String,
        color: String,
        material: String,
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    tags: [String]
}, {
    timestamps: true
});

// Virtual for profit margin
productSchema.virtual('profit_margin').get(function () {
    if (this.cost_price > 0) {
        return ((this.price - this.cost_price) / this.price * 100).toFixed(2);
    }
    return null;
});

// Virtual for low stock status
productSchema.virtual('is_low_stock').get(function () {
    return this.stock <= this.low_stock_threshold;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes
productSchema.index({ brand_id: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
