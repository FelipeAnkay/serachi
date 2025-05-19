import express from 'express';
import { updateService, createService, getServiceById, getServiceNoStaff, getServiceByStoreId, getServiceNoData, getServiceByDates } from '../controllers/service.controller.js';

const router = express.Router();

router.post("/create", createService);
router.post("/update", updateService);
router.get("/get/:id", getServiceById);
router.get("/store/:storeId", getServiceByStoreId);
router.get("/nostaff/:storeId", getServiceNoStaff);
router.get("/nodata/:storeId", getServiceNoData);
router.get("/dates/:storeId/:dateIn/:dateOut", getServiceByDates);

export default router;