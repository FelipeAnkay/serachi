import express from 'express';
import { createPartner, updatePartner, partnerList, partnerByEmail, removePartner, createIndex } from '../controllers/partner.controller.js';

const router = express.Router();

router.post("/create", createPartner);
router.post("/update", updatePartner);
router.post("/remove", removePartner);
router.get("/list/:storeId", partnerList);
router.get("/get/:email/:storeId", partnerByEmail);
router.post("/syncIndex", createIndex);

export default router;