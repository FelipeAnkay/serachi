// roomServices.js
import { create } from 'zustand';
import axios from 'axios';
import { formatDateISOShort, formatEndOfDayDateISO } from '../components/formatDateDisplay'

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/daysOff'
    : '/api/daysOff';

axios.defaults.withCredentials = true;

export const useStaffDaysOffServices = create((set) => ({

    createStaffDaysOff: async (daysOffData) => {
        try {
            const response = await axios.post(`${URL_API}/create`, daysOffData);
            return response.data;
        } catch (error) {
            console.error("Error creating days off:", error);
            throw error;
        }
    },

    updateDaysOff: async (id, updatedVars) => {
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

    getAllDaysOff: async (storeId) => {
        try {
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting reservation:", error);
            throw error;
        }
    },

    removeDaysOff: async (id) => {
        try {
            const response = await axios.delete(`${URL_API}/delete/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting day off:", error);
            throw error;
        }
    },

    getStaffAvailability: async (dateIn, dateOut, storeId) => {
        try {
            //console.log("FB: Entre a getAvailableSpaces: ", dateIn, " - ", dateOut, " - ", spaceRequired, " - ", storeId)
            const formatedDateStart = formatDateISOShort(dateIn)
            const formatedDateEnd = formatEndOfDayDateISO(dateOut)
            //console.log("FB: Entre a getAvailableSpaces formated: ", formatedDateStart, " - ", formatedDateEnd, " - ", spaceRequired, " - ", storeId)
            const response = await axios.post(`${URL_API}/available`, {
                dateIn: formatedDateStart,
                dateOut: formatedDateEnd,
                storeId,
            });
            return response.data;
        } catch (error) {
            console.error("Error getting staff availability:", error);
            throw error;
        }
    },

    getDaysOffByDate: async (storeId, dateIn, dateOut) => {
        set({ isLoading: true, error: null });
        try {
            const formattedDateIn = formatDateISOShort(dateIn);
            const formattedDateOut = formatEndOfDayDateISO(dateOut);

            const response = await axios.get(`${URL_API}/dates/${storeId}/${formattedDateIn}/${formattedDateOut}`);

            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting days off", isLoading: false });
            throw error;
        }
    },

    getDaysOffByEmail: async (storeId, staffEmail) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getDaysOffByEmail");
            const response = await axios.get(`${URL_API}/email/${staffEmail}/${storeId}`);
            //console.log("F: Respueste de getDaysOffByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting days off", isLoading: false });
            throw error;
        }
    },
    getDayOffById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail");
            const response = await axios.get(`${URL_API}/id/${id}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting day off", isLoading: false });
            throw error;
        }
    },
    getDaysOffByIds: async (ids) => {
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
