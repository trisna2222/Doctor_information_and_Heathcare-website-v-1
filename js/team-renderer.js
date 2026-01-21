// Imports removed to use global window objects
// import { getDoctors, getAllDepartments } from './doctors.js';

const container = document.getElementById('team-container');
const doctors = getDoctors();
const departments = getAllDepartments();

// Sort departments to match original order if possible, or just alphabetical
// Original order: Cardiology, Neurology, Orthopedics, Gynecology, Pediatrics, Dermatology, Surgery, Internal Medicine
const departmentOrder = [
    "Cardiology", "Neurology", "Orthopedics", "Gynecology",
    "Pediatrics", "Dermatology", "Surgery", "Internal Medicine"
];

// Sort available departments based on the fixed order, putting others at the end
departments.sort((a, b) => {
    const idxA = departmentOrder.indexOf(a);
    const idxB = departmentOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
});

function createDoctorCard(doc) {
    return `
        <div class="team-card" style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <div class="team-img-box" style="position: relative; height: 300px; overflow: hidden;">
                <img src="${doc.image}" alt="${doc.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/default-doctor.jpg'">
            </div>
            <div class="team-content" style="padding: 1.5rem; text-align: center;">
                <h5 class="team-name" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">${doc.name}</h5>
                <p class="team-role" style="color: var(--bs-primary); margin-bottom: 1rem;">${doc.role}</p>
                <a href="${doc.filename}" class="service-btn">See Details</a>
            </div>
        </div>
    `;
}

function renderTeam() {
    container.innerHTML = '';

    departments.forEach(dept => {
        const deptDoctors = doctors.filter(d => d.department === dept);
        if (deptDoctors.length === 0) return;

        // Section Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'section-header';
        headerDiv.style.textAlign = 'center';
        headerDiv.style.marginTop = '4rem';
        headerDiv.style.marginBottom = '2rem';

        // Map "Surgery" to "General Surgery" for display if needed, or just use dept name
        // The data says "Surgery" but UI said "General Surgery". Let's handle generic display.
        let displayName = dept;
        if (dept === 'Surgery') displayName = 'General Surgery';
        if (dept === 'Gynecology') displayName = 'Gynecology & Obstetrics';

        headerDiv.innerHTML = `<h3 class="section-title" style="font-size: 1.8rem;">${displayName}</h3>`;
        container.appendChild(headerDiv);

        // Grid
        const gridDiv = document.createElement('div');
        gridDiv.className = 'team-grid';
        gridDiv.style.display = 'grid';
        gridDiv.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        gridDiv.style.gap = '2rem';

        deptDoctors.forEach(doc => {
            gridDiv.innerHTML += createDoctorCard(doc);
        });

        container.appendChild(gridDiv);
    });
}

renderTeam();
