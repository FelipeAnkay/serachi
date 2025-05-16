import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useStoreServices = create((set) => ({
    name:null,
    mainEmail: null,
    storeId:null,
    address:null,
    phone:null,
    userList:null,
    timezone:null,
    isActive:null,
    timezone:null,
    storeList:null,
    createStore: async (storeData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createstore son: ", storeData)
            const response = await axios.post(`${URL_API}/create-store`, storeData);
            set({ storeList: response.data.storeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },
    
    updatStore: async (id,updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update-store`, {
                id: id,
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
            const response = await axios.get(`${URL_API}/get-store-id/${id}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ storeList: response.data.storeList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting quotes", isLoading: false });
            throw error;
        }
    },
}))