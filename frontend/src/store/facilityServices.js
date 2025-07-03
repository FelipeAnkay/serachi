// facilityServices.js
import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/facilities'
    : '/api/facilities';

axios.defaults.withCredentials = true;

export const useFacilityServices = create((set) => ({
    /**
     * Obtiene todas las habitaciones del sistema
     */
    getFacilityList: async (storeId) => {
        try {
            //console.log("Entre a getFacilityList", storeId)
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("getRoomList: ", response)
            return response.data; // { roomList: [...] }
        } catch (error) {
            console.error("Error fetching facility list:", error);
            throw error;
        }
    },

    /**
     * Crea una nueva facility (admin)
     */
    createFacility: async (facilityData) => {
        try {
            const response = await axios.post(`${URL_API}/create`, facilityData);
            return response.data;
        } catch (error) {
            //console.error("Error creating room:", error);
            throw error;
        }
    },

    updateFacility: async (auxId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;

            //console.log("Entre a updateFacility: ", {auxId, updatedVars})

            const response = await axios.post(`${URL_API}/update`, {
                id: auxId,
                ...updatedVars
            });

            //console.log("F: Respueste de updateStaff: ", response);
            return response.data;
            //return;
        } catch (error) {
            throw error;
        }
    },
    getFacilityById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting facility", isLoading: false });
            throw error;
        }
    },
    getFacilityByStore: async (id) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a getFacilityByStore: ", id);
            const response = await axios.get(`${URL_API}/list/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting facility", isLoading: false });
            throw error;
        }
    },


}));
