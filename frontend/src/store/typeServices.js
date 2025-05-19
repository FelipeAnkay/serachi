import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/types" : "/api/types";


axios.defaults.withCredentials = true;


export const useTypeServices = create((set) => ({
    name: null, 
    category: null, 
    storeId: null,
    isActive: null, 
    typeList: null,
    createType: async (typeData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Los datos a enviar en createtype son: ", typeData)
            const response = await axios.post(`${URL_API}/create`, typeData);
            set({ typeList: response.data.typeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating type", isLoading: false });
            throw error;
        }
    },

    updatetype: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            //delete updatedVars.storeId;

            /*console.log("Payload enviado a updatetype:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updatetype: ", response);
            set({ typeList: response.data.typeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating type", isLoading: false });
            throw error;
        }
    },
    getTypeList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a gettypeList");
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de gettypeList: ", response);
            set({ typeList: response.data.typeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting type", isLoading: false });
            throw error;
        }
    },
    getTypeByCategory: async (category,storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a gettypeList");
            const response = await axios.get(`${URL_API}/category/${category}/${storeId}`);
            //console.log("F: Respueste de gettypeList: ", response);
            set({ typeList: response.data.typeList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting type", isLoading: false });
            throw error;
        }
    }

}))