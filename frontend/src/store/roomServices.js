// roomServices.js
import { create } from 'zustand';
import axios from 'axios';

const URL_API = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api/auth'
    : '/api/auth';

axios.defaults.withCredentials = true;

export const useRoomServices = create((set) => ({

    /**
     * Obtiene todas las habitaciones disponibles para un rango de fechas y cantidad de camas
     */
    getAvailableRooms: async ({ dateIn, dateOut, bedsRequired, storeId }) => {
        try {
            //console.log("B: Entre a getAvailableRooms", dateIn, " - ", dateOut, " - ", bedsRequired, " - ", storeId)
            const response = await axios.post(`${URL_API}/get-available-rooms`, {
                dateIn,
                dateOut,
                bedsRequired,
                storeId,
            });
            return response.data; // { availableRooms: [...] }
        } catch (error) {
            console.error("Error getting available rooms:", error);
            throw error;
        }
    },

    /**
     * Sugiere reservas divididas si no hay disponibilidad completa en una sola habitación
     */
    splitReservationAcrossRooms: async ({ dateIn, dateOut, bedsRequired = 1, storeId }) => {
        try {
            const response = await axios.post(`${URL_API}/split-room-reservation`, {
                dateIn,
                dateOut,
                bedsRequired,
                storeId,
            });
            return response.data; // { segments: [{roomId, dateIn, dateOut, beds}], suggestionText }
        } catch (error) {
            console.error("Error splitting room reservation:", error);
            throw error;
        }
    },

    /**
     * Obtiene todas las habitaciones del sistema
     */
    getRoomList: async (storeId) => {
        try {
            const response = await axios.get(`${URL_API}/get-room-list/${storeId}`);
            return response.data; // { roomList: [...] }
        } catch (error) {
            console.error("Error fetching room list:", error);
            throw error;
        }
    },

    /**
     * Crea una nueva habitación (admin)
     */
    createRoom: async (roomData) => {
        try {
            const response = await axios.post(`${URL_API}/create-room`, roomData);
            return response.data;
        } catch (error) {
            console.error("Error creating room:", error);
            throw error;
        }
    },

    /**
     * Registra una reserva
     */
    createRoomReservation: async (reservationData) => {
        try {
            const response = await axios.post(`${URL_API}/create-room-reservation`, reservationData);
            return response.data;
        } catch (error) {
            console.error("Error creating reservation:", error);
            throw error;
        }
    },

    getReservations: async (storeId) => {
        try {
            const response = await axios.get(`${URL_API}/get-room-reservation-store/${storeId}`);
            return response.data;
        } catch (error) {
            console.error("Error getting reservation:", error);
            throw error;
        }
    }

}));
