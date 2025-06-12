import React from 'react';
import { AuthProvider } from './AuthContext'; 
import useAuth from './hooks/useAuth'; 
import LoginPage from './pages/LoginPage'; 
import ReceptionistPortal from './pages/ReceptionistPortal'; 
import DoctorPortal from './pages/DoctorPortal'; 

// ProtectedRoute component to control access based on authentication and roles
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, role, loading } = useAuth(); 

    if (loading) {
        return <div className="text-center py-8">Loading application...</div>;
    }

    if (!token) {
        window.location.pathname = '/';
        return null;
    }

    if (!allowedRoles.includes(role)) {
        if (role === 'receptionist') {
            window.location.pathname = '/receptionist';
        } else if (role === 'doctor') {
            window.location.pathname = '/doctor';
        } else {
            window.location.pathname = '/';
        }
        return null;
    }

    return children; 
};

// Main App Component
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

// Separate component to consume auth state and handle routing
function AppContent() {
    const { token, role, loading } = useAuth(); // Get auth state from context

    if (loading) {
        return <div className="text-center py-8">Loading application...</div>;
    }

    const path = window.location.pathname;

    if (!token) {
        return <LoginPage />; // If not authenticated, always show the login page
    } else {
        switch (path) {
            case '/':
                if (role === 'receptionist') {
                    window.location.pathname = '/receptionist';
                } else if (role === 'doctor') {
                    window.location.pathname = '/doctor';
                } else {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('role');
                    window.location.pathname = '/';
                }
                return null; // Don't render while redirecting
            case '/receptionist':
                return (
                    <ProtectedRoute allowedRoles={['receptionist']}>
                        <ReceptionistPortal />
                    </ProtectedRoute>
                );
            case '/doctor':
                return (
                    <ProtectedRoute allowedRoles={['doctor']}>
                        <DoctorPortal />
                    </ProtectedRoute>
                );
            default:
                // If user navigates to an invalid path while logged in, redirect to their default portal
                if (role === 'receptionist') {
                    window.location.pathname = '/receptionist';
                } else if (role === 'doctor') {
                    window.location.pathname = '/doctor';
                } else {
                    window.location.pathname = '/'; 
                }
                return null; // Don't render while redirecting
        }
    }
}

