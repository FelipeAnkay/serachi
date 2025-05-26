import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/experiences" : "/api/experiences";


axios.defaults.withCredentials = true;

export const useExperienceServices = create((set) => ({
    name:null,
    serviceList:null,
    productList:null,
    bookList:null,
    storeId:null,
    userEmail:null,
    customerEmail:null,
    dateIn:null,
    dateOut:null,
    quoteId:null,
    source:null,
    service:null,
    createExperience: async (experienceData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Payload de createExperience: ", experienceData);
            const response = await axios.post(`${URL_API}/create`, experienceData);
            console.log("La respuesta de createExperience ", response);
            set({ service: response.data.service, isLoading:false});
        } catch (error) {
            set({ error: error.response.data.message || "Error Creating a Experience", isLoading: false });
            throw error;
        }
    },
    updateExperience: async (experienceId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            console.log("F: Llamado a updateExperience - ID: ", experienceId);
            console.log("F: Llamado a updateExperience - vars: ", updatedVars);
            const response = await axios.post(`${URL_API}/update`, {
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
    getExperienceList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperiences");
            const response = await axios.get(`${URL_API}/list`, { storeId });
            //console.log("F: Respueste de getExperiences: ", response);
            set({ experienceList: response.data.experienceList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getExperienceByEmail: async (userEmail,storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperienceByEmail:",userEmail,"-",storeId );
            const response = await axios.get(`${URL_API}/email/${userEmail}/${storeId}`);
            //console.log("F: Respueste de getExperienceByEmail: ", response);
            set({ experienceList: response.data.experienceList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
}))