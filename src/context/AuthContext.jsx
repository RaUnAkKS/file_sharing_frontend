import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const res = await api.get('profile/');
                    setUser({ token, ...res.data });
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    // If profile fetch fails (e.g. invalid token), maybe logout?
                    // For now, keep token but user data might be incomplete.
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('token/', { email, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // After token, fetch profile
            try {
                const profileRes = await api.get('profile/');
                setUser({ token: response.data.access, ...profileRes.data });
            } catch (profileError) {
                console.error("Profile fetch failed after login", profileError);
                setUser({ token: response.data.access, email }); // Fallback
            }

            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.response?.data?.detail || "Login failed" };
        }
    };

    const register = async (email, username, password, confirmPassword) => {
        try {
            await api.post('register/', {
                email,
                username,
                password,
                confirm_password: confirmPassword
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data || "Registration failed" };
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
