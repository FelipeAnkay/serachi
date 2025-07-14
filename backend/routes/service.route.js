import express from 'express';
import { updateService, createService, getServiceById, getServiceNoStaff, getServiceByStoreId, getServiceNoData, getServiceByDates, ChangeType, getServiceByEmail, deleteService, getServicesByIds, deleteServiceByEmail, fixServiceWithoutEmail, getServiceByNameDate, fixRemoveDuplicated, getServicesForCommissions, getServicesForCalendar, getServicesFacility, deleteAllServiceByUEmail } from '../controllers/service.controller.js';

const router = express.Router();

router.post("/create", createService);
router.post("/update", updateService);
router.post("/remove-email", deleteServiceByEmail);
router.get("/get/:id", getServiceById);
router.get("/get-ids/:ids", getServicesByIds);
router.get("/store/:storeId", getServiceByStoreId);
router.get("/fix/:name/:dataFix/:storeId", fixServiceWithoutEmail);
router.get("/nostaff/:storeId", getServiceNoStaff);
router.get("/nodata/:storeId", getServiceNoData);
router.get("/dates/:storeId/:dateIn/:dateOut", getServiceByDates);
router.get("/fees/:storeId/:dateIn/:dateOut", getServicesForCommissions);
router.get("/calendar/:storeId/:dateIn/:dateOut", getServicesForCalendar);
router.get("/changeType", ChangeType);
router.get("/name-date/:name/:dateStart/:dateEnd/:storeId", getServiceByNameDate);
router.get("/email/:email/:storeId", getServiceByEmail);
router.delete("/remove", deleteService);
router.delete("/fix-remove-duplicated/:dateIn/:dateOut/:storeId", fixRemoveDuplicated);
router.get("/facility/:storeId/:date/:withFacility", getServicesFacility);
router.delete("/delete-all/:userEmail/:storeId", deleteAllServiceByUEmail)

export default router;