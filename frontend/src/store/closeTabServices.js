import { create } from 'zustand';
import axios from 'axios';
import moment from 'moment';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/closetabs" : "/api/closetabs";


axios.defaults.withCredentials = true;

export const useCloseTabServices = create((set) => ({
    closetab: null,
    closetabList: [],
    isLoading: false,
    error: null,
    createCloseTab: async (closeTabData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Payload de createCloseTab", closeTabData);
            const response = await axios.post(`${URL_API}/create`, closeTabData);
            console.log("Respuesta de createService:", response);
            set({ closetab: response.data.closetab, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error Creating a service", isLoading: false });
            throw error;
        }
    },
    updateCloseTab: async (closetabId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            const response = await axios.post(`${URL_API}/update`, {
                id: closetabId,
                ...updatedVars
            });
            console.log("F: Respueste de updateclosetab: ", response);
            set({ closeTabList: response.data.closetabList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error updating closetab", isLoading: false });
            throw error;
        }
    },
    getCloseTabList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperiences");
            const response = await axios.get(`${URL_API}/store/${storeId}`);
            //console.log("F: Respueste de getExperiences: ", response);
            set({ closetabList: response.data.closetabList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting closetab", isLoading: false });
            throw error;
        }
    },
    getCloseTabById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ closetab: response.data.closetab, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },

    getCloseTabByDate: async (storeId, date) => {
        set({ isLoading: true, error: null });

        // Normaliza las fechas al formato 'YYYY-MM-DD HH:mm'
        const formatDate = (date) => moment(date).format('YYYY-MM-DD HH:mm');

        try {
            const formattedDate = formatDate(date);

            const response = await axios.get(`${URL_API}/dates/${storeId}/${formattedDate}`);

            set({ closetab: response.data.closetab, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting closetab", isLoading: false });
            throw error;
        }
    },
    getCloseTabByEmail: async (storeId, customerEmail) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${URL_API}/email/${customerEmail}/${storeId}`);
            set({ closetab: response.data.closetab, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting closetab", isLoading: false });
            throw error;
        }
    },
    removeCloseTabById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${URL_API}/remove`, {
                data: { id }  // Aquí está el arreglo: se debe usar `data` dentro del config
            });
            console.log("F: Respuesta de removeclosetabById: ", response);
            set({ closetabist: response.data.closetabList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting closetab", isLoading: false });
            throw error;
        }
    }
}))