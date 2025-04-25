import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;

export const useExperienceServices = create((set) => ({
    service:null,
    serviceId: null,
    bookId: null,
    storeId: null,
    userId: null,
    dateIn: null,
    dateOut: null,
    workFrame: null,
    assignedStaff: null,
    isLoading:false,
    experienceList:null,
    createExperience: async (serviceId, bookId, storeId, userId, dateIn, dateOut, workFrame, assignedStaff) => {
        set({ isLoading: true, error: null });
        try {
            if (!Array.isArray(workFrame) || !workFrame.every(item =>
                typeof item.productId === 'string' &&
                typeof item.date === 'string' &&
                typeof item.timeFrame === 'string')) {
                throw new Error("Invalid workFrame format");
            }
            const payload = {
                serviceId,
                bookId,
                storeId,
                userId,
                dateIn,
                dateOut,
                workFrame,        
                assignedStaff
            };
            const response = await axios.post(`${URL_API}/create-experience`, payload);
            console.log();
            set({ service: response.data.service, isLoading:false});
        } catch (error) {
            set({ error: error.response.data.message || "Error Creating a Experience", isLoading: false });
            throw error;
        }
    },
    experienceList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a getExperiences");
            const response = await axios.get(`${URL_API}/get-experience`, { storeId });
            console.log("F: Respueste de getExperiences: ", response);
            set({ experienceList: response.data.experienceList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    updateExperience: async (experienceId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a updateExperience");
            const response = await axios.post(`${URL_API}/update-experience`, {
                id: experienceId,
                ...updatedVars
            });
            console.log("F: Respueste de updateExperiences: ", response);
            set({ experienceList: response.data.experienceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error updating experience", isLoading: false });
            throw error;
        }
    }
}))