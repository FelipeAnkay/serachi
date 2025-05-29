import express from 'express';
import { createCloseTab, deleteCloseTab, getCloseTabByDates, getCloseTabByEmail, getCloseTabById, getCloseTabByStoreId, updateCloseTab } from '../controllers/closeTab.controller.js';

const router = express.Router();

router.post("/create", createCloseTab);
router.post("/update", updateCloseTab);
router.get("/get/:id", getCloseTabById);
router.get("/store/:storeId", getCloseTabByStoreId);
router.get("/dates/:storeId/:date", getCloseTabByDates);
router.get("/email/:email/:storeId", getCloseTabByEmail);
router.delete("/remove", deleteCloseTab);

export default router;