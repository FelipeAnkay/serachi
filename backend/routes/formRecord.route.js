import express from 'express';
import { createFormRecord, getFormRecordsByEmail, getFormRecordsById, getFormsRecordsByStoreId, updateFormRecord } from '../controllers/formRecord.controller.js';


const router = express.Router();

router.post("/create", createFormRecord);
router.post("/update", updateFormRecord);
router.get("/get/:id", getFormRecordsById);
router.get("/fr/:storeId", getFormsRecordsByStoreId);
router.get("/fr/:email/:storeId", getFormRecordsByEmail);

export default router;
