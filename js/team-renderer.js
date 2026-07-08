const container = document.getElementById('team-container');

async function renderTeam() {
    if (!window.getDoctors || !window.getAllDepartments) return;

    const doctors = await window.getDoctors();
    const departments = await window.getAllDepartments();

    // Sort departments to match original order if possible, or just alphabetical
    const departmentOrder = [
        "Cardiology", "Neurology", "Orthopedics", "Gynecology",
        "Pediatrics", "Dermatology", "Surgery", "Internal Medicine"
    ];

    departments.sort((a, b) => {
        const idxA = departmentOrder.indexOf(a);
        const idxB = departmentOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    function createDoctorCard(doc) {
        // Link directly dynamically in real app, or if filename is set, use it
        const link = doc.filename || `doctor-details.html?id=${doc.id}`;
        return `
            <div class="team-card">
                <div class="team-img-box">
                    <a href="${link}">
                        <img src="${doc.image}" alt="${doc.name}" onerror="this.src='img/default-doctor.jpg'">
                    </a>
                </div>
                <div class="team-content">
                    <h5 class="team-name">
                        <a href="${link}">${doc.name}</a>
                    </h5>
                    <p class="team-role">${doc.role || doc.department}</p>
                    <div class="team-card-actions">
                        <a href="tel:${doc.phone || '+8801300570555'}" class="btn-call"><i class="fas fa-phone-alt"></i> Call Now</a>
                        <a href="appointment.html?doctor=${doc.id}" class="btn-book"><i class="fas fa-calendar-check"></i> Book Now</a>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = '';

    departments.forEach(dept => {
        const deptDoctors = doctors.filter(d => d.department === dept);
        if (deptDoctors.length === 0) return;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'section-header';
        headerDiv.style.textAlign = 'center';
        headerDiv.style.marginTop = '4rem';
        headerDiv.style.marginBottom = '2rem';

        let displayName = dept;
        if (dept === 'Surgery') displayName = 'General Surgery';
        if (dept === 'Gynecology') displayName = 'Gynecology & Obstetrics';

        headerDiv.innerHTML = `<h3 class="section-title" style="font-size: 1.8rem;">${displayName}</h3>`;
        container.appendChild(headerDiv);

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

document.addEventListener('DOMContentLoaded', () => {
    if(container) {
        renderTeam();
    }
});
