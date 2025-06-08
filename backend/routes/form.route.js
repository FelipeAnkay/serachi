import express from 'express';
import { createForm, getFormById, getFormsByStoreId, getTokenData, getUrlToken, updateForm } from '../controllers/form.controller.js';


const router = express.Router();

router.post("/create", createForm);
router.post("/update", updateForm);
router.get("/get/:id",getFormById);
router.get("/forms/:storeId", getFormsByStoreId);
router.get("/token/:email/:storeId", getUrlToken);
router.get("/dataToken/:urlToken", getTokenData);

export default router;
