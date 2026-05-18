import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validate any existing token on mount by hitting /auth/me/
    useEffect(() => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        authService.me()
            .then((res) => setUser(res.data))
            .catch(() => clearToken())
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await authService.login(username, password);
        const { token, ...userData } = res.data;
        setToken(token);
        setUser(userData);
        return userData;
    }, []);

    const logout = useCallback(async () => {
        try { await authService.logout(); } catch (_) { /* ignore */ }
        clearToken();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
