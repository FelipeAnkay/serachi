import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


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
            const response = await axios.post(`${URL_API}/create-experience`, experienceData);
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
    getExperienceList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperiences");
            const response = await axios.get(`${URL_API}/get-experience`, { storeId });
            //console.log("F: Respueste de getExperiences: ", response);
            set({ experienceList: response.data.experienceList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getServiceById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get-service-id/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ service: response.data.service, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getProductById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get-product-id/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ product: response.data.product, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting product", isLoading: false });
            throw error;
        }
    },
    getServicesNoStaff: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceNoStaff: ", storeId);
            const response = await axios.get(`${URL_API}/get-service-nostaff/${storeId}`);
            //console.log("F: Respueste de getServiceNoStaff: ", response);
            set({ service: response.data.service, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    updateService: async (serviceId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a updateService - ID: ", serviceId);
            console.log("F: Llamado a updateService - vars: ", updatedVars);
            const response = await axios.post(`${URL_API}//update-service`, {
                id: serviceId,
                ...updatedVars
            });
            console.log("F: Respueste de updateService: ", response);
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error updating service", isLoading: false });
            throw error;
        }
    }
}))