// roomServices.js
import { create } from 'zustand';
import axios from 'axios';
import { formatDateISOShort, formatEndOfDayDateISO } from '../components/formatDateDisplay'

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/facilityReservations'
    : '/api/facilityReservations';

axios.defaults.withCredentials = true;

export const useFacilityReservationServices = create((set) => ({

    createFacilityReservation: async (reservationData) => {
        try {
            const response = await axios.post(`${URL_API}/create`, reservationData);
            return response.data;
        } catch (error) {
            console.error("Error creating reservation:", error);
            throw error;
        }
    },

    updateFacilityReservation: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            /*console.log("Payload enviado a updateFacilityReservation:", {
                id: id,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating facilityReservation", isLoading: false });
            throw error;
        }
    },

    getFacilityReservations: async (storeId) => {
        try {
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting reservation:", error);
            throw error;
        }
    },

    getAvailableSpaces: async (dateIn, dateOut, spaceRequired, storeId) => {
        try {
            //console.log("FB: Entre a getAvailableSpaces: ", dateIn, " - ", dateOut, " - ", spaceRequired, " - ", storeId)
            const formatedDateStart = formatDateISOShort(dateIn)
            const formatedDateEnd = formatEndOfDayDateISO(dateOut)
            //console.log("FB: Entre a getAvailableSpaces formated: ", formatedDateStart, " - ", formatedDateEnd, " - ", spaceRequired, " - ", storeId)
            const response = await axios.post(`${URL_API}/available`, {
                dateIn: formatedDateStart,
                dateOut: formatedDateEnd,
                spaceRequired,
                storeId,
            });
            return response.data;
        } catch (error) {
            console.error("Error getting available spaces:", error);
            throw error;
        }
    },

    getFacilityReservationsByDate: async (storeId, dateIn, dateOut) => {
        set({ isLoading: true, error: null });
        try {
            const formattedDateIn = formatDateISOShort(dateIn);
            const formattedDateOut = formatEndOfDayDateISO(dateOut);

            const response = await axios.get(`${URL_API}/dates/${storeId}/${formattedDateIn}/${formattedDateOut}`);

            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting Reservations", isLoading: false });
            throw error;
        }
    },

    getFacilityReservationsByEmail: async (storeId, customerEmail) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/email/${customerEmail}/${storeId}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting reservations", isLoading: false });
            throw error;
        }
    },
    getFacilityReservationsById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/id/${id}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting reservations", isLoading: false });
            throw error;
        }
    },
    getFacilityReservationsByIds: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/get-ids/${ids}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting reservations", isLoading: false });
            throw error;
        }
    },
}));
