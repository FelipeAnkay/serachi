import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/prrecords" : "/api/prrecords";


axios.defaults.withCredentials = true;


export const usePRrecordServices = create((set) => ({
    dateInit: null,
    dateEnd: null,
    recordDetail: null,
    tag: null,
    type: null,
    userEmail: null,
    storeId: null,
    payrateList: null,
    createPRrecord: async (prrecordData) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("Los datos a enviar en createPRrecord son: ", prrecordData)
            const response = await axios.post(`${URL_API}/create`, prrecordData);
            set({ prrecordList: response.data.prrecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating prrecord", isLoading: false });
            throw error;
        }
    },

    updatePRrecord: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            //delete updatedVars.storeId;

            /*console.log("Payload enviado a updateprrecord:", {
                email: email,
                storeId: storeId,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateprrecord: ", response);
            set({ prrecordList: response.data.prrecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating prrecord", isLoading: false });
            throw error;
        }
    },
    getPRrecordList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getprrecordList");
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de getprrecordList: ", response);
            set({ prrecordList: response.data.prrecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting prrecord", isLoading: false });
            throw error;
        }
    },
    getPRrecordById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getprrecordList");
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getprrecordList: ", response);
            set({ prrecordList: response.data.prrecordList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting prrecord", isLoading: false });
            throw error;
        }
    },
    deleteAllPRrecordByUEmail: async (userEmail, storeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${URL_API}/delete-all/${userEmail}/${storeId}`);
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error deleting", isLoading: false });
            throw error;
        }
    },

}))