import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/favoriteDescriptions" : "/api/favoriteDescriptions";


axios.defaults.withCredentials = true;


export const useFavoriteDescriptionServices = create((set) => ({
    favoriteDescriptionList: null,
    error:null,
    isLoading:false,
    createFavoriteDescription: async (FDData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en favoriteDescription son: ", FDData)
            const response = await axios.post(`${URL_API}/create`, FDData);
            set({ favoriteDescriptionList: response.data.favoriteDescription, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating favoriteDescription", isLoading: false });
            throw error;
        }
    },
    updateFavoriteDescription: async (id, updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ favoriteDescriptionList: response.data.favoriteDescription, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating favoriteDescription", isLoading: false });
            throw error;
        }
    },
    getFavoriteDescriptionList: async (storeId, type) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getpayrateList");
            const response = await axios.get(`${URL_API}/list/${storeId}/${type}`);
            //console.log("F: Respueste de getpayrateList: ", response);
            set({ favoriteDescriptionList: response.data.favoriteDescriptionList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting favoriteDescriptionList", isLoading: false });
            throw error;
        }
    },
    removeFavoriteDescription: async (id) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a remove favoriteDescription");
            const response = await axios.post(`${URL_API}/remove`, {
                id: id,
            });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting FavoriteDescription", isLoading: false });
            throw error;
        }
    }

}))