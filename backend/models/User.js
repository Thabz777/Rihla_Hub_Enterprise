import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'manager'],
        default: 'user'
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    permissions: {
        dashboard: { type: Boolean, default: true },
        orders: { type: Boolean, default: true },
        inventory: { type: Boolean, default: true },
        customers: { type: Boolean, default: true },
        analytics: { type: Boolean, default: false },
        settings: { type: Boolean, default: false },
        can_create: { type: Boolean, default: true },
        can_edit: { type: Boolean, default: false },
        can_delete: { type: Boolean, default: false }
    },
    two_factor_secret: {
        type: String,
        default: null
    },
    two_factor_enabled: {
        type: Boolean,
        default: false
    },
    last_login: {
        type: Date,
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.two_factor_secret;
    return obj;
};

// Set admin permissions based on role
userSchema.pre('save', function (next) {
    if (this.role === 'admin') {
        this.permissions = {
            dashboard: true,
            orders: true,
            inventory: true,
            customers: true,
            analytics: true,
            settings: true,
            can_create: true,
            can_edit: true,
            can_delete: true
        };
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
