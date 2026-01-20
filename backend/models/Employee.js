import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        required: true
    },
    department: {
        type: String,
        enum: ['Technology', 'Operations', 'Sales', 'Marketing', 'Finance', 'HR', 'Design', 'Management'],
        required: true
    },
    brand_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    brand_name: String,
    salary: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        default: 0
    },
    achieved: {
        type: Number,
        default: 0
    },
    last_reset_year: {
        type: Number,
        default: () => new Date().getFullYear()
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave', 'terminated'],
        default: 'active'
    },
    hire_date: {
        type: Date,
        default: Date.now
    },
    emergency_contact: {
        name: String,
        phone: String,
        relationship: String
    },
    documents: [{
        name: String,
        url: String,
        uploaded_at: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Virtual for achievement rate
employeeSchema.virtual('achievement_rate').get(function () {
    if (this.target > 0) {
        return ((this.achieved / this.target) * 100).toFixed(1);
    }
    return 0;
});

// Reset achievements at start of new year
employeeSchema.methods.resetYearlyTarget = function () {
    const currentYear = new Date().getFullYear();
    if (this.last_reset_year < currentYear) {
        this.achieved = 0;
        this.last_reset_year = currentYear;
    }
};

// Include virtuals in JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

// Indexes
employeeSchema.index({ brand_id: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
