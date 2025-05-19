import express from 'express';
import { createPayRate, getPayRateByEmail, getPayRateById, payrateList, removePayrate, updatePayRate } from '../controllers/payrate.controller.js';

const router = express.Router();

router.post("/create", createPayRate);
router.post("/update", updatePayRate);
router.post("/remove", removePayrate);
router.get("/list/:storeId", payrateList);
router.get("/email/:email/:storeId", getPayRateByEmail);
router.get("/get/:id", getPayRateById);

export default router;