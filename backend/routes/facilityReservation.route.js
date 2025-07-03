import express from 'express';
import { createFacilityReservation, facilityReservationByDates, FacilityReservationList, getAvailableSpaces, getFacilityReservationsByEmail, getReservationsByIds, updateFacilityReservation } from '../controllers/facilityReservation.controller.js';


const router = express.Router();

router.post("/create", createFacilityReservation);
router.post("/update", updateFacilityReservation);
router.get("/list/:storeId", FacilityReservationList);
router.post("/available", getAvailableSpaces);
router.get("/dates/:storeId/:dateIn/:dateOut", facilityReservationByDates);
router.get("/email/:email/:storeId", getFacilityReservationsByEmail);
router.get("/get-ids/:ids", getReservationsByIds);

export default router;