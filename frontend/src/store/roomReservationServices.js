// roomServices.js
import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/reservations'
    : '/api/reservations';

axios.defaults.withCredentials = true;

export const useRoomReservationServices = create((set) => ({

    createRoomReservation: async (reservationData) => {
        try {
            const response = await axios.post(`${URL_API}/create`, reservationData);
            return response.data;
        } catch (error) {
            console.error("Error creating reservation:", error);
            throw error;
        }
    },

    updateRoomReservation: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            /*console.log("Payload enviado a updateroomReservation:", {
                id: id,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ roomReservationList: response.data.roomReservation, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating roomReservation", isLoading: false });
            throw error;
        }
    },

    getReservations: async (storeId) => {
        try {
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting reservation:", error);
            throw error;
        }
    },

    getAvailableRooms: async ({ dateIn, dateOut, bedsRequired, storeId }) => {
        try {
            //console.log("B: Entre a getAvailableRooms", dateIn, " - ", dateOut, " - ", bedsRequired, " - ", storeId)
            const response = await axios.post(`${URL_API}/available`, {
                dateIn,
                dateOut,
                bedsRequired,
                storeId,
            });
            return response.data; // { availableRooms: [...] }
        } catch (error) {
            console.error("Error getting available rooms:", error);
            throw error;
        }
    },

    splitReservationAcrossRooms: async ({ dateIn, dateOut, bedsRequired = 1, storeId }) => {
        try {
            const response = await axios.post(`${URL_API}/split`, {
                dateIn,
                dateOut,
                bedsRequired,
                storeId,
            });
            return response.data; // { segments: [{roomId, dateIn, dateOut, beds}], suggestionText }
        } catch (error) {
            console.error("Error splitting room reservation:", error);
            throw error;
        }
    }


}));
