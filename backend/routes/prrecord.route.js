import express from 'express';
import { createPRrecord, getPRrecordById, prrecordList, updatePRrecord } from '../controllers/prrecord.controller.js';

const router = express.Router();

router.post("/create", createPRrecord);
router.post("/update", updatePRrecord);
router.get("/list/:storeId", prrecordList);
router.get("/get/:id", getPRrecordById);

export default router;