import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (user, pass) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('role', data.user.role);
                setToken(data.token);
                setUsername(data.user.username);
                setRole(data.user.role);
                return { success: true, message: 'Login successful!' };
            } else {
                return { success: false, message: data.error || 'Login failed.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    };

    // Logout function: clears local storage and state, redirects to login
    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setToken(null);
        setUsername(null);
        setRole(null);
        window.location.pathname = '/'; // Redirect to login page
    };

    // Value provided by the context to its consumers
    const value = {
        token,
        username,
        role,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

