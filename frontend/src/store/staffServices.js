import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/staff" : "/api/staff";


axios.defaults.withCredentials = true;


export const useStaffServices = create((set) => ({
    staff: null,
    staffId: null,
    staffList: null,
    email: null,
    name: null,
    phone: null,
    country: null,
    birthdate: null,
    nationalId: null,
    professionalCertificates: null,
    storeId: null,
    createStaff: async (staffData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL_API}/create`, staffData);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating staff", isLoading: false });
            throw error;
        }
    },

    updateStaff: async (email, storeId, updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update`, {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating experience", isLoading: false });
            throw error;
        }
    },
    removeStaff: async (email, storeId) => {
        set({ isLoading: true, error: null });
        try {
            /*console.log("Payload enviado a removeStaff:", {
                email: email,
                storeId: storeId,
            });
            */
            const response = await axios.post(`${URL_API}/remove`, {
                email: email,
                storeId: storeId
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating experience", isLoading: false });
            throw error;
        }
    },
    getStaffList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de getStaffList: ", response);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    },
    getStaffEmail: async (email, storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffEmail");
            const response = await axios.get(`${URL_API}/get/${email}/${storeId}`);
            //console.log("F: Respueste de getStaffEmail: ", response);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    },
    getStaffByType: async (storeId, type) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffEmail");
            const response = await axios.get(`${URL_API}/type/${type}/${storeId}`);
            //console.log("F: Respueste de getStaffEmail: ", response);
            set({ staffList: response.data.staffList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    },
    sendScheduleEmail: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/send-schedule`, formData);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error sending schedule", isLoading: false });
            throw error;
        }
    },

}))