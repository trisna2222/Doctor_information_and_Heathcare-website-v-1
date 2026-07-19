// Doctor Dashboard Controller
const API_URL = 'http://localhost:5000/api';

// Authentication Validation
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'doctor') {
    window.location.href = 'login.html';
}

let doctorProfile = null;
let appointmentsList = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    setupTabSwitching();
    loadDoctorInfo();

    // Hook tab search and filter controls
    document.getElementById('patient-search-input').addEventListener('input', renderAppointmentsTable);
    document.getElementById('appointment-status-filter').addEventListener('change', renderAppointmentsTable);
});

// Sidebar Navigation Tab Switching
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Toggle active state on buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Hide/Show contents
            tabContents.forEach(content => {
                content.style.display = 'none';
                if (content.id === `${tabId}-tab`) {
                    content.style.display = 'block';
                }
            });

            // Update title
            pageTitle.textContent = btn.querySelector('span').textContent;
        });
    });
}

// Fetch Doctor Record and populate info
async function loadDoctorInfo() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctor roster');
        const doctors = await response.json();

        doctorProfile = doctors.find(doc => doc.userId === currentUser.id);

        if (!doctorProfile) {
            showToast("Doctor profile record not found. Please contact Administrator.");
            return;
        }

        // Output doctor details to header and forms
        document.getElementById('doctor-name-header').textContent = `Dr. ${doctorProfile.name || currentUser.name}`;
        if (doctorProfile.image) {
            document.getElementById('doctor-image-header').src = doctorProfile.image;
            document.getElementById('profile-avatar-img').src = doctorProfile.image;
        }

        // Fill settings fields
        document.getElementById('prof-name').value = doctorProfile.name || currentUser.name || "";
        document.getElementById('prof-dept').value = doctorProfile.department || "";
        document.getElementById('prof-qual').value = doctorProfile.qualification || "";
        document.getElementById('prof-role').value = doctorProfile.role || "";
        document.getElementById('prof-fee').value = doctorProfile.fee || "";
        document.getElementById('sched-timetable').value = doctorProfile.schedule || "";
        document.getElementById('prof-bio').value = doctorProfile.bio || "";

        // Load dynamic assets
        await fetchAppointments();
        await fetchReviews();

    } catch (err) {
        showToast(err.message);
    }
}

// Fetch doctor's appointments
async function fetchAppointments() {
    if (!doctorProfile) return;
    try {
        const response = await fetch(`${API_URL}/appointments/doctor/${doctorProfile._id}`);
        if (!response.ok) throw new Error('Failed to load appointments');
        appointmentsList = await response.json();

        // Calculate and load stats
        calculateStats(appointmentsList);

        // Render listings
        renderRecentBookingsQueue(appointmentsList);
        renderAppointmentsTable();
    } catch (err) {
        showToast(err.message);
    }
}

// Calculate dashboard KPIs
function calculateStats(appointments) {
    const totalBookings = appointments.length;
    const pendingAction = appointments.filter(app => app.status === 'Pending').length;
    const approvedOrFinished = appointments.filter(app => app.status === 'Approved' || app.status === 'Completed');

    // Earnings based on fee and approved/completed appointments
    const feeValue = parseFloat(doctorProfile.fee) || 0;
    const totalEarnings = approvedOrFinished.length * feeValue;

    document.getElementById('stats-total').textContent = totalBookings;
    document.getElementById('stats-pending').textContent = pendingAction;
    document.getElementById('stats-earnings').textContent = `৳ ${totalEarnings}`;
}

// Render Dashboard Panel list (Recent Bookings queue)
function renderRecentBookingsQueue(appointments) {
    const recentDiv = document.getElementById('recent-bookings-list');
    const recentItems = appointments.slice(0, 5); // display top 5 recent

    if (recentItems.length === 0) {
        recentDiv.innerHTML = `<div class="empty-state">No appointments found in queue.</div>`;
        return;
    }

    let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
    recentItems.forEach(app => {
        const dateStr = new Date(app.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        let statusClass = 'badge-pending';
        if (app.status === 'Approved') statusClass = 'badge-approved';
        else if (app.status === 'Completed') statusClass = 'badge-completed';
        else if (app.status === 'Cancelled') statusClass = 'badge-cancelled';

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#fafbfd; border-radius:8px; border:1px solid #f1f5f9;">
                <div>
                    <strong style="color:#1e293b;">${app.patientName}</strong>
                    <span style="font-size:0.8rem; color:#888; display:block;">Date: ${dateStr} | Fee: ৳ ${app.fee}</span>
                </div>
                <span class="badge-status ${statusClass}">${app.status}</span>
            </div>
        `;
    });
    html += '</div>';
    recentDiv.innerHTML = html;
}

// Render main appointments management table with filters and search
function renderAppointmentsTable() {
    const tbody = document.getElementById('appointments-table-body');
    const searchTerm = document.getElementById('patient-search-input').value.toLowerCase();
    const statusFilter = document.getElementById('appointment-status-filter').value;

    let filtered = appointmentsList;

    // Filter by patient search term
    if (searchTerm) {
        filtered = filtered.filter(app => app.patientName.toLowerCase().includes(searchTerm));
    }

    // Filter by status dropdown
    if (statusFilter !== 'All') {
        filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state" style="text-align:center; padding:2rem 0;">No matching patient appointments found.</td>
            </tr>
        `;
        return;
    }

    let html = '';
    filtered.forEach(app => {
        const dateStr = new Date(app.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        // Payment status badge
        const paymentBadge = app.paymentStatus === 'Paid'
            ? `<span style="background: #e6fcf5; color: #0ca678; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Paid</span>`
            : `<span style="background: #fff0f6; color: #d6336c; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Unpaid</span>`;

        // Booking status badge
        let statusClass = 'badge-pending';
        if (app.status === 'Approved') statusClass = 'badge-approved';
        else if (app.status === 'Completed') statusClass = 'badge-completed';
        else if (app.status === 'Cancelled') statusClass = 'badge-cancelled';

        // Action controls
        let actionControlsHtml = '';
        if (app.status === 'Pending') {
            actionControlsHtml = `
                <button onclick="updateStatus('${app._id}', 'Approved')" class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; background: #2ecc71; margin-right: 4px;">Approve</button>
                <button onclick="updateStatus('${app._id}', 'Cancelled')" class="btn" style="padding: 4px 8px; font-size: 0.75rem; background: #e74c3c; color: #fff;">Cancel</button>
            `;
        } else if (app.status === 'Approved') {
            actionControlsHtml = `
                <button onclick="updateStatus('${app._id}', 'Completed')" class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;">Complete</button>
                <button onclick="updateStatus('${app._id}', 'Cancelled')" class="btn" style="padding: 4px 8px; font-size: 0.75rem; background: #e74c3c; color: #fff;">Cancel</button>
            `;
        } else {
            actionControlsHtml = `<span style="color:#888; font-style:italic; font-size:0.8rem;">No Actions</span>`;
        }

        // Medical report selector
        let reportHtml = '';
        if (app.report) {
            reportHtml = `
                <a href="${app.report}" download="Report_${app.patientName}.png" class="btn-upload" style="background:#e8fdf0; border-color:#2ecc71; color:#27ae60;">
                    <i class="fas fa-download"></i> View Report
                </a>
            `;
        } else {
            if (app.status === 'Approved' || app.status === 'Completed') {
                reportHtml = `
                    <div class="btn-upload">
                        <i class="fas fa-file-prescription"></i> Upload Report
                        <input type="file" onchange="uploadReport(event, '${app._id}')" accept="image/*,application/pdf">
                    </div>
                `;
            } else {
                reportHtml = `<span style="color:#cbd5e1; font-size:0.8rem;">Pending Approval</span>`;
            }
        }

        html += `
            <tr style="border-bottom:1px solid #f1f5f9; vertical-align: middle;">
                <td style="padding: 12px;">
                    <strong style="display:block; color:#1e293b;">${app.patientName}</strong>
                    <span style="font-size:0.75rem; color:#64748b; display:block;">Email: ${app.patientEmail}</span>
                    <span style="font-size:0.75rem; color:#64748b; display:block;">Phone: ${app.patientPhone} (${app.patientGender || 'N/A'})</span>
                </td>
                <td style="padding:12px; color:#334155; font-size:0.9rem;">${dateStr}</td>
                <td style="padding:12px; max-width: 150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#64748b; font-size:0.85rem;" title="${app.comments || ''}">${app.comments || 'No comment'}</td>
                <td style="padding:12px;">${paymentBadge}</td>
                <td style="padding:12px;"><span class="badge-status ${statusClass}">${app.status}</span></td>
                <td style="padding:12px;">${reportHtml}</td>
                <td style="padding:12px; text-align:right;">${actionControlsHtml}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Update Appointment Status
async function updateStatus(id, newStatus) {
    const approved = await showConfirmModal(`Change Booking Status`, `Are you sure you want to change status to ${newStatus}?`);
    if (!approved) return;

    try {
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showToast(`Appointment status updated to ${newStatus}!`);
        await fetchAppointments();
    } catch (err) {
        showToast(err.message);
    }
}

// Convert Medical Report Upload to Base64 and submit
async function uploadReport(event, apptId) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast("File size too large (max 2MB)");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
        const base64Data = reader.result;
        try {
            const response = await fetch(`${API_URL}/appointments/${apptId}/report`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ report: base64Data })
            });

            if (!response.ok) throw new Error('Failed to submit report');
            showToast("Discharge report/prescription uploaded successfully!");
            await fetchAppointments();
        } catch (err) {
            showToast(err.message);
        }
    };
    reader.readAsDataURL(file);
}

// Submit consulting hours weekly planner
async function submitSchedule(e) {
    e.preventDefault();
    if (!doctorProfile) return;

    const schedule = document.getElementById('sched-timetable').value;
    try {
        const response = await fetch(`${API_URL}/doctors/${doctorProfile._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: doctorProfile.name,
                department: doctorProfile.department,
                role: doctorProfile.role,
                qualification: doctorProfile.qualification,
                fee: doctorProfile.fee,
                image: doctorProfile.image,
                bio: doctorProfile.bio,
                phone: doctorProfile.phone || "",
                schedule: schedule
            })
        });

        if (!response.ok) throw new Error('Failed to save schedule');
        showToast("Timetable schedule updated successfully!");

        // Refresh doctor object in-memory
        await loadDoctorInfo();
    } catch (err) {
        showToast(err.message);
    }
}

// Preview and convert Profile Image Upload
function previewProfileImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast("File size too large (max 2MB)");
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById('profile-avatar-img').src = reader.result;
    };
    reader.readAsDataURL(file);
}

// Submit Doctor Profile Settings Updates
async function submitProfile(e) {
    e.preventDefault();
    if (!doctorProfile) return;

    const name = document.getElementById('prof-name').value;
    const department = document.getElementById('prof-dept').value;
    const qualification = document.getElementById('prof-qual').value;
    const role = document.getElementById('prof-role').value;
    const fee = document.getElementById('prof-fee').value;
    const bio = document.getElementById('prof-bio').value;
    const imageInput = document.getElementById('profile-file-input');

    let base64Image = doctorProfile.image;

    const submitFn = async () => {
        try {
            const response = await fetch(`${API_URL}/doctors/${doctorProfile._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    department,
                    role,
                    qualification,
                    fee: fee.toString(),
                    image: base64Image,
                    bio,
                    schedule: doctorProfile.schedule || "",
                    phone: doctorProfile.phone || ""
                })
            });

            if (!response.ok) throw new Error('Failed to update doctor profile');

            // Also update the User profile picture and name inside DB
            const userResponse = await fetch(`${API_URL}/profile/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    profilePicture: base64Image
                })
            });

            if (userResponse.ok) {
                // Keep frontend metadata aligned
                currentUser.name = name;
                currentUser.profilePicture = base64Image;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }

            showToast("Doctor settings profile updated successfully!");
            await loadDoctorInfo();
        } catch (err) {
            showToast(err.message);
        }
    };

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function () {
            base64Image = reader.result;
            await submitFn();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        await submitFn();
    }
}

// Fetch Reviews submitted by patients for this doctor
async function fetchReviews() {
    if (!doctorProfile) return;
    try {
        const response = await fetch(`${API_URL}/reviews/doctor/${doctorProfile._id}`);
        if (!response.ok) throw new Error('Failed to load reviews');
        const data = await response.json();

        // Update indicators
        document.getElementById('avg-rating-val').textContent = data.averageRating.toFixed(1);
        document.getElementById('total-reviews-count').textContent = `${data.totalReviews} Reviews`;

        // Stars HTML
        let starsHtml = '';
        const rounded = Math.round(data.averageRating);
        for (let i = 1; i <= 5; i++) {
            if (i <= rounded) starsHtml += '<i class="fas fa-star"></i>';
            else starsHtml += '<i class="far fa-star"></i>'; // empty star
        }
        document.getElementById('avg-rating-stars').innerHTML = starsHtml;

        // Render reviews list feed
        const feed = document.getElementById('reviews-feed');
        if (data.reviews.length === 0) {
            feed.innerHTML = `<div class="empty-state">No feedback submitted yet.</div>`;
            return;
        }

        let html = '';
        data.reviews.forEach(rev => {
            const dateStr = new Date(rev.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            let itemStars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rev.rating) itemStars += '<i class="fas fa-star" style="color:#fcc419;"></i>';
                else itemStars += '<i class="far fa-star" style="color:#fcc419;"></i>';
            }

            html += `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <strong style="color:#1e293b; display:block;">${rev.patientName}</strong>
                            <span style="font-size:0.75rem; color:#888;">Submitted: ${dateStr}</span>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end;">
                            <div class="stars">${itemStars}</div>
                            <span style="font-size:0.8rem; color:#888; font-weight:600;">Rating: ${rev.rating}/5</span>
                        </div>
                    </div>
                    <p style="margin: 6px 0 0 0; color:#555; font-size:0.9rem; line-height:1.4;">${rev.comment || 'No comment message left.'}</p>
                </div>
            `;
        });

        feed.innerHTML = html;

    } catch (err) {
        showToast(err.message);
    }
}

// Asynchronous Confirm Modal using Promisification
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;

        modal.style.display = 'flex';

        const onCancel = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(false);
        };

        const onSubmit = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(true);
        };

        const cleanup = () => {
            document.getElementById('confirm-modal-cancel').removeEventListener('click', onCancel);
            document.getElementById('confirm-modal-submit').removeEventListener('click', onSubmit);
        };

        document.getElementById('confirm-modal-cancel').addEventListener('click', onCancel);
        document.getElementById('confirm-modal-submit').addEventListener('click', onSubmit);
    });
}

// Custom animated Toast Notifications helper
function showToast(msg) {
    const toast = document.getElementById('toast-notify');
    document.getElementById('toast-notify-message').textContent = msg;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Doctor Log Out Action
function doctorLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
