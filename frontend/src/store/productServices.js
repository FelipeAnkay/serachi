import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/products" : "/api/products";


axios.defaults.withCredentials = true;


export const useProductServices = create((set) => ({
    name: null,
    price: null,
    type: null,
    currency: null,
    durationDays: null,
    storeId: null,
    userId: null,
    isActive: null,
    supplierId: null,
    productList: null,
    product: null,
    error: null,
    createProduct: async (productData, storeId, userId) => {
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
            const response = await axios.post(`${URL_API}/create`, payload);
            set({ productList: response.data.product, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error creating product", isLoading: false });
            throw error;
        }
    },

    updateProduct: async (id, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            /*console.log("Payload enviado a updateProduct:", {
                id: id,
                ...updatedVars
            });
            */
            const response = await axios.post(`${URL_API}/update`, {
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

            const response = await axios.post(`${URL_API}/remove`, {
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
            //console.log("F: Llamado a getProductById: ", id);
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getProductById: ", response);
            set({ productList: response.data.product, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting product", isLoading: false });
            throw error;
        }
    },
    getProductByIds: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get-ids/${ids}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ productList: response.data.product, isLoading: false });
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
            const response = await axios.get(`${URL_API}/list/${storeId}`);
            //console.log("F: Respueste de getProductByStoreId: ", response);
            set({ productList: response.data.productList, isLoading: false });
            return response.data;
        } catch (error) {
            //console.log("F: El error en getProductByStoreId: ", error);
            set({ error: error.response.data.message || "Error getting product", isLoading: false });
            throw error;
        }
    },
    getProductByType: async (type, storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getProductList");
            const response = await axios.get(`${URL_API}/type/${type}/${storeId}`);
            //console.log("F: Respueste de getProductList: ", response);
            set({ productList: response.data.productList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting products", isLoading: false });
            throw error;
        }
    }

}))