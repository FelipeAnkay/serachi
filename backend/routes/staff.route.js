import express from 'express';
import { createStaff, updateStaff, staffList, staffByEmail, removeStaff, staffListByType, createIndex } from '../controllers/staff.controller.js';

const router = express.Router();

router.post("/create", createStaff);
router.post("/update", updateStaff);
router.post("/remove", removeStaff);
router.get("/list/:storeId", staffList);
router.get("/get/:email/:storeId", staffByEmail);
router.get("/type/:type/:storeId", staffListByType);
router.post("/syncIndex", createIndex);

export default router;