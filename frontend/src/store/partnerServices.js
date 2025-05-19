import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/partners" : "/api/partners";


axios.defaults.withCredentials = true;


export const usePartnerServices = create((set) => ({
    email:null,
    name: null,
    phone:null,
    country:null,
    languages:null,
    birthdate:null,
    nationalId:null,
    storeId:null,
    partnerList:null,
    createPartner: async (partnerData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Entre a createCustomer", customerData);
            const response = await axios.post(`${URL_API}/create`, partnerData);
            set({ partnerList: response.data.partnerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating partner", isLoading: false });
            throw error;
        }
    },
    
    updatePartner: async (email,storeId,updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            
            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ partnerList: response.data.partnerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating partner", isLoading: false });
            throw error;
        }
    },
    getPartnerList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a customerList");
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de customerList: ", response);
            set({ partnerList: response.data.partnerList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting partner", isLoading: false });
            throw error;
        }
    },
    getPartnerEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a customerEmail", email);
            const response = await axios.get(`${URL_API}/get/${email}`);
            console.log("F: Respueste de customerEmail: ", response);
            set({ partnerList: response.data.partnerList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting partner", isLoading: false });
            throw error;
        }
    },
    removePartner: async (email) => {
        set({ isLoading: true, error: null });
        console.log("Entre a removePartner: ", email)
        try {
            const response = await axios.post(`${URL_API}/remove`, {
                email: email,
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ partnerList: response.data.partnerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating partner", isLoading: false });
            throw error;
        }
    }
    
}))