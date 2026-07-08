const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Department = require('../models/Department');
const User = require('../models/User');

// Get all doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Add a doctor
router.post('/doctors', async (req, res) => {
    const doctor = new Doctor(req.body);
    try {
        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH (Partial Update)
router.patch('/doctors/:id', async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // updated data return করবে
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a doctor (Full Update)
router.put('/doctors/:id', async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a doctor
router.delete('/doctors/:id', async (req, res) => {
    try {
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doctor deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===================================
// APPOINTMENTS ENDPOINTS
// ===================================

// Book an appointment
router.post('/appointments/book', async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            patientName,
            patientEmail,
            patientPhone,
            patientGender,
            date,
            comments,
            fee,
            paymentStatus,
            paymentDetails
        } = req.body;

        if (!patientId || !doctorId || !patientName || !patientEmail || !patientPhone || !date || !fee) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        const appointment = new Appointment({
            patientId,
            doctorId,
            patientName,
            patientEmail,
            patientPhone,
            patientGender: patientGender || '',
            date,
            comments: comments || '',
            fee: Number(fee),
            paymentStatus: paymentStatus || 'Unpaid',
            paymentDetails: paymentDetails || { method: '', transactionId: '', accountNumber: '' }
        });

        if (paymentStatus === 'Paid' && appointment.paymentDetails) {
            appointment.paymentDetails.paidAt = new Date();
        }

        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all appointments (Admin)
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'name department')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments for a user (patient)
router.get('/appointments/user/:userId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.userId })
            .populate('doctorId', 'name department role image phone')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get appointments for a doctor (Doctor dashboard)
router.get('/appointments/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'name email profilePicture')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update appointment status / payment status
router.put('/appointments/:id/status', async (req, res) => {
    try {
        const { status, paymentStatus, paymentDetails } = req.body;
        const updateData = {};

        if (status) updateData.status = status;
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
            if (paymentStatus === 'Paid') {
                updateData['paymentDetails.paidAt'] = new Date();
            }
        }
        if (paymentDetails) {
            if (paymentDetails.method) updateData['paymentDetails.method'] = paymentDetails.method;
            if (paymentDetails.transactionId) updateData['paymentDetails.transactionId'] = paymentDetails.transactionId;
            if (paymentDetails.accountNumber) updateData['paymentDetails.accountNumber'] = paymentDetails.accountNumber;
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an appointment
router.delete('/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===================================
// REVIEWS ENDPOINTS
// ===================================

// Submit a review
router.post('/reviews', async (req, res) => {
    try {
        const { patientId, patientName, doctorId, rating, comment } = req.body;

        if (!patientId || !patientName || !doctorId || !rating) {
            return res.status(400).json({ message: 'Missing required review fields' });
        }

        const review = new Review({
            patientId,
            patientName,
            doctorId,
            rating: Number(rating),
            comment: comment || ''
        });

        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get reviews for a doctor
router.get('/reviews/doctor/:doctorId', async (req, res) => {
    try {
        const reviews = await Review.find({ doctorId: req.params.doctorId })
            .sort({ createdAt: -1 });

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.json({
            reviews,
            averageRating: Number(averageRating),
            totalReviews: reviews.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const Message = require('../models/Message');

// ===================================
// CONTACT MESSAGES ENDPOINTS
// ===================================

// Submit a contact message
router.post('/messages', async (req, res) => {
    try {
        const { name, email, phone, project, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newMessage = new Message({ name, email, phone, project, subject, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all contact messages (Admin)
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a message (Admin)
router.delete('/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===================================
// DEPARTMENTS ENDPOINTS
// ===================================

// Get all departments
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a department
router.post('/departments', async (req, res) => {
    const department = new Department(req.body);
    try {
        const newDepartment = await department.save();
        res.status(201).json(newDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a department
router.put('/departments/:id', async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a department
router.delete('/departments/:id', async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===================================
// COMMENTS ENDPOINTS
// ===================================
const Comment = require('../models/Comment');

// Submit a comment
router.post('/comments', async (req, res) => {
    try {
        const { blogId, blogTitle, userId, userName, userEmail, commentText } = req.body;

        if (!blogId || !blogTitle || !userName || !userEmail || !commentText) {
            return res.status(400).json({ message: 'Missing required comment fields' });
        }

        const comment = new Comment({
            blogId,
            blogTitle,
            userId: userId || null,
            userName,
            userEmail,
            commentText,
            status: 'pending' // Default initially
        });

        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get approved comments for a specific blog post
router.get('/comments/blog/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId, status: 'approved' })
            .populate('userId', 'profilePicture')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all comments for Admin panel
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('userId', 'profilePicture')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update comment status (approve/reject)
router.put('/comments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid or missing status value' });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json(updatedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;