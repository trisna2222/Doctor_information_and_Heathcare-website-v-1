const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const Doctor = require('../models/Doctor');
const DoctorApplication = require('../models/DoctorApplication');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Create login log
        const log = new AuthLog({
            email: newUser.email,
            action: 'login'
        });
        await log.save();

        // Return user data (excluding password)
        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            joined: newUser.createdAt,
            createdAt: newUser.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create login log
        const log = new AuthLog({
            email: user.email,
            action: 'login'
        });
        await log.save();

        // Return user data (excluding password)
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            joined: user.createdAt,
            createdAt: user.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logout user (adds log entry)
router.post('/logout', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required to log out" });
        }

        // Log logout event
        const log = new AuthLog({
            email,
            action: 'logout'
        });
        await log.save();

        res.json({ message: "Logout logged successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user profile details
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            gender: user.gender || "",
            address: user.address || "",
            profilePicture: user.profilePicture || "",
            joined: user.createdAt,
            createdAt: user.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile details
router.put('/profile/:id', async (req, res) => {
    try {
        const { name, email, phone, gender, address, password, profilePicture } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // Find user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if email already in use by another user
        if (email.toLowerCase() !== user.email.toLowerCase()) {
            const emailExists = await User.findOne({ email: email.toLowerCase() });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use by another account" });
            }
        }

        // Update fields
        user.name = name;
        user.email = email.toLowerCase();
        user.phone = phone || "";
        user.gender = gender || "";
        user.address = address || "";
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        // If password is provided, hash and save it
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            address: user.address,
            profilePicture: user.profilePicture,
            joined: user.createdAt,
            createdAt: user.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all registered users for Admin Panel
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        const usersData = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            gender: user.gender || "",
            address: user.address || "",
            profilePicture: user.profilePicture || "",
            joined: user.createdAt,
            createdAt: user.createdAt
        }));
        res.json(usersData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit a new doctor application
router.post('/doctor-applications/apply', async (req, res) => {
    try {
        const { userId, name, email, phone, department, role, qualification, fee, image, bio, schedule } = req.body;

        if (!userId || !name || !email || !phone || !department || !role || !qualification || !fee || !schedule) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        // Check if there is already a pending or approved application for this user
        const existingApp = await DoctorApplication.findOne({ userId, status: { $in: ['pending', 'approved'] } });
        if (existingApp) {
            if (existingApp.status === 'pending') {
                return res.status(400).json({ message: "You already have a pending application" });
            } else {
                return res.status(400).json({ message: "You are already registered/approved as a doctor" });
            }
        }

        const newApp = new DoctorApplication({
            userId,
            name,
            email,
            phone,
            department,
            role,
            qualification,
            fee,
            image: image || "img/default-doctor.jpg",
            bio: bio || "",
            schedule
        });

        await newApp.save();
        res.status(201).json(newApp);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's latest doctor application status
router.get('/doctor-applications/user/:userId', async (req, res) => {
    try {
        const application = await DoctorApplication.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(application || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all doctor applications (Admin view)
router.get('/doctor-applications', async (req, res) => {
    try {
        const applications = await DoctorApplication.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve doctor application
router.post('/doctor-applications/:id/approve', async (req, res) => {
    try {
        const app = await DoctorApplication.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (app.status === 'approved') {
            return res.status(400).json({ message: "Application is already approved" });
        }

        // Update application status
        app.status = 'approved';
        await app.save();

        // Create new Doctor record
        const newDoctor = new Doctor({
            userId: app.userId,
            name: app.name,
            department: app.department,
            role: app.role,
            qualification: app.qualification,
            fee: app.fee.toString(),
            image: app.image || "img/default-doctor.jpg",
            bio: app.bio || "",
            schedule: app.schedule,
            phone: app.phone || ""
        });

        await newDoctor.save();

        res.json({ message: "Application approved and doctor registered successfully", application: app, doctor: newDoctor });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reject doctor application
router.post('/doctor-applications/:id/reject', async (req, res) => {
    try {
        const app = await DoctorApplication.findById(req.params.id);
        if (!app) {
            return res.status(404).json({ message: "Application not found" });
        }

        app.status = 'rejected';
        await app.save();

        res.json({ message: "Application rejected successfully", application: app });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
