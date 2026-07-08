const mongoose = require('mongoose');

const DoctorApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: "img/default-doctor.jpg"
    },
    bio: {
        type: String,
        default: ""
    },
    schedule: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DoctorApplication', DoctorApplicationSchema);
