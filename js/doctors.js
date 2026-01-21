/* Relies on window.initialDoctors from doctor-data.js */

const DOC_STORAGE_KEY = 'medicoz_doctors';

// Always update from source of truth (file system scan)
// Only initialize if not already present, so we don't overwrite user changes
if (!localStorage.getItem(DOC_STORAGE_KEY) && window.initialDoctors) {
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(window.initialDoctors));
} else if (localStorage.getItem(DOC_STORAGE_KEY) && window.initialDoctors) {
    // Migration: Check if bio is missing in local data and fill it from initialDoctors with matching ID
    const localDoctors = JSON.parse(localStorage.getItem(DOC_STORAGE_KEY));
    let updated = false;

    localDoctors.forEach(doc => {
        const initialDoc = window.initialDoctors.find(idoc => idoc.id === doc.id);
        if (initialDoc) {
            // Sync specific fields that should be kept up-to-date from code
            if (!doc.filename || doc.filename !== initialDoc.filename) {
                doc.filename = initialDoc.filename;
                updated = true;
            }
            if (!doc.image && initialDoc.image) {
                doc.image = initialDoc.image;
                updated = true;
            }
            if (!doc.bio && initialDoc.bio) {
                doc.bio = initialDoc.bio;
                updated = true;
            }
        }
    });

    if (updated) {
        localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(localDoctors));
    }
}

window.getDoctors = () => {
    const doctors = localStorage.getItem(DOC_STORAGE_KEY);
    return doctors ? JSON.parse(doctors) : (window.initialDoctors || []);
};

window.getDoctorById = (id) => {
    const doctors = window.getDoctors();
    return doctors.find(doc => doc.id === id);
};

window.saveDoctor = (doctor) => {
    const doctors = window.getDoctors();
    const existingIndex = doctors.findIndex(d => d.id === doctor.id);

    if (existingIndex >= 0) {
        doctors[existingIndex] = doctor;
    } else {
        doctors.push(doctor);
    }

    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(doctors));
};

window.deleteDoctor = (id) => {
    let doctors = window.getDoctors();
    doctors = doctors.filter(doc => doc.id !== id);
    localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(doctors));
};

window.getAllDepartments = () => {
    const doctors = window.getDoctors();
    const departments = [...new Set(doctors.map(d => d.department))];
    return departments;
};
