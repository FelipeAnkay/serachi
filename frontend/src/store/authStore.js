import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    userList: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    roleList: null,
    storeId: null,
    signup: async (email, password, name, phone) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL_API}/signup`, { email, password, name, phone });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response.data.message || "Error Signing up", isLoading: false });
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL_API}/verify-email`, { code });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error Verifiying Code frnt", isLoading: false });
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${URL_API}/check-auth`);
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            //console.log("Estoy en checkAuth", response);
            return response.data;
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false });
            throw error;
        }
    },
    login: async (storeId, email, password) => {
        set({ isLoading: true, error: null });
        try {
            //console.log(storeId, email, password);
            const response = await axios.post(`${URL_API}/login`, { storeId, email, password });
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
            //console.log(response.data.user);
        } catch (error) {
            set({ error: error.response.data.message || "Error Signing up", isLoading: false });
            throw error;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${URL_API}/logout/`);
            set({ user: null, isAuthenticated: false, error: null, isLoading: false, userList: null, storeId: null });
        } catch (error) {
            set({ error: error.response.data.message || "Error Logging out", isLoading: false });
            throw error;
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post(`${URL_API}/forgot-password/`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({ error: error.response.data.message || "Error in password recovery", isLoading: false });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post(`${URL_API}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                error: error.response.data.message || "Error reseting password",
                isLoading: false
            });
            throw error;
        }
    },

    getUsersByEmail: async (emails, storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Llamando a getUsersByEmail", emails);
            const response = await axios.get(`${URL_API}/get-emails/${emails}/${storeId}`)
            set({ userList: response.data.userList, isAuthenticated: true, isCheckingAuth: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error get-emails", isLoading: false });
            throw error;
        }
    },
    getUserEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Llamando a getUserByEmail", email);
            const response = await axios.get(`${URL_API}/get/${email}`)
            //console.log("Respuesta de getUserByEmail", response);
            set({ userList: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error get-emails", isLoading: false });
            throw error;
        }
    },
    updateUser: async (email, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.createdAt;
            delete updatedVars.updatedAt;
            delete updatedVars.__v;

            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update-user`, {
                email: email,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ userList: response.data.user, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating experience", isLoading: false });
            throw error;
        }
    },

}))