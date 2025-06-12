import React from 'react';

// PatientTable component to display a list of patients
const PatientTable = ({ patients, role, onEdit, onDelete, onViewEditNotes, searchTerm }) => {
    const filteredPatients = patients.filter(patient =>
        (patient.FirstName && patient.FirstName.toLowerCase().includes(searchTerm)) ||
        (patient.LastName && patient.LastName.toLowerCase().includes(searchTerm)) ||
        (patient.Contact && patient.Contact.toLowerCase().includes(searchTerm)) ||
        (patient.DOB && patient.DOB.toLowerCase().includes(searchTerm)) ||
        (patient.Gender && patient.Gender.toLowerCase().includes(searchTerm)) ||
        (patient.Status && patient.Status.toLowerCase().includes(searchTerm)) ||
        (patient.DoctorNotes && patient.DoctorNotes.toLowerCase().includes(searchTerm))
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {role === 'doctor' && ( // Show Doctor Notes column only for doctors
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Notes</th>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.length === 0 ? (
                        <tr>
                            {/* Display message if no patients found */}
                            <td colSpan={role === 'doctor' ? 8 : 7} className="px-6 py-4 text-center text-gray-500">No patients found.</td>
                        </tr>
                    ) : (
                        filteredPatients.map(patient => (
                            <tr key={patient.ID} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.ID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{patient.FirstName} {patient.LastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{patient.Contact}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{patient.DOB || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{patient.Gender || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{patient.Status || 'active'}</td>
                                {role === 'doctor' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 truncate max-w-xs">{patient.DoctorNotes || 'N/A'}</td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {role === 'receptionist' && (
                                        <>
                                            <button
                                                onClick={() => onEdit(patient.ID)} // Callback for editing
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(patient.ID, `${patient.FirstName} ${patient.LastName}`)} // Callback for deleting
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {role === 'doctor' && (
                                        <button
                                            onClick={() => onViewEditNotes(patient.ID, `${patient.FirstName} ${patient.LastName}`, patient.DoctorNotes, patient.Status)} // Callback for viewing/editing notes
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                        >
                                            View/Edit Notes
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PatientTable;

