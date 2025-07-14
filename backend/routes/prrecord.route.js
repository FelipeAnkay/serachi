import express from 'express';
import { createPRrecord, deleteAllPRByUEmail, getPRrecordById, prrecordList, updatePRrecord } from '../controllers/prrecord.controller.js';

const router = express.Router();

router.post("/create", createPRrecord);
router.post("/update", updatePRrecord);
router.get("/list/:storeId", prrecordList);
router.get("/get/:id", getPRrecordById);
router.delete("/delete-all/:userEmail/:storeId", deleteAllPRByUEmail)

export default router;