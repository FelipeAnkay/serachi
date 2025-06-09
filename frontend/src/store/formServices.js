import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/forms" : "/api/forms";


axios.defaults.withCredentials = true;


export const useFormServices = create((set) => ({
    isLoading: false,
    error: null,
    formList: [],
    createForm: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/create`, formData);
            set({ formList: response.data.formList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },

    updateForm: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ formList: response.data.formList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating form", isLoading: false });
            throw error;
        }
    },
    getFormById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
    getFormByStoreId: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/forms/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
    generateToken: async (email,storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/token/${email}/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting token", isLoading: false });
            throw error;
        }
    },
    getDataToken: async (token) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/dataToken/${token}`);
            //console.log("F: Respueste de getStoreById: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting token", isLoading: false });
            throw error;
        }
    },
    sendFormEmail: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/send-forms`, formData);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },
}))