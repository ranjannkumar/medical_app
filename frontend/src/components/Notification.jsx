import React from 'react';

// Notification component for displaying messages (success/error)
const Notification = ({ message, type }) => {
    // If no message, render nothing
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';

    return (
        <div className={`p-3 rounded-md border ${bgColor} ${borderColor} mb-4`}>
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

export default Notification;

