const mongoose = require('mongoose');

const AuthLogSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuthLog', AuthLogSchema);
