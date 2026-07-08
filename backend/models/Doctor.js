const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    department: { type: String },
    role: { type: String },
    qualification: { type: String },
    fee: { type: String },
    image: { type: String },
    bio: { type: String },
    schedule: { type: String },
    phone: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
