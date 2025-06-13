import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/customers" : "/api/customers";


axios.defaults.withCredentials = true;


export const useCustomerServices = create((set) => ({
    email: null,
    name: null,
    phone: null,
    country: null,
    languages: null,
    birthdate: null,
    nationalId: null,
    birthdate: null,
    diet: null,
    emergencyContact: null,
    professionalCertificates: null,
    storeId: null,
    customerList: null,
    createCustomer: async (customerData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Entre a createCustomer", customerData);
            const response = await axios.post(`${URL_API}/create`, customerData);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating customer", isLoading: false });
            throw error;
        }
    },

    updateCustomer: async (email, storeId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;

            console.log("Payload enviado a updateCustomer:", {
                email: email,
                ...updatedVars
            });

            const response = await axios.post(`${URL_API}/update`, {
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
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de customerList: ", response);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting staff", isLoading: false });
            throw error;
        }
    },
    getCustomerEmail: async (email, storeId) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a customerEmail");
            const response = await axios.get(`${URL_API}/get/${email}/${storeId}`);
            //console.log("F: Respueste de customerEmail: ", response);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting customer", isLoading: false });
            throw error;
        }
    },
    removeCustomer: async (email) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a customerEmail");
            const response = await axios.get(`${URL_API}/remove/${email}`);
            //console.log("F: Respueste de customerEmail: ", response);
            set({ customerList: response.data.customerList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting customer", isLoading: false });
            throw error;
        }
    },
    sendProfileEmail: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createrole son: ", roleData)
            const response = await axios.post(`${URL_API}/send-profile`, formData);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error sending profile", isLoading: false });
            throw error;
        }
    },

}))