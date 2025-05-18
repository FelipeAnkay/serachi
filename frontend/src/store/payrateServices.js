import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const usePayRateServices = create((set) => ({
    staffEmail: null,
    productId: null,
    staffFee: null,
    currency: null,
    userEmail: null,
    startDate: null,
    finishDate: null,
    priority: null,
    storeId: null,
    payrateList: null,
    createPayrate: async (payrateData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en createpayrate son: ", payrateData)
            const response = await axios.post(`${URL_API}/create-payrate`, payrateData);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating payrate", isLoading: false });
            throw error;
        }
    },

    updatePayrate: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            //delete updatedVars.storeId;

            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update-payrate`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating payrate", isLoading: false });
            throw error;
        }
    },
    getPayrateList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getpayrateList");
            const response = await axios.get(`${URL_API}/get-payrate-store/${storeId}`);
            //console.log("F: Respueste de getpayrateList: ", response);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting payrate", isLoading: false });
            throw error;
        }
    },
    getPayrateById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getpayrateList");
            const response = await axios.get(`${URL_API}/get-payrate-id/${id}`);
            //console.log("F: Respueste de getpayrateList: ", response);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting payrate", isLoading: false });
            throw error;
        }
    },
    getPayrateByEmail: async (storeId, email) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getpayrateList");
            const response = await axios.get(`${URL_API}/get-payrate-email/${email}/${storeId}`);
            //console.log("F: Respueste de getpayrateList: ", response);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting payrate", isLoading: false });
            throw error;
        }
    },
    removePayrate: async (id) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a removePayrate");
            const response = await axios.post(`${URL_API}/remove-payrate`, {
                id: id,
            });
            //console.log("F: Respueste de removePayrate: ", response);
            set({ payrateList: response.data.payrateList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting payrate", isLoading: false });
            throw error;
        }
    }

}))