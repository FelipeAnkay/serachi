import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/roles" : "/api/stores";


axios.defaults.withCredentials = true;


export const useRoleServices = create((set) => ({
    isLoading: false,
    error: null,
    roleList: [],
    createRole: async (roleData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/create`, roleData);
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating store", isLoading: false });
            throw error;
        }
    },

    updateRole: async (id, updatedVars) => {
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
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating role", isLoading: false });
            throw error;
        }
    },
    getRoleById: async (id) => {
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
    getRolesByStoreId: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.get(`${URL_API}/roles/${storeId}`);
            //console.log("F: Respueste de getStoreById: ", response);
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
    removeRole: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStoreById");
            const response = await axios.post(`${URL_API}/remove`,{id:id});
            //console.log("F: Respueste de getStoreById: ", response);
            set({ roleList: response.data.roleList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting roles", isLoading: false });
            throw error;
        }
    },
}))