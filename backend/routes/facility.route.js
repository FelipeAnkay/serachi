import express from 'express';
import { createFacility, facilityList, getFacilityById, updateFacility } from '../controllers/facility.controller.js';

const router = express.Router();

router.post("/create", createFacility);
router.post("/update", updateFacility);
router.get("/list/:storeId", facilityList);
router.get("/get/:id", getFacilityById);

export default router;