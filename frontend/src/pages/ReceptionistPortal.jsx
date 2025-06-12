import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth'; 
import api from '../api'; 
import Modal from '../components/Modal'; 
import Notification from '../components/Notification'; 
import PatientTable from '../components/PatientTable'; 
// ReceptionistPortal component handles patient management for receptionists
const ReceptionistPortal = () => {
    const { username, role, logout, token } = useAuth(); 
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [patientListMessage, setPatientListMessage] = useState('');
    const [patientListMessageType, setPatientListMessageType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State for Add Patient Form
    const [addPatientForm, setAddPatientForm] = useState({
        first_name: '', last_name: '', dob: '', gender: '', contact: '', address: ''
    });
    const [addPatientMessage, setAddPatientMessage] = useState('');
    const [addPatientMessageType, setAddPatientMessageType] = useState('');

    // State for Edit Patient Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditPatient, setCurrentEditPatient] = useState(null); 
    const [editPatientMessage, setEditPatientMessage] = useState('');
    const [editPatientMessageType, setEditPatientMessageType] = useState('');

    // State for Delete Confirmation Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null); 
    const [deletePatientMessage, setDeletePatientMessage] = useState('');
    const [deletePatientMessageType, setDeletePatientMessageType] = useState('');

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
        if (token && role === 'receptionist') {
            fetchPatients();
        }
    }, [token, role, fetchPatients]);

    const handleAddPatientChange = (e) => {
        const { name, value } = e.target;
        setAddPatientForm(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddPatientSubmit = async (e) => {
        e.preventDefault();
        setAddPatientMessage(''); // Clear previous messages
        setAddPatientMessageType('');

        try {
            const data = await api.createPatient(addPatientForm, token); 
            if (data.message) {
                setAddPatientMessage('Patient added successfully!');
                setAddPatientMessageType('success');
                setAddPatientForm({ first_name: '', last_name: '', dob: '', gender: '', contact: '', address: '' }); // Reset form
                fetchPatients(); 
            } else {
                setAddPatientMessage(data.error || 'Failed to add patient.');
                setAddPatientMessageType('error');
            }
        } catch (error) {
            console.error('Add patient error:', error);
            setAddPatientMessage('An error occurred while adding patient.');
            setAddPatientMessageType('error');
        }
    };

    // Open the "Edit Patient" modal and load patient data
    const handleEditPatient = async (patientId) => {
        setEditPatientMessage('');
        setEditPatientMessageType('');
        try {
            const data = await api.getPatientById(patientId, token); // Fetch patient by ID
            if (data.patient) {
                setCurrentEditPatient(data.patient); // Set data for the edit form
                setIsEditModalOpen(true); // Open modal
            } else {
                setPatientListMessage(data.error || 'Failed to load patient for editing.');
                setPatientListMessageType('error');
            }
        } catch (error) {
            console.error('Error fetching patient for edit:', error);
            setPatientListMessage('An error occurred loading patient for edit.');
            setPatientListMessageType('error');
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setCurrentEditPatient(prevState => ({ ...prevState, [name]: value }));
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        setEditPatientMessage('');
        setEditPatientMessageType('');

        if (!currentEditPatient) return; // Ensure a patient is selected for editing

        try {
            const data = await api.updatePatient(currentEditPatient.ID, currentEditPatient, token); // Call API to update patient
            if (data.message) {
                setEditPatientMessage('Patient updated successfully!');
                setEditPatientMessageType('success');
                setIsEditModalOpen(false); 
                fetchPatients(); 
            } else {
                setEditPatientMessage(data.error || 'Failed to update patient.');
                setEditPatientMessageType('error');
            }
        } catch (error) {
            console.error('Update patient error:', error);
            setEditPatientMessage('An error occurred while updating patient.');
            setEditPatientMessageType('error');
        }
    };

    const handleDeleteConfirmation = (id, name) => {
        setPatientToDelete({ id, name }); // Set patient info for confirmation message
        setIsDeleteModalOpen(true); // Open modal
        setDeletePatientMessage('');
        setDeletePatientMessageType('');
    };

    const handleDeletePatient = async () => {
        setDeletePatientMessage('');
        setDeletePatientMessageType('');
        if (!patientToDelete) return; 

        try {
            const data = await api.deletePatient(patientToDelete.id, token); 
            if (data.message) {
                setDeletePatientMessage('Patient deleted successfully!');
                setDeletePatientMessageType('success');
                setIsDeleteModalOpen(false); 
                fetchPatients(); // Refresh list
            } else {
                setDeletePatientMessage(data.error || 'Failed to delete patient.');
                setDeletePatientMessageType('error');
            }
        } catch (error) {
            console.error('Delete patient error:', error);
            setDeletePatientMessage('An error occurred while deleting patient.');
            setDeletePatientMessageType('error');
        } finally {
            setPatientToDelete(null); // Clear patient to delete
        }
    };

    // Display loading message while patients are being fetched
    if (loadingPatients) {
        return <div className="text-center py-8">Loading patients...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 font-inter">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Receptionist Portal</h2>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg text-gray-700">Welcome, <span className="font-semibold">{username}</span> (<span className="font-semibold">{role}</span>)</p>
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                    >
                        Logout
                    </button>
                </div>

                {/* Add New Patient Section */}
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Register New Patient</h3>
                <Notification message={addPatientMessage} type={addPatientMessageType} />
                <form onSubmit={handleAddPatientSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 border border-gray-200 rounded-md">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name:</label>
                        <input type="text" id="firstName" name="first_name" required
                            value={addPatientForm.first_name} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                        <input type="text" id="lastName" name="last_name" required
                            value={addPatientForm.last_name} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth (YYYY-MM-DD):</label>
                        <input type="date" id="dob" name="dob"
                            value={addPatientForm.dob} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender:</label>
                        <select id="gender" name="gender"
                            value={addPatientForm.gender} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact:</label>
                        <input type="text" id="contact" name="contact" required
                            value={addPatientForm.contact} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
                        <input type="text" id="address" name="address"
                            value={addPatientForm.address} onChange={handleAddPatientChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Add Patient
                        </button>
                    </div>
                </form>

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
                    onEdit={handleEditPatient}
                    onDelete={handleDeleteConfirmation}
                    searchTerm={searchTerm}
                />


                {/* Edit Patient Modal */}
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Patient Details">
                    <Notification message={editPatientMessage} type={editPatientMessageType} />
                    <form onSubmit={handleEditFormSubmit} className="space-y-4">
                        <input type="hidden" value={currentEditPatient?.ID || ''} />
                        <div>
                            <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700">First Name:</label>
                            <input type="text" id="editFirstName" name="first_name" required
                                value={currentEditPatient?.FirstName || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                            <input type="text" id="editLastName" name="last_name" required
                                value={currentEditPatient?.LastName || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="editDob" className="block text-sm font-medium text-gray-700">Date of Birth (YYYY-MM-DD):</label>
                            <input type="date" id="editDob" name="dob"
                                value={currentEditPatient?.DOB || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="editGender" className="block text-sm font-medium text-gray-700">Gender:</label>
                            <select id="editGender" name="gender"
                                value={currentEditPatient?.Gender || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="editContact" className="block text-sm font-medium text-gray-700">Contact:</label>
                            <input type="text" id="editContact" name="contact" required
                                value={currentEditPatient?.Contact || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">Address:</label>
                            <input type="text" id="editAddress" name="address"
                                value={currentEditPatient?.Address || ''} onChange={handleEditFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                    <Notification message={deletePatientMessage} type={deletePatientMessageType} />
                    <p className="mb-6 text-gray-600">Are you sure you want to delete patient <span className="font-bold">{patientToDelete?.name}</span>?</p>
                    <div className="flex justify-center space-x-4">
                        <button type="button" onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="button" onClick={handleDeletePatient}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Delete
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default ReceptionistPortal;

