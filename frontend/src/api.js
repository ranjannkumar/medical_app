// API utility functions for making requests to the backend
const api = {
    _headers: (token) => ({
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), 
    }),

    // Authenticate user
    login: async (username, password) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: api._headers(), // No token needed for login
            body: JSON.stringify({ username, password }),
        });
        return response.json();
    },

    // Get all patients
    getPatients: async (token) => {
        const response = await fetch('/api/patients', {
            method: 'GET',
            headers: api._headers(token), // Token required
        });
        return response.json();
    },

    // Create a new patient (receptionist only)
    createPatient: async (patientData, token) => {
        const response = await fetch('/api/receptionist/patients', {
            method: 'POST',
            headers: api._headers(token), // Token required
            body: JSON.stringify(patientData),
        });
        return response.json();
    },

    // Get a specific patient by ID (receptionist or doctor)
    getPatientById: async (id, token) => {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'GET',
            headers: api._headers(token), // Token required
        });
        return response.json();
    },

    // Update patient details 
    updatePatient: async (id, patientData, token) => {
        const response = await fetch(`/api/receptionist/patients/${id}`, {
            method: 'PUT',
            headers: api._headers(token), // Token required
            body: JSON.stringify(patientData),
        });
        return response.json();
    },

    // Delete a patient 
    deletePatient: async (id, token) => {
        const response = await fetch(`/api/receptionist/patients/${id}`, {
            method: 'DELETE',
            headers: api._headers(token), // Token required
        });
        return response.json();
    },

    // Update doctor notes and patient status (doctor only)
    updateDoctorNotes: async (id, notesData, token) => {
        const response = await fetch(`/api/doctor/patients/${id}/notes`, {
            method: 'PUT',
            headers: api._headers(token), // Token required
            body: JSON.stringify(notesData),
        });
        return response.json();
    },
};

export default api;

