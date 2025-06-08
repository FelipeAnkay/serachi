import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/formrecords" : "/api/formrecords";

axios.defaults.withCredentials = true;


export const useFormRecordServices = create((set) => ({
    isLoading: false,
    error: null,
    formRecordList: [],
    createFormRecord: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/create`, formData);
            set({ formRecordList: response.data.formRecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },

    updateFormRecord: async (id, updatedVars) => {
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
            set({ formRecordList: response.data.formRecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating form", isLoading: false });
            throw error;
        }
    },
    getFormRecordById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ formRecordList: response.data.formRecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
    getFormRecordByStoreId: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/fr/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ formRecordList: response.data.formRecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
    getFormRecordByEmail: async (email,storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/fr/${email}/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ formRecordList: response.data.formRecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
}))