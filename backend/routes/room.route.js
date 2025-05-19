import express from 'express';
import { createRoom, getRoomById, roomList, updateRoom } from '../controllers/room.controller.js';

const router = express.Router();

router.post("/create", createRoom);
router.post("/update", updateRoom);
router.get("/list/:storeId", roomList);
router.get("/get/:id", getRoomById);

export default router;