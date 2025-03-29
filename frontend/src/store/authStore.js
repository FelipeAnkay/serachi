import {create} from 'zustand';
import axios from 'axios';
const URL_API = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user:null,
    isAuthenticated:false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    signup: async(email, password, name) => {
        set({isLoading:true,error:null});
        try {
           const response = await axios.post(`${URL_API}/signup`,{email,password,name});
           set({user:response.data.user, isAuthenticated:true,isLoading:false});
        } catch (error) {
            set({error:error.response.data.message || "Error Signing up", isLoading: false});
            throw error;
        }
    },
    verifyEmail: async (code) => {
        set({isLoading:true,error:null});
        try {
            const response = await axios.post(`${URL_API}/verify-email`,{code});
            set({user:response.data.user, isAuthenticated:true,isLoading:false});
            return response.data; 
        } catch (error) {
            set({error:error.response.data.message || "Error Verifiying Code frnt", isLoading: false});
            throw error;
        }
    },
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null});
        try {
            const response = await axios.get(`${URL_API}/check-auth/`);
            set({user:response.data.user,isAuthenticated:true,isCheckingAuth: false});
            return response.data; 
        } catch (error) {
            set({error:null, isCheckingAuth: false, isAuthenticated:false});
            throw error;
        }
    },
    login: async (email, password) => {
        set({isLoading:true,error:null});
        try {
           const response = await axios.post(`${URL_API}/login`,{email,password});
           set({user:response.data.user, isAuthenticated:true,isLoading:false});
        } catch (error) {
            set({error:error.response.data.message || "Error Signing up", isLoading: false});
            throw error;
        }
    }
}))