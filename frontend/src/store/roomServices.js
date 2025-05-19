// roomServices.js
import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/rooms'
    : '/api/rooms';

axios.defaults.withCredentials = true;

export const useRoomServices = create((set) => ({
    /**
     * Obtiene todas las habitaciones del sistema
     */
    getRoomList: async (storeId) => {
        try {
            console.log("Entre a getRoomList", storeId)
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            console.log("getRoomList: ", response)
            return response.data; // { roomList: [...] }
        } catch (error) {
            console.error("Error fetching room list:", error);
            throw error;
        }
    },

    /**
     * Crea una nueva habitación (admin)
     */
    createRoom: async (roomData) => {
        try {
            const response = await axios.post(`${URL_API}/create`, roomData);
            return response.data;
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    },

    updateRoom: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            /*console.log("Payload enviado a updateRoom:", {
                id: id,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ roomList: response.data.room, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating room", isLoading: false });
            throw error;
        }
    },
    getRoomById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ roomList: response.data.room, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting room", isLoading: false });
            throw error;
        }
    },


}));
