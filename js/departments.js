const DEPT_API_BASE = 'http://127.0.0.1:5000/api';

window.getDepartments = async () => {
    try {
        const response = await fetch(`${DEPT_API_BASE}/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        // Map _id to id so frontend components keep working without changes
        return data.map(dept => ({ ...dept, id: dept._id }));
    } catch (err) {
        console.error(err);
        return [];
    }
};

window.saveDepartment = async (dept) => {
    try {
        const isUpdate = dept.id && !dept.id.startsWith('dept-'); // Native mongoose _id is a hex string
        
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `${DEPT_API_BASE}/departments/${dept.id}` : `${DEPT_API_BASE}/departments`;
        
        // Remove helper id before sending to database
        const deptToSave = { ...dept };
        delete deptToSave.id;
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deptToSave)
        });
        
        if (!response.ok) throw new Error('Failed to save department');
        return await response.json();
    } catch (err) {
        console.error(err);
    }
};

window.deleteDepartment = async (id) => {
    try {
        if (!id || id.startsWith('dept-')) return;
        const response = await fetch(`${DEPT_API_BASE}/departments/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete department');
    } catch (err) {
        console.error(err);
    }
};
