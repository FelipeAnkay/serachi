import express from 'express';
import { cancelRoomReservation, createRoomReservation, getAvailableRooms, getReservationsByEmail, getReservationsByIds, roomReservationByDates, roomReservationList, splitRoomReservation, updateRoomReservation } from '../controllers/roomReservation.controller.js';

const router = express.Router();

router.post("/create", createRoomReservation);
router.post("/update", updateRoomReservation);
router.get("/list/:storeId", roomReservationList);
router.post("/available", getAvailableRooms);
router.post("/split", splitRoomReservation);
router.get("/dates/:storeId/:dateIn/:dateOut", roomReservationByDates);
router.get("/email/:email/:storeId", getReservationsByEmail);
router.get("/get-ids/:ids", getReservationsByIds);
router.delete("/cancel/:id", cancelRoomReservation);

export default router;