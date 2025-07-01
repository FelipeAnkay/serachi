import { create } from 'zustand';
import axios from 'axios';
import { formatDateISO, formatEndOfDayDateISO } from '../components/formatDateDisplay'
const URL_API = import.meta.env.MODE === "development" ? "http://localhost:5000/api/services" : "/api/services";


axios.defaults.withCredentials = true;

export const useServiceServices = create((set) => ({
    name: null,
    productId: null,
    quoteId: null,
    facilityId: null,
    staffEmail: null,
    customerEmail: null,
    dateIn: null,
    dateOut: null,
    storeId: null,
    userEmail: null,
    isActive: null,
    excecuted: null,
    serviceList: null,
    createService: async (serviceData) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Payload de createService", serviceData);
            const response = await axios.post(`${URL_API}/create`, serviceData);
            console.log("Respuesta de createService:", response);
            set({ service: response.data.service, isLoading: false });
            return response.data.service;
        } catch (error) {
            set({ error: error.response.data.message || "Error Creating a service", isLoading: false });
            throw error;
        }
    },
    updateService: async (serviceId, updatedVars) => {
        set({ isLoading: true, error: null });
        try {
            delete updatedVars._id;;
            delete updatedVars.__v;
            const response = await axios.post(`${URL_API}/update`, {
                id: serviceId,
                ...updatedVars
            });
            console.log("F: Respueste de updateService: ", response);
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error updating service", isLoading: false });
            throw error;
        }
    },
    getServiceList: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getExperiences");
            const response = await axios.get(`${URL_API}/store/${storeId}`);
            //console.log("F: Respueste de getExperiences: ", response);
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting service", isLoading: false });
            throw error;
        }
    },
    getServiceById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceById: ", id);
            const response = await axios.get(`${URL_API}/get/${id}`);
            //console.log("F: Respueste de getServiceById: ", response);
            set({ service: response.data.service, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getServiceByIds: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            console.log("F: Llamado a getServiceByIds: ", ids);
            const response = await axios.get(`${URL_API}/get-ids/${ids}`);
            //console.log("F: Respueste de getServiceByIds: ", response);
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting experiences", isLoading: false });
            throw error;
        }
    },
    getServicesNoStaff: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceNoStaff: ", storeId);
            const response = await axios.get(`${URL_API}/nostaff/${storeId}`);
            //console.log("F: Respueste de getServiceNoStaff: ", response);
            set({ service: response.data.service, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    getServicesNoData: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            //console.log("F: Llamado a getServiceNoStaff: ", storeId);
            const response = await axios.get(`${URL_API}/nodata/${storeId}`);
            //console.log("F: Respueste de getServiceNoStaff: ", response);
            set({ service: response.data.service, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response.data.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    getServicesByDate: async (start, end, storeId) => {
        set({ isLoading: true, error: null });

        try {
            //console.log("FB: Entre a getAvailableRooms: ", start, " - ", end, " - ", storeId)
            const formattedDateIn = formatDateISO(start);
            const formattedDateOut = formatEndOfDayDateISO(end);
            //console.log("FB: Entre a getAvailableRooms formated: ", formattedDateIn, " - ", formattedDateOut, " - ", storeId)
            const response = await axios.get(`${URL_API}/dates/${storeId}/${formattedDateIn}/${formattedDateOut}`);
            //console.log("response: ", response)
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    getServicesForFees: async (start, end, storeId) => {
        set({ isLoading: true, error: null });

        try {
            //console.log("FB: Entre a getAvailableRooms: ", start, " - ", end, " - ", storeId)
            const formattedDateIn = formatDateISO(start);
            const formattedDateOut = formatEndOfDayDateISO(end);

            //console.log("FB: Entre a getAvailableRooms formated: ", formattedDateIn, " - ", formattedDateOut, " - ", storeId)
            const response = await axios.get(`${URL_API}/fees/${storeId}/${formattedDateIn}/${formattedDateOut}`);
            //console.log("response: ", response)
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    getServicesForCalendar: async (start, end, storeId) => {
        set({ isLoading: true, error: null });

        try {
            //console.log("FB: Entre a getAvailableRooms: ", start, " - ", end, " - ", storeId)
            const formattedDateIn = formatDateISO(start);
            const formattedDateOut = formatEndOfDayDateISO(end);
            //console.log("FB: Entre a getAvailableRooms formated: ", formattedDateIn, " - ", formattedDateOut, " - ", storeId)
            const response = await axios.get(`${URL_API}/calendar/${storeId}/${formattedDateIn}/${formattedDateOut}`);
            //console.log("response: ", response)
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    getServicesByEmail: async (storeId, customerEmail) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${URL_API}/email/${customerEmail}/${storeId}`);
            set({ service: response.data.service, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
    removeServicesById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.delete(`${URL_API}/remove`, {
                data: { id }  // Aquí está el arreglo: se debe usar `data` dentro del config
            });
            console.log("F: Respuesta de removeServicesById: ", response);
            set({ serviceList: response.data.serviceList, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error deleting service", isLoading: false });
            throw error;
        }
    },
    getServicesByNameDate: async (name, dateStart, dateEnd, storeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${URL_API}/name-date/${name}/${dateStart}/${dateEnd}/${storeId}`);
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message || "Error getting services", isLoading: false });
            throw error;
        }
    },
}))