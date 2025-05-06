import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useCustomerServices = create((set) => ({
    email:null,
    name: null,
    phone:null,
    country:null,
    languages:null,
    birthdate:null,
    nationalId:null,
    birthdate:null,
    diet:null,
    emergencyContact:null,
    professionalCertificates:null,
    storeId:null,
    customerList:null,
    createCustomer: async (customerData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Entre a createCustomer", customerData);
            const response = await axios.post(`${URL_API}/create-customer`, customerData);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating customer", isLoading: false });
            throw error;
        }
    },
    
    updateCustomer: async (email,storeId,updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            delete updatedVars.storeId;
            
            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update-customer`, {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating customer", isLoading: false });
            throw error;
        }
    },
    getCustomerList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a customerList");
            const response = await axios.get(`${URL_API}/get-customer.store/${storeId}`);
            //console.log("F: Respueste de customerList: ", response);
            set({ customerList: response.data.customerList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    },
    getCustomerEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a customerEmail");
            const response = await axios.get(`${URL_API}/get-customer-email/${email}`);
            //console.log("F: Respueste de customerEmail: ", response);
            set({ customerList: response.data.customerList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting customer", isLoading: false });
            throw error;
        }
    }
    
}))