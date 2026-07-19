const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientEmail: {
        type: String,
        required: true
    },
    patientPhone: {
        type: String,
        required: true
    },
    patientGender: {
        type: String,
        default: ""
    },
    date: {
        type: String, // format: YYYY-MM-DD or MM/DD/YYYY
        required: true
    },
    comments: {
        type: String,
        default: ""
    },
    fee: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    paymentDetails: {
        method: { type: String, default: "" }, // e.g. Visa, bKash
        transactionId: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        paidAt: { type: Date }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    report: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
