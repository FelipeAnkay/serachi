import express from 'express';
import { createRoomReservation, getAvailableRooms, roomReservationList, splitRoomReservation, updateRoomReservation } from '../controllers/roomReservation.controller.js';

const router = express.Router();

router.post("/create", createRoomReservation);
router.post("/update", updateRoomReservation);
router.get("/list/:storeId", roomReservationList);
router.post("/available", getAvailableRooms);
router.post("/split", splitRoomReservation);

export default router;