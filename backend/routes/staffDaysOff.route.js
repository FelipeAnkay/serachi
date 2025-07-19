import express from 'express';
import { createStaffDaysOff, getStaffAvailable, getStaffDaysOffByEmail, getStaffDaysOffByIds, removeStaffDaysOff, StaffDaysOffByDates, StaffDaysOffList, updateStaffDaysOff } from '../controllers/staffDaysOff.controller.js';


const router = express.Router();

router.post("/create", createStaffDaysOff);
router.post("/update", updateStaffDaysOff);
router.get("/list/:storeId", StaffDaysOffList);
router.post("/available", getStaffAvailable);
router.get("/dates/:storeId/:dateIn/:dateOut", StaffDaysOffByDates);
router.get("/email/:email/:storeId", getStaffDaysOffByEmail);
router.get("/get-ids/:ids", getStaffDaysOffByIds);
router.delete("/delete/:id", removeStaffDaysOff);

export default router;