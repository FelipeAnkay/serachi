import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;

export const useStaffServices = create((set) => ({
    staff:null,
    staffId: null,
    staffList:null,
    email:null,
    name:null,
    phone:null,
    country:null,
    birthdate:null,
    nationalId:null,
    professionalCertificates:null,
    storeId:null,
    createStaff: async (serviceId, bookId, storeId, userId, dateIn, dateOut, workFrame, assignedStaff) => {
        set({ isLoading: true, error: null });
        try {

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
    updateStaff: async (experienceId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a updateExperience - ID: ", experienceId);
            console.log("F: Llamado a updateExperience - vars: ", updatedVars);
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
    },
    getStaffList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/get-staff/${storeId }`);
            console.log("F: Respueste de getStaffList: ", response);
            set({ staffList: response.data.staffList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    }
    
}))