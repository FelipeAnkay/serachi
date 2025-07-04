import express from 'express';
import { createExperience, updateExperience, experienceList, getExperienceByEmail, getExperienceById, removeServicesFromExperiences, getExperiencesByCheckout, getValidExperienceByEmail } from '../controllers/experience.controller.js';

const router = express.Router();

router.post("/create", createExperience);
router.post("/update", updateExperience);
router.get("/list/:storeId", experienceList);
router.get("/list-checkout/:storeId", getExperiencesByCheckout);
router.get("/email/:email/:storeId", getExperienceByEmail);
router.get("/get/:id", getExperienceById);
router.post("/remove-service", removeServicesFromExperiences);
router.get("/email-valid/:email/:storeId", getValidExperienceByEmail);

export default router;