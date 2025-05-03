import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";


axios.defaults.withCredentials = true;


export const useProductServices = create((set) => ({
    name:null,
    price: null,
    type:null,
    currency:null,
    durationDays:null,
    storeId:null,
    userId:null,
    isActive:null,
    supplierId:null,
    productList:null,
    product:null,
    error:null,
    createProduct: async (productData,storeId,userId) => {
        set({ isLoading: true, error: null });
        try {
            const payload = {
                ...productData,
                storeId: storeId,
                currency: "USD",
                isActive: true,
                userId: userId
            }
            console.log("F: El producto que voy a crear es: ", payload);
            const response = await axios.post(`${URL_API}/create-product`, payload);
            set({ productList: response.data.product, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating product", isLoading: false });
            throw error;
        }
    },
    
    updateProduct: async (id,updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            /*console.log("Payload enviado a updateProduct:", {
                id: id,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update-product`, {
                id: id,
                ...updatedVars
            });
            //console.log("F: Respueste de updateStaff: ", response);
            set({ productList: response.data.product, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error updating product", isLoading: false });
            throw error;
        }
    },
    removeProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {         
            console.log("Payload enviado a removeProduct:", {
                id: id,
            });
            
            const response = await axios.post(`${URL_API}/remove-product`, {
                id: id
            });
            console.log("F: Respueste de removeProduct: ", response);
            set({ productList: response.data.productList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error || "Error removing product", isLoading: false });
            throw error;
        }
    },
    getProductById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get-product-id/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ productList: response.data.product, isLoading:false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting product", isLoading: false });
            throw error;
        }
    },
    getProductByStoreId: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getProductByStoreId: ", storeId);
            const response = await axios.get(`${URL_API}/get-product-store/${storeId}`);
            //console.log("F: Respueste de getProductByStoreId: ", response);
            set({ productList: response.data.productList, isLoading:false });
            return response.data;
        } catch (error) {
            //console.log("F: El error en getProductByStoreId: ", error);
            set({ error: error.response.data.message || "Error getting product", isLoading: false });
            throw error;
        }
    },
    
}))