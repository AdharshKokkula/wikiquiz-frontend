import React, { createContext, useState, useContext, useEffect } from 'react';
import { PublicAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Here we could validate token or fetch user profile if endpoint existed
            // For now, minimal user state or just assuming logged in
            setUser({ token });
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const res = await PublicAPI.post('/auth/login', formData);
            const access_token = res.data.access_token;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser({ token: access_token });
            return true;
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        }
    };

    const register = async (email, password) => {
        try {
            await PublicAPI.post('/auth/register', { email, password });
            return true; // Register success
        } catch (err) {
            console.error("Register failed", err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
