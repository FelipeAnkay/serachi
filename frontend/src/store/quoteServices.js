import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useQuoteServices = create((set) => ({
    dateIn:null,
    dateOut: null,
    customerEmail:null,
    storeId:null,
    roomId:null,
    partnerId:null,
    productList:null,
    discount:null,
    finalPrice:null,
    currency:null,
    isConfirmed:null,
    isReturningCustomer:null,
    tag:null,
    userEmail:null,
    quoteList:null,
    createQuote: async (quoteData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en createQuote son: ", quoteData)
            const response = await axios.post(`${URL_API}/create-quote`, quoteData);
            set({ quoteList: response.data.quoteList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating staff", isLoading: false });
            throw error;
        }
    },
    
    updateQuote: async (id,updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            //delete updatedVars.storeId;
            
            /*console.log("Payload enviado a updateStaff:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update-quote`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ quoteList: response.data.quoteList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating experience", isLoading: false });
            throw error;
        }
    },
    getQuoteList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/get-quote-store/${storeId }`);
            //console.log("F: Respueste de getStaffList: ", response);
            set({ quoteList: response.data.quoteList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting quotes", isLoading: false });
            throw error;
        }
    },
    getQuoteById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/get-quote-id/${id}`);
            //console.log("F: Respueste de getStaffList: ", response);
            set({ quoteList: response.data.quoteList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting quotes", isLoading: false });
            throw error;
        }
    },
    
}))