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
    });
});

/* ===========================
   DOCTORS Logic
   =========================== */
const docTableBody = document.getElementById('doctors-table-body');
const docModal = document.getElementById('doctor-modal');
const docModalTitle = document.getElementById('modal-title');
const docForm = document.getElementById('doctor-form');
const addDocBtn = document.getElementById('add-doctor-btn');
const closeDocBtn = document.getElementById('close-modal');

// Initial Load Doctors
function renderDoctors() {
    if (!window.getDoctors) return; // Guard clause

    const doctors = window.getDoctors();
    docTableBody.innerHTML = '';

    doctors.forEach(doc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${doc.image}" alt="${doc.name}" onerror="this.src='img/default-doctor.jpg'"></td>
            <td><strong>${doc.name}</strong></td>
            <td>${doc.department}</td>
            <td>${doc.role}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-doc-btn" data-id="${doc.id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm delete-doc-btn" data-id="${doc.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        docTableBody.appendChild(tr);
    });

    // Attach Event Listeners
    document.querySelectorAll('.edit-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openEditDocModal(e.target.closest('button').dataset.id));
    });

    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleDocDelete(e.target.closest('button').dataset.id));
    });
}

function openDocModal() { docModal.classList.add('active'); }
function closeDocModal() {
    docModal.classList.remove('active');
    docForm.reset();
    document.getElementById('doctor-id').value = '';
}

function openEditDocModal(id) {
    const doc = window.getDoctorById(id);
    if (!doc) return;

    docModalTitle.innerText = 'Edit Doctor';
    document.getElementById('doctor-id').value = doc.id;
    document.getElementById('name').value = doc.name || '';
    document.getElementById('department').value = doc.department || 'Cardiology';
    document.getElementById('role').value = doc.role || '';
    document.getElementById('qualification').value = doc.qualification || '';
    document.getElementById('fee').value = doc.fee || '';
    document.getElementById('image').value = doc.image || '';
    document.getElementById('bio').value = doc.bio || '';
    document.getElementById('schedule').value = doc.schedule || '';

    openDocModal();
}

function handleDocDelete(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        window.deleteDoctor(id);
        renderDoctors();
    }
}

if (docForm) {
    docForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('doctor-id').value;
        const newDoc = {
            id: id || 'doc-' + Date.now(),
            name: document.getElementById('name').value,
            department: document.getElementById('department').value,
            role: document.getElementById('role').value,
            qualification: document.getElementById('qualification').value,
            fee: document.getElementById('fee').value,
            image: document.getElementById('image').value,
            bio: document.getElementById('bio').value,
            schedule: document.getElementById('schedule').value
        };
        window.saveDoctor(newDoc);
        closeDocModal();
        renderDoctors();
    });
}

if (addDocBtn) {
    addDocBtn.addEventListener('click', () => {
        docModalTitle.innerText = 'Add New Doctor';
        openDocModal();
    });
}

if (closeDocBtn) {
    closeDocBtn.addEventListener('click', closeDocModal);
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
                <td><img src="${blog.image}" alt="${blog.title}" onerror="this.src='img/blog1.png'"></td>
                <td><strong>${blog.title}</strong></td>
                <td>${blog.date}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-blog-btn" data-id="${blog.id}"><i class="fas fa-edit"></i> Edit</button>
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

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === docModal) closeDocModal();
    if (e.target === blogModal) closeBlogModal();
});

// Init
renderDoctors();
renderBlogs();
