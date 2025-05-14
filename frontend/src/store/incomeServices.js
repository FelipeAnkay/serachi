import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useIncomeServices = create((set) => ({
    date:null, 
    customerEmail:null, 
    partnerId:null, 
    quoteId:null, 
    productList:null, 
    currency:null, 
    amount:null, 
    tag:null, 
    userEmail:null,
    storeId:null,
    incomeList:null,
    createIncome: async (incomeData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en createIncome son: ", incomeData)
            const response = await axios.post(`${URL_API}/create-income`, incomeData);
            set({ incomeList: response.data.incomeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating staff", isLoading: false });
            throw error;
        }
    },
    
    updateIncome: async (id,updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update-income`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ incomeList: response.data.incomeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating income", isLoading: false });
            throw error;
        }
    },
    getIncomeList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getincomeList");
            const response = await axios.get(`${URL_API}/get-income-store/${storeId }`);
            //console.log("F: Respueste de getincomeList: ", response);
            set({ incomeList: response.data.incomeList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting income", isLoading: false });
            throw error;
        }
    },
    getIncomeById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/get-income-id/${id}`);
            //console.log("F: Respueste de getStaffList: ", response);
            set({ incomeList: response.data.incomeList, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting income", isLoading: false });
            throw error;
        }
    },
    
}))