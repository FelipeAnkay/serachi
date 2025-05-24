import express from 'express';
import { createRoomReservation, getAvailableRooms, roomReservationByDates, roomReservationList, splitRoomReservation, updateRoomReservation } from '../controllers/roomReservation.controller.js';

const router = express.Router();

router.post("/create", createRoomReservation);
router.post("/update", updateRoomReservation);
router.get("/list/:storeId", roomReservationList);
router.post("/available", getAvailableRooms);
router.post("/split", splitRoomReservation);
router.get("/dates/:storeId/:dateIn/:dateOut", roomReservationByDates);

export default router;