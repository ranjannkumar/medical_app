import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth'; 
import api from '../api'; 
import Modal from '../components/Modal'; 
import Notification from '../components/Notification';
import PatientTable from '../components/PatientTable'; 

// DoctorPortal component handles patient viewing and notes updates for doctors
const DoctorPortal = () => {
    const { username, role, logout, token } = useAuth(); 
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [patientListMessage, setPatientListMessage] = useState('');
    const [patientListMessageType, setPatientListMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State for Doctor Notes Modal
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [currentNotesPatient, setCurrentNotesPatient] = useState({
        id: null, name: '', doctor_notes: '', status: ''
    }); 
    const [editNotesMessage, setEditNotesMessage] = useState('');
    const [editNotesMessageType, setEditNotesMessageType] = useState('');

    // Function to fetch all patients from the backend
    const fetchPatients = useCallback(async () => {
        setLoadingPatients(true);
        setPatientListMessage('Loading patients...');
        setPatientListMessageType('info');
        try {
            const data = await api.getPatients(token);
            if (data.patients) {
                setPatients(data.patients);
                setPatientListMessage(''); 
            } else {
                setPatientListMessage(data.error || 'Failed to load patients.');
                setPatientListMessageType('error');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            setPatientListMessage('An error occurred while fetching patients.');
            setPatientListMessageType('error');
        } finally {
            setLoadingPatients(false);
        }
    }, [token]); // Re-run only if token changes

    useEffect(() => {
        if (token && role === 'doctor') {
            fetchPatients();
        }
    }, [token, role, fetchPatients]);

    // Open the "Edit Doctor Notes" modal and load patient data
    const handleViewEditNotes = (id, name, notes, status) => {
        setCurrentNotesPatient({ id, name, doctor_notes: notes || '', status: status || 'active' });
        setIsNotesModalOpen(true); 
        setEditNotesMessage('');
        setEditNotesMessageType('');
    };

    const handleNotesFormChange = (e) => {
        const { name, value } = e.target;
        setCurrentNotesPatient(prevState => ({ ...prevState, [name]: value }));
    };

    // Handle submission of the "Edit Doctor Notes" modal form
    const handleNotesFormSubmit = async (e) => {
        e.preventDefault();
        setEditNotesMessage('');
        setEditNotesMessageType('');

        if (!currentNotesPatient.id) return; 
        try {
            const data = await api.updateDoctorNotes( 
                currentNotesPatient.id,
                { doctor_notes: currentNotesPatient.doctor_notes, status: currentNotesPatient.status },
                token
            );
            if (data.message) {
                setEditNotesMessage('Doctor notes and status updated successfully!');
                setEditNotesMessageType('success');
                setIsNotesModalOpen(false); 
                fetchPatients(); // Refresh patient list
            } else {
                setEditNotesMessage(data.error || 'Failed to update notes.');
                setEditNotesMessageType('error');
            }
        } catch (error) {
            console.error('Update notes error:', error);
            setEditNotesMessage('An error occurred while updating notes.');
            setEditNotesMessageType('error');
        }
    };

    // Display loading message while patients are being fetched
    if (loadingPatients) {
        return <div className="text-center py-8">Loading patients...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 font-inter">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Doctor Portal</h2>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg text-gray-700">Welcome, <span className="font-semibold">{username}</span> (<span className="font-semibold">{role}</span>)</p>
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                    >
                        Logout
                    </button>
                </div>

                {/* Patient List Section */}
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Registered Patients</h3>
                <input type="text" id="patientSearch" placeholder="Search patients..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    className="mb-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <Notification message={patientListMessage} type={patientListMessageType} />
                {/* PatientTable component renders the list and handles actions */}
                <PatientTable
                    patients={patients}
                    role={role}
                    onViewEditNotes={handleViewEditNotes}
                    searchTerm={searchTerm}
                />

                {/* View/Edit Doctor Notes Modal */}
                <Modal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} title={`Edit Doctor Notes for ${currentNotesPatient.name}`}>
                    <Notification message={editNotesMessage} type={editNotesMessageType} />
                    <form onSubmit={handleNotesFormSubmit} className="space-y-4">
                        <input type="hidden" value={currentNotesPatient.id || ''} />
                        <div>
                            <label htmlFor="doctorNotes" className="block text-sm font-medium text-gray-700">Doctor Notes:</label>
                            <textarea id="doctorNotes" name="doctor_notes" rows="6"
                                value={currentNotesPatient.doctor_notes || ''} onChange={handleNotesFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label htmlFor="patientStatus" className="block text-sm font-medium text-gray-700">Status:</label>
                            <select id="patientStatus" name="status"
                                value={currentNotesPatient.status || 'active'} onChange={handleNotesFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="active">Active</option>
                                <option value="discharged">Discharged</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setIsNotesModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Notes
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default DoctorPortal;

