const container = document.getElementById('team-container');

let allDoctors = [];
let allDepartments = [];
let selectedAlphabet = 'All';

// Helper to check if a day name is in doctor's schedule
function matchesDay(schedule, dayName) {
    if (!schedule) return false;
    const cleanSchedule = schedule.toLowerCase();
    const day = dayName.toLowerCase();

    // Direct check (e.g. "mon" is in schedule)
    if (cleanSchedule.includes(day)) return true;

    // Range check like "sat - wed" or "sat-wed"
    const daysOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const rangeRegex = /(sun|mon|tue|wed|thu|fri|sat)\s*-\s*(sun|mon|tue|wed|thu|fri|sat)/g;
    let match;
    while ((match = rangeRegex.exec(cleanSchedule)) !== null) {
        const startDay = match[1];
        const endDay = match[2];
        const startIdx = daysOrder.indexOf(startDay);
        const endIdx = daysOrder.indexOf(endDay);
        const dayIdx = daysOrder.indexOf(day);

        if (startIdx !== -1 && endIdx !== -1 && dayIdx !== -1) {
            if (startIdx <= endIdx) {
                if (dayIdx >= startIdx && dayIdx <= endIdx) return true;
            } else {
                if (dayIdx >= startIdx || dayIdx <= endIdx) return true;
            }
        }
    }
    return false;
}

function createDoctorCard(doc) {
    const link = doc.filename || `doctor-details.html?id=${doc.id}`;
    return `
        <div class="team-card animate-card">
            <div class="team-img-box">
                <a href="${link}">
                    <img src="${doc.image}" alt="${doc.name}" onerror="this.src='img/default-doctor.jpg'">
                </a>
                <div class="dept-badge">${doc.department}</div>
            </div>
            <div class="team-content">
                <h5 class="team-name">
                    <a href="${link}">${doc.name}</a>
                </h5>
                <div class="team-role">${doc.role || doc.department}</div>
                
                <div class="team-details-grid">
                    <div class="detail-item" title="Qualification">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${doc.qualification || 'MBBS, FCPS'}</span>
                    </div>
                    <div class="detail-item" title="Consultation Fee">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>৳${doc.fee || '1200'} BDT</span>
                    </div>
                    <div class="detail-item full-width" title="Schedule">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${doc.schedule || 'Available on Call'}</span>
                    </div>
                    <div class="detail-item" title="Phone">
                        <i class="fas fa-phone-alt"></i>
                        <span>${doc.phone || '+8801300570555'}</span>
                    </div>
                </div>

                ${doc.bio ? `<p class="team-bio-short" title="${doc.bio}">${doc.bio}</p>` : ''}

                <div class="team-card-actions">
                    <a href="tel:${doc.phone || '+8801300570555'}" class="btn-call"><i class="fas fa-phone-alt"></i> Call</a>
                    <a href="appointment.html?doctor=${doc.id}" class="btn-book"><i class="fas fa-calendar-check"></i> Book Now</a>
                </div>
            </div>
        </div>
    `;
}

function applyFiltersAndRender() {
    if (!container) return;

    // Get input values
    const searchName = document.getElementById('search-name') ? document.getElementById('search-name').value.trim().toLowerCase() : '';
    const searchSpeciality = document.getElementById('search-speciality') ? document.getElementById('search-speciality').value : '';
    const searchDate = document.getElementById('search-date') ? document.getElementById('search-date').value.trim() : '';
    const searchAvailability = document.getElementById('search-availability') ? document.getElementById('search-availability').value : 'Both';

    // Parse date for weekday match
    let targetDayName = null;
    if (searchDate) {
        const parsedDate = new Date(searchDate);
        if (!isNaN(parsedDate.getTime())) {
            const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            targetDayName = daysMap[parsedDate.getDay()];
        }
    }

    // Filter doctors
    const filteredDoctors = allDoctors.filter(doc => {
        // Name filter
        if (searchName && !doc.name.toLowerCase().includes(searchName)) {
            return false;
        }

        // Speciality (department) filter
        if (searchSpeciality && doc.department !== searchSpeciality) {
            return false;
        }

        // Availability filter
        if (searchAvailability === 'Available' && (!doc.schedule || doc.schedule.trim() === '')) {
            return false;
        }
        if (searchAvailability === 'Unavailable' && doc.schedule && doc.schedule.trim() !== '') {
            return false;
        }

        // Date filter
        if (targetDayName && !matchesDay(doc.schedule, targetDayName)) {
            return false;
        }

        return true;
    });

    // Filter departments (alphabet filter)
    const filteredDepartments = allDepartments.filter(dept => {
        if (selectedAlphabet && selectedAlphabet !== 'All') {
            return dept.toLowerCase().startsWith(selectedAlphabet.toLowerCase());
        }
        return true;
    });

    container.innerHTML = '';

    // Count how many doctors are actually rendered
    let renderedCount = 0;

    filteredDepartments.forEach(dept => {
        const deptDoctors = filteredDoctors.filter(d => d.department === dept);
        if (deptDoctors.length === 0) return;

        renderedCount += deptDoctors.length;

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
        gridDiv.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        gridDiv.style.gap = '2rem';

        deptDoctors.forEach(doc => {
            gridDiv.innerHTML += createDoctorCard(doc);
        });

        container.appendChild(gridDiv);
    });

    // If no doctors found, show fallback message
    if (renderedCount === 0) {
        container.innerHTML = `
            <div class="no-doctors-found" style="text-align: center; padding: 5rem 2rem; color: #777; width: 100%;">
                <i class="fas fa-user-md-slash" style="font-size: 4rem; color: #1066a8; margin-bottom: 1.5rem; display: block; opacity: 0.7;"></i>
                <h4 style="font-size: 1.6rem; color: #1a2b4b; margin-bottom: 0.5rem; font-weight: 700;">No Doctors Found</h4>
                <p style="font-size: 1rem; color: #666; max-width: 500px; margin: 0 auto;">
                    We couldn't find any specialists matching your current search criteria. Please try adjusting your filters or search terms.
                </p>
            </div>
        `;
    }
}

async function initTeam() {
    if (!window.getDoctors || !window.getAllDepartments) return;

    // Load initial data
    allDoctors = await window.getDoctors();
    allDepartments = await window.getAllDepartments();

    // Sort departments
    const departmentOrder = [
        "Cardiology", "Neurology", "Orthopedics", "Gynecology",
        "Pediatrics", "Dermatology", "Surgery", "Internal Medicine"
    ];

    allDepartments.sort((a, b) => {
        const idxA = departmentOrder.indexOf(a);
        const idxB = departmentOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    // Initial render
    applyFiltersAndRender();

    // Set up real-time search event listeners
    const nameInput = document.getElementById('search-name');
    const specialitySelect = document.getElementById('search-speciality');
    const dateInput = document.getElementById('search-date');
    const availabilitySelect = document.getElementById('search-availability');
    const searchForm = document.querySelector('.search-form-container form');

    if (nameInput) {
        nameInput.addEventListener('input', applyFiltersAndRender);
    }
    if (specialitySelect) {
        specialitySelect.addEventListener('change', applyFiltersAndRender);
    }
    if (dateInput) {
        dateInput.addEventListener('input', applyFiltersAndRender);
        dateInput.addEventListener('change', applyFiltersAndRender);
    }
    if (availabilitySelect) {
        availabilitySelect.addEventListener('change', applyFiltersAndRender);
    }
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFiltersAndRender();
        });
    }

    // Set up alphabet list click listeners
    const alphabetLinks = document.querySelectorAll('.alphabet-list .alphabet-item a');
    alphabetLinks.forEach(link => {
        // Find the active link by text (default to 'All')
        if (link.textContent.trim() === 'All') {
            link.classList.add('active');
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active styling
            alphabetLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update letter and filter
            selectedAlphabet = link.textContent.trim();
            applyFiltersAndRender();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (container) {
        initTeam();
    }
});
