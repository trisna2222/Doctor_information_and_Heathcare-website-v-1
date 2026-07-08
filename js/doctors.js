const API_BASE = 'http://127.0.0.1:5000/api';

window.getDoctors = async () => {
    try {
        const response = await fetch(`${API_BASE}/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const data = await response.json();
        // Map _id to id so frontend components keep working without changes
        return data.map(doc => ({ ...doc, id: doc._id }));
    } catch (err) {
        console.error(err);
        return window.initialDoctors || []; // Fallback to safe static data
    }
};

window.getDoctorById = async (id) => {
    const doctors = await window.getDoctors();
    return doctors.find(doc => doc.id === id);
};

window.saveDoctor = async (doctor) => {
    try {
        const isUpdate = doctor.id && !doctor.id.startsWith('doc-'); // Native mongoose _id is a hex string
        
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `${API_BASE}/doctors/${doctor.id}` : `${API_BASE}/doctors`;
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });
        
        if (!response.ok) throw new Error('Failed to save doctor');
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};

window.deleteDoctor = async (id) => {
    try {
        if (!id || id.startsWith('doc-')) return; // Probably static fallback data
        const response = await fetch(`${API_BASE}/doctors/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete doctor');
    } catch (err) {
        console.error(err);
    }
};

window.getAllDepartments = async () => {
    const doctors = await window.getDoctors();
    const departments = [...new Set(doctors.map(d => d.department))];
    return departments;
};
