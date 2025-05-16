import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useSupplierServices = create((set) => ({
    name:null,
    email:null,
    phone:null,
    country:null,
    nationalId:null,
    supplierList:null,
    createSupplier: async (supplierData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Entre a createCustomer", customerData);
            const response = await axios.post(`${URL_API}/create-supplier`, supplierData);
            set({ supplierList: response.data.supplierList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating supplier", isLoading: false });
            throw error;
        }
    },
    
    updateSupplier: async (email,storeId,updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update-supplier`, {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ supplierList: response.data.supplierList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating supplier", isLoading: false });
            throw error;
        }
    },
    getSupplierList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a supplierList");
            const response = await axios.get(`${URL_API}/get-supplier-store/${storeId}`);
            console.log("F: Respueste de supplierList: ", response);
            set({ supplierList: response.data.supplierList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting supplier", isLoading: false });
            throw error;
        }
    },
    getSupplierEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a supplierEmail");
            const response = await axios.get(`${URL_API}/get-supplier-email/${email}`);
            //console.log("F: Respueste de customerEmail: ", response);
            set({ supplierList: response.data.supplierList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting supplier", isLoading: false });
            throw error;
        }
    },
    removeSupplier: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${URL_API}/remove-supplier`, {
                email: email,
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ supplierList: response.data.supplierList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating supplier", isLoading: false });
            throw error;
        }
    }
    
}))