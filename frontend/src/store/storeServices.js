import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/stores" : "/api/stores";


axios.defaults.withCredentials = true;


export const useStoreServices = create((set) => ({
    name: null,
    mainEmail: null,
    storeId: null,
    address: null,
    phone: null,
    userList: null,
    timezone: null,
    isActive: null,
    timezone: null,
    storeList: null,
    userList: null,
    store:null,
    error:null,
    createStore: async (storeData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createstore son: ", storeData)
            const response = await axios.post(`${URL_API}/create`, storeData);
            set({ storeList: response.data.storeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },

    updateStore: async (storeId, updatedVars) => {
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
           //console.log("updateStore: ", updatedVars);
            const response = await axios.post(`${URL_API}/update`, {
                storeId: storeId,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ storeList: response.data.storeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating store", isLoading: false });
            throw error;
        }
    },
    getStoreById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ store: response.data.store, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting quotes", isLoading: false });
            throw error;
        }
    },
    getUsers: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById: ", storeId);
            const response = await axios.get(`${URL_API}/users/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ userList: response.data.userList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting quotes", isLoading: false });
            throw error;
        }
    }
}))