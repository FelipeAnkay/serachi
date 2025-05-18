import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useExpenseServices = create((set) => ({
    date:null,
    description:null,
    supplierId:null,
    staffEmail:null,
    currency:null,
    amount:null,
    tag:null,
    userEmail:null,
    paymentMethod:null,
    storeId:null,
    expenseList: null,
    createExpense: async (expenseData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en createexpense son: ", expenseData)
            const response = await axios.post(`${URL_API}/create-expense`, expenseData);
            set({ expenseList: response.data.expenseList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating staff", isLoading: false });
            throw error;
        }
    },

    updateExpense: async (id, updatedVars) => {
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
            const response = await axios.post(`${URL_API}/update-expense`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ expenseList: response.data.expenseList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating expense", isLoading: false });
            throw error;
        }
    },
    getExpenseList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getexpenseList");
            const response = await axios.get(`${URL_API}/get-expense-store/${storeId}`);
            //console.log("F: Respueste de getexpenseList: ", response);
            set({ expenseList: response.data.expenseList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting expense", isLoading: false });
            throw error;
        }
    },
    getExpenseById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getStaffList");
            const response = await axios.get(`${URL_API}/get-expense-id/${id}`);
            //console.log("F: Respueste de getStaffList: ", response);
            set({ expenseList: response.data.expenseList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting expense", isLoading: false });
            throw error;
        }
    },

}))