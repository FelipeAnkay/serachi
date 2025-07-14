// roomServices.js
import { create } from 'zustand';
import axios from 'axios';
import { formatDateISOShort } from '../components/formatDateDisplay'

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
            set({ roomReservationList: response.data.service, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating roomReservation", isLoading: false });
            throw error;
        }
    },

    cancelRoomReservation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${URL_API}/cancel/${id}`);
            //console.log("F: Respueste de updateStaff: ", response);
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
            //console.log("FB: Entre a getAvailableRooms: ", dateIn, " - ", dateOut, " - ", bedsRequired, " - ", storeId)
            const formatedDateStart = formatDateISOShort(dateIn)
            const formatedDateEnd = formatDateISOShort(dateOut)
            //console.log("FB: Entre a getAvailableRooms formated: ", formatedDateStart, " - ", formatedDateEnd, " - ", bedsRequired, " - ", storeId)
            const response = await axios.post(`${URL_API}/available`, {
                dateIn: formatedDateStart,
                dateOut: formatedDateEnd,
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
    },
    getReservationsByDate: async (storeId, dateIn, dateOut) => {
        set({ isLoading: true, error: null });
        try {
            const formattedDateIn = formatDateISOShort(dateIn);
            const formattedDateOut = formatDateISOShort(dateOut);

            const response = await axios.get(`${URL_API}/dates/${storeId}/${formattedDateIn}/${formattedDateOut}`);

            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting Reservations", isLoading: false });
            throw error;
        }
    },

    getReservationsByEmail: async (storeId, customerEmail) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/email/${customerEmail}/${storeId}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getReservationsById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/id/${id}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getReservationsByIds: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/get-ids/${ids}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    deleteAllRoomReservationByUEmail: async (userEmail, storeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${URL_API}/delete-all/${userEmail}/${storeId}`);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error deleting", isLoading: false });
            throw error;
        }
    },
}));
