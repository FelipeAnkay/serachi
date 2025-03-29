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
            set({error:error.response.data.message || "Error Signing up"});
            throw error;
        }
    }
}))