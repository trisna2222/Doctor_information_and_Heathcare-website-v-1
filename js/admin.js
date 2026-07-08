/* 
   Assumes doctors.js and blog-manager.js have already been loaded 
   and have attached functions to the window object.
*/

/* ===========================
   Tabs Logic
   =========================== */
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => {
            c.style.display = 'none';
            c.classList.remove('active');
        });

        // Add active class to clicked
        tab.classList.add('active');
        const target = document.getElementById(`${tab.dataset.tab}-tab`);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
        }
        
        // Render data for the selected tab
        if (tab.dataset.tab === 'users') {
            renderUsers();
        } else if (tab.dataset.tab === 'doctors') {
            renderDoctors();
        } else if (tab.dataset.tab === 'applications') {
            renderApplications();
        } else if (tab.dataset.tab === 'appointments') {
            renderAppointments();
        }
        
        // Update page title
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.innerText = tab.querySelector('span').innerText;
        }
    });
});

/* ===========================
   DOCTORS Logic
   =========================== */
const docGridContainer = document.getElementById('doctors-grid-container');
const docModal = document.getElementById('doctor-modal');
const docModalTitle = document.getElementById('modal-title');
const docForm = document.getElementById('doctor-form');
const addDocBtn = document.getElementById('add-doctor-btn');
const closeDocBtn = document.getElementById('close-modal');
const docSearchInput = document.getElementById('doctor-search-input');
let allDoctors = [];

// Initial Load Doctors
async function renderDoctors() {
    if (!window.getDoctors) return; // Guard clause

    allDoctors = await window.getDoctors();
    displayDoctors(allDoctors);
}

function displayDoctors(doctorsList) {
    if (!docGridContainer) return;
    docGridContainer.innerHTML = '';

    if (doctorsList.length === 0) {
        docGridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">No doctors found.</div>`;
        return;
    }

    doctorsList.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        
        const schedule = doc.schedule || 'Not Set';
        const fee = doc.fee ? `${doc.fee} BDT` : 'Not Set';
        const qualification = doc.qualification || 'Not Set';

        card.innerHTML = `
            <div class="doctor-card-header">
                <img src="${doc.image}" alt="${doc.name}" onerror="this.src='img/default-doctor.jpg'">
                <span class="doctor-dept-badge">${doc.department}</span>
            </div>
            <div class="doctor-card-body">
                <h3 class="doctor-card-name">${doc.name}</h3>
                <div class="doctor-card-role">${doc.role}</div>
                
                <div class="doctor-card-info">
                    <div class="doctor-info-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${qualification}</span>
                    </div>
                    <div class="doctor-info-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Fee: ${fee}</span>
                    </div>
                    <div class="doctor-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${schedule}</span>
                    </div>
                </div>
                
                <div class="doctor-card-actions">
                    <button class="btn btn-edit btn-sm edit-doc-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm delete-doc-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
        docGridContainer.appendChild(card);
    });

    // Attach Event Listeners
    docGridContainer.querySelectorAll('.edit-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditDocModal(e.target.closest('button').dataset.id));
    });

    docGridContainer.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDocDelete(e.target.closest('button').dataset.id));
    });
}

function handleDoctorSearch() {
    if (!docSearchInput) return;
    const query = docSearchInput.value.toLowerCase().trim();
    
    const filtered = allDoctors.filter(doc => 
        (doc.name && doc.name.toLowerCase().includes(query)) ||
        (doc.department && doc.department.toLowerCase().includes(query)) ||
        (doc.role && doc.role.toLowerCase().includes(query))
    );
    
    displayDoctors(filtered);
}

if (docSearchInput) {
    docSearchInput.addEventListener('input', handleDoctorSearch);
}

function openDocModal() { docModal.classList.add('active'); }
function closeDocModal() {
    docModal.classList.remove('active');
    docForm.reset();
    document.getElementById('doctor-id').value = '';
    document.getElementById('image').value = 'img/default-doctor.jpg';
    document.getElementById('doctor-image-preview').src = 'img/default-doctor.jpg';
    const fileInput = document.getElementById('doctor-image-file');
    if (fileInput) fileInput.value = '';
}

async function openEditDocModal(id) {
    const doc = await window.getDoctorById(id);
    if (!doc) return;

    docModalTitle.innerText = 'Edit Doctor';
    document.getElementById('doctor-id').value = doc.id;
    document.getElementById('name').value = doc.name || '';
    document.getElementById('department').value = doc.department || 'Cardiology';
    document.getElementById('role').value = doc.role || '';
    document.getElementById('qualification').value = doc.qualification || '';
    document.getElementById('fee').value = doc.fee || '';
    document.getElementById('image').value = doc.image || 'img/default-doctor.jpg';
    document.getElementById('doctor-image-preview').src = doc.image || 'img/default-doctor.jpg';
    document.getElementById('bio').value = doc.bio || '';
    document.getElementById('schedule').value = doc.schedule || '';

    openDocModal();
}

async function handleDocDelete(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        await window.deleteDoctor(id);
        renderDoctors();
    }
}

if (docForm) {
    docForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('doctor-id').value;
        const newDoc = {
            id: id || '', // Server will assign _id for new entries
            name: document.getElementById('name').value,
            department: document.getElementById('department').value,
            role: document.getElementById('role').value,
            qualification: document.getElementById('qualification').value,
            fee: document.getElementById('fee').value,
            image: document.getElementById('image').value,
            bio: document.getElementById('bio').value,
            schedule: document.getElementById('schedule').value
        };
        await window.saveDoctor(newDoc);
        closeDocModal();
        renderDoctors();
    });
}

if (addDocBtn) {
    addDocBtn.addEventListener('click', () => {
        docModalTitle.innerText = 'Add New Doctor';
        document.getElementById('image').value = 'img/default-doctor.jpg';
        document.getElementById('doctor-image-preview').src = 'img/default-doctor.jpg';
        const fileInput = document.getElementById('doctor-image-file');
        if (fileInput) fileInput.value = '';
        openDocModal();
    });
}

if (closeDocBtn) {
    closeDocBtn.addEventListener('click', closeDocModal);
}
const cancelDocBtn = document.getElementById('cancel-doctor');
if (cancelDocBtn) cancelDocBtn.addEventListener('click', closeDocModal);

// Doctor image upload and preview handler
const docImageFileInput = document.getElementById('doctor-image-file');
if (docImageFileInput) {
    docImageFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Limit size to 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert("Image file size should be less than 2MB");
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            document.getElementById('image').value = base64;
            document.getElementById('doctor-image-preview').src = base64;
        };
        reader.readAsDataURL(file);
    });
}



/* ===========================
   BLOG Logic
   =========================== */
const blogTableBody = document.getElementById('blogs-table-body');
const blogModal = document.getElementById('blog-modal');
const blogModalTitle = document.getElementById('blog-modal-title');
const blogForm = document.getElementById('blog-form');
const addBlogBtn = document.getElementById('add-blog-btn');
const closeBlogBtn = document.getElementById('close-blog-modal');

function renderBlogs() {
    if (!window.getBlogs) return;

    const blogs = window.getBlogs();
    if (blogTableBody) {
        blogTableBody.innerHTML = '';
        blogs.forEach(blog => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td class="td-flex">
                <img class="blog-img" src="${blog.image}" alt="${blog.title}" onerror="this.src='img/blog1.png'">
                <div>
                    <strong>${blog.title}</strong>
                    <span>${blog.excerpt ? blog.excerpt.substring(0, 45) + '...' : ''}</span>
                </div>
            </td>
            <td>${blog.date}</td>
            <td class="actions-cell">
                <button class="btn btn-edit btn-sm edit-blog-btn" data-id="${blog.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm delete-blog-btn" data-id="${blog.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        blogTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-blog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditBlogModal(e.target.closest('button').dataset.id));
        });

        document.querySelectorAll('.delete-blog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleBlogDelete(e.target.closest('button').dataset.id));
        });
    }
}

function openBlogModal() { blogModal.classList.add('active'); }
function closeBlogModal() {
    blogModal.classList.remove('active');
    blogForm.reset();
    document.getElementById('blog-id').value = '';
}

function openEditBlogModal(id) {
    const blog = window.getBlogById(id);
    if (!blog) return;

    blogModalTitle.innerText = 'Edit Post';
    document.getElementById('blog-id').value = blog.id;
    document.getElementById('blog-title').value = blog.title || '';
    document.getElementById('blog-image').value = blog.image || '';
    document.getElementById('blog-excerpt').value = blog.excerpt || '';
    document.getElementById('blog-content').value = blog.content || '';

    openBlogModal();
}

function handleBlogDelete(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        window.deleteBlog(id);
        renderBlogs();
    }
}

if (blogForm) {
    blogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('blog-id').value;

        const savedBlog = window.getBlogById(id) || {};

        const newBlog = {
            id: id || 'blog-' + Date.now(),
            title: document.getElementById('blog-title').value,
            image: document.getElementById('blog-image').value,
            excerpt: document.getElementById('blog-excerpt').value,
            content: document.getElementById('blog-content').value,
            date: savedBlog.date,
            comments: savedBlog.comments
        };

        window.saveBlog(newBlog);
        closeBlogModal();
        renderBlogs();
    });
}

if (addBlogBtn) {
    addBlogBtn.addEventListener('click', () => {
        blogModalTitle.innerText = 'Add New Post';
        openBlogModal();
    });
}

if (closeBlogBtn) {
    closeBlogBtn.addEventListener('click', closeBlogModal);
}
const cancelBlogBtn = document.getElementById('cancel-blog');
if (cancelBlogBtn) cancelBlogBtn.addEventListener('click', closeBlogModal);

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === docModal) closeDocModal();
    if (e.target === blogModal) closeBlogModal();
});

/* ===========================
   USERS Logic
   =========================== */
const USERS_API_BASE = 'http://localhost:5000/api/auth';
const usersTableBody = document.getElementById('users-table-body');
const userSearchInput = document.getElementById('user-search-input');
let allUsers = [];

async function renderUsers() {
    if (!usersTableBody) return;

    try {
        const response = await fetch(`${USERS_API_BASE}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        allUsers = await response.json();
        
        displayUsers(allUsers);
    } catch (err) {
        console.error('Error rendering users:', err);
        usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">Error loading users from server.</td></tr>`;
    }
}

function displayUsers(usersList) {
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    if (usersList.length === 0) {
        usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No users found.</td></tr>`;
        return;
    }

    usersList.forEach(user => {
        const tr = document.createElement('tr');
        
        // Avatar rendering
        let avatarHTML = '';
        if (user.profilePicture) {
            avatarHTML = `<img src="${user.profilePicture}" alt="${user.name}">`;
        } else {
            const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            avatarHTML = `<div class="avatar" style="width: 40px; height: 40px; font-size: 1rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e2e8f0; color: #4b5563; font-weight: 600;">${initial}</div>`;
        }

        const joinedDate = user.joined ? new Date(user.joined).toLocaleDateString() : 'N/A';

        tr.innerHTML = `
            <td class="td-flex">
                ${avatarHTML}
                <div>
                    <strong>${user.name}</strong>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.phone || '<span style="color: #cbd5e1; font-style: italic;">Not Added</span>'}</td>
            <td>${user.gender || '<span style="color: #cbd5e1; font-style: italic;">Not Added</span>'}</td>
            <td>${user.address || '<span style="color: #cbd5e1; font-style: italic;">Not Added</span>'}</td>
            <td>${joinedDate}</td>
        `;
        usersTableBody.appendChild(tr);
    });
}

function handleUserSearch() {
    if (!userSearchInput) return;
    const query = userSearchInput.value.toLowerCase().trim();
    
    const filtered = allUsers.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
    );
    
    displayUsers(filtered);
}

if (userSearchInput) {
    userSearchInput.addEventListener('input', handleUserSearch);
}

// Init
renderDoctors();
renderBlogs();
renderUsers();
renderApplications();
renderAppointments();

/* ===========================
   APPLICATIONS Logic
   =========================== */
const applicationsTableBody = document.getElementById('applications-table-body');
const applicationSearchInput = document.getElementById('application-search-input');
let allApplications = [];

async function renderApplications() {
    if (!applicationsTableBody) return;

    try {
        const response = await fetch(`${USERS_API_BASE}/doctor-applications`);
        if (!response.ok) throw new Error('Failed to fetch applications');
        allApplications = await response.json();
        
        displayApplications(allApplications);
    } catch (err) {
        console.error('Error rendering applications:', err);
        applicationsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">Error loading doctor applications from server.</td></tr>`;
    }
}

function displayApplications(applicationsList) {
    if (!applicationsTableBody) return;
    applicationsTableBody.innerHTML = '';

    if (applicationsList.length === 0) {
        applicationsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No applications found.</td></tr>`;
        return;
    }

    applicationsList.forEach(app => {
        const tr = document.createElement('tr');
        
        // Avatar rendering
        let avatarHTML = '';
        if (app.image && app.image.startsWith('data:image')) {
            avatarHTML = `<img src="${app.image}" alt="${app.name}">`;
        } else {
            const initial = app.name ? app.name.charAt(0).toUpperCase() : 'A';
            avatarHTML = `<div class="avatar" style="width: 40px; height: 40px; font-size: 1rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e2e8f0; color: #4b5563; font-weight: 600;">${initial}</div>`;
        }

        const fee = app.fee ? `${app.fee} BDT` : 'Not Set';
        
        // Status Badge
        let statusBadge = '';
        if (app.status === 'pending') {
            statusBadge = `<span class="role-badge" style="background: #fef3c7; color: #d97706; font-weight: 600;">Pending</span>`;
        } else if (app.status === 'approved') {
            statusBadge = `<span class="role-badge" style="background: #d1fae5; color: #059669; font-weight: 600;">Approved</span>`;
        } else if (app.status === 'rejected') {
            statusBadge = `<span class="role-badge" style="background: #fee2e2; color: #dc2626; font-weight: 600;">Rejected</span>`;
        }

        // Action Buttons (only show Approve/Reject if pending)
        let actionsHTML = '';
        if (app.status === 'pending') {
            actionsHTML = `
                <button class="btn btn-primary btn-sm approve-app-btn" data-id="${app._id}" style="background: #10b981; color: white;"><i class="fas fa-check"></i> Approve</button>
                <button class="btn btn-danger btn-sm reject-app-btn" data-id="${app._id}"><i class="fas fa-times"></i> Reject</button>
            `;
        } else {
            actionsHTML = `<span style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">Processed</span>`;
        }

        tr.innerHTML = `
            <td class="td-flex">
                ${avatarHTML}
                <div>
                    <strong>${app.name}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">ID: ${app.userId}</span>
                </div>
            </td>
            <td>
                <div style="font-size: 0.85rem;"><strong>${app.email}</strong></div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${app.phone}</div>
            </td>
            <td>
                <strong>${app.department}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${app.role}</div>
            </td>
            <td>${fee}</td>
            <td style="font-size: 0.85rem;">${app.schedule}</td>
            <td>${statusBadge}</td>
            <td class="actions-cell">
                ${actionsHTML}
            </td>
        `;
        applicationsTableBody.appendChild(tr);
    });

    // Attach Event Listeners
    applicationsTableBody.querySelectorAll('.approve-app-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleApproveApplication(e.target.closest('button').dataset.id));
    });

    applicationsTableBody.querySelectorAll('.reject-app-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleRejectApplication(e.target.closest('button').dataset.id));
    });
}

async function handleApproveApplication(id) {
    if (!confirm('Are you sure you want to approve this doctor application?')) return;

    try {
        const response = await fetch(`${USERS_API_BASE}/doctor-applications/${id}/approve`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to approve application');
        
        alert('Application approved successfully!');
        renderApplications();
        renderDoctors(); // Reload doctors list too
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

async function handleRejectApplication(id) {
    if (!confirm('Are you sure you want to reject this doctor application?')) return;

    try {
        const response = await fetch(`${USERS_API_BASE}/doctor-applications/${id}/reject`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to reject application');
        
        alert('Application rejected successfully!');
        renderApplications();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function handleApplicationSearch() {
    if (!applicationSearchInput) return;
    const query = applicationSearchInput.value.toLowerCase().trim();
    
    const filtered = allApplications.filter(app => 
        (app.name && app.name.toLowerCase().includes(query)) ||
        (app.email && app.email.toLowerCase().includes(query)) ||
        (app.department && app.department.toLowerCase().includes(query))
    );
    
    displayApplications(filtered);
}

if (applicationSearchInput) {
    applicationSearchInput.addEventListener('input', handleApplicationSearch);
}

/* ===========================
   APPOINTMENTS Logic
   =========================== */
const appointmentsTableBody = document.getElementById('appointments-table-body');
const appointmentSearchInput = document.getElementById('appointment-search-input');
let allAppointments = [];

async function renderAppointments() {
    if (!appointmentsTableBody) return;

    try {
        const response = await fetch('http://localhost:5000/api/appointments');
        if (!response.ok) throw new Error('Failed to fetch appointments');
        allAppointments = await response.json();
        
        displayAppointments(allAppointments);
    } catch (err) {
        console.error('Error rendering appointments:', err);
        appointmentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">Error loading appointments.</td></tr>`;
    }
}

function displayAppointments(appointmentsList) {
    if (!appointmentsTableBody) return;
    appointmentsTableBody.innerHTML = '';

    if (appointmentsList.length === 0) {
        appointmentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">No appointments found.</td></tr>`;
        return;
    }

    appointmentsList.forEach(app => {
        const tr = document.createElement('tr');
        
        const dateStr = new Date(app.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        // Payment status badge / button
        const paymentColor = app.paymentStatus === 'Paid' ? '#0ca678' : '#d6336c';
        const paymentBg = app.paymentStatus === 'Paid' ? '#e6fcf5' : '#fff0f6';
        const paymentBadgeHTML = `
            <button class="toggle-payment-btn" data-id="${app._id}" data-current="${app.paymentStatus}" 
                style="background: ${paymentBg}; color: ${paymentColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; border: 1px solid ${paymentColor}; cursor: pointer; transition: all 0.2s;">
                ${app.paymentStatus}
            </button>
        `;

        // Booking status badge
        let statusColor = '#495057';
        let statusBg = '#f1f3f5';
        if (app.status === 'Approved') { statusColor = '#2b8a3e'; statusBg = '#ebfbee'; }
        else if (app.status === 'Completed') { statusColor = '#1c7ed6'; statusBg = '#e7f5ff'; }
        else if (app.status === 'Cancelled') { statusColor = '#c92a2a'; statusBg = '#fff5f5'; }

        const statusBadgeHTML = `
            <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; display: inline-block;">
                ${app.status}
            </span>
        `;

        // Direct control buttons
        let actionsHTML = '';
        if (app.status === 'Pending') {
            actionsHTML = `
                <button class="btn btn-primary btn-sm approve-appt-btn" data-id="${app._id}" style="background: #27ae60; color: white; border: none; padding: 4px 8px; margin-right: 4px; cursor: pointer; border-radius: 4px;"><i class="fas fa-check"></i> Approve</button>
                <button class="btn btn-danger btn-sm cancel-appt-btn" data-id="${app._id}" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; margin-right: 4px; cursor: pointer; border-radius: 4px;"><i class="fas fa-times"></i> Cancel</button>
            `;
        } else if (app.status === 'Approved') {
            actionsHTML = `
                <button class="btn btn-primary btn-sm complete-appt-btn" data-id="${app._id}" style="background: #2980b9; color: white; border: none; padding: 4px 8px; margin-right: 4px; cursor: pointer; border-radius: 4px;"><i class="fas fa-check-double"></i> Complete</button>
                <button class="btn btn-danger btn-sm cancel-appt-btn" data-id="${app._id}" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; margin-right: 4px; cursor: pointer; border-radius: 4px;"><i class="fas fa-times"></i> Cancel</button>
            `;
        }
        
        // Delete button is always available to admin
        actionsHTML += `
            <button class="btn btn-danger btn-sm delete-appt-btn" data-id="${app._id}" style="background: #dc3545; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;" title="Delete Booking"><i class="fas fa-trash"></i></button>
        `;

        // Safe access to populated refs
        const patientName = app.patientName || (app.patientId && app.patientId.name) || 'Unknown';
        const patientEmail = app.patientEmail || (app.patientId && app.patientId.email) || 'N/A';
        const doctorName = (app.doctorId && app.doctorId.name) || 'Unknown Doctor';
        const doctorDept = (app.doctorId && app.doctorId.department) || 'N/A';

        tr.innerHTML = `
            <td>
                <strong>${patientName}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${patientEmail}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${app.patientPhone || ''} (${app.patientGender || ''})</div>
            </td>
            <td>
                <strong>${doctorName}</strong>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${doctorDept}</div>
            </td>
            <td>
                <div>${dateStr}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${app.comments || ''}">
                    ${app.comments ? `"${app.comments}"` : 'No comments'}
                </div>
            </td>
            <td><strong>${app.fee} BDT</strong></td>
            <td>${paymentBadgeHTML}</td>
            <td>${statusBadgeHTML}</td>
            <td class="text-right">
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 4px;">
                    ${actionsHTML}
                </div>
            </td>
        `;
        appointmentsTableBody.appendChild(tr);
    });

    // Attach Event Listeners
    appointmentsTableBody.querySelectorAll('.toggle-payment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            const current = e.target.closest('button').dataset.current;
            const targetPaymentStatus = current === 'Paid' ? 'Unpaid' : 'Paid';
            handlePaymentToggle(id, targetPaymentStatus);
        });
    });

    appointmentsTableBody.querySelectorAll('.approve-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleApptStatusUpdate(e.target.closest('button').dataset.id, 'Approved'));
    });

    appointmentsTableBody.querySelectorAll('.complete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleApptStatusUpdate(e.target.closest('button').dataset.id, 'Completed'));
    });

    appointmentsTableBody.querySelectorAll('.cancel-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleApptStatusUpdate(e.target.closest('button').dataset.id, 'Cancelled'));
    });

    appointmentsTableBody.querySelectorAll('.delete-appt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleApptDelete(e.target.closest('button').dataset.id));
    });
}

async function handleApptStatusUpdate(id, newStatus) {
    if (!confirm(`Are you sure you want to set this appointment status to ${newStatus}?`)) return;

    try {
        const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');
        alert(`Appointment status updated to ${newStatus}!`);
        renderAppointments();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

async function handlePaymentToggle(id, targetPaymentStatus) {
    try {
        const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: targetPaymentStatus })
        });

        if (!response.ok) throw new Error('Failed to toggle payment status');
        alert(`Payment status set to ${targetPaymentStatus}!`);
        renderAppointments();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

async function handleApptDelete(id) {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete appointment');
        alert('Appointment deleted successfully!');
        renderAppointments();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function handleAppointmentSearch() {
    if (!appointmentSearchInput) return;
    const query = appointmentSearchInput.value.toLowerCase().trim();
    
    const filtered = allAppointments.filter(app => {
        const patientName = app.patientName || (app.patientId && app.patientId.name) || '';
        const doctorName = (app.doctorId && app.doctorId.name) || '';
        const comments = app.comments || '';
        
        return patientName.toLowerCase().includes(query) ||
               doctorName.toLowerCase().includes(query) ||
               comments.toLowerCase().includes(query);
    });
    
    displayAppointments(filtered);
}

if (appointmentSearchInput) {
    appointmentSearchInput.addEventListener('input', handleAppointmentSearch);
}
