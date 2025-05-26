import express from 'express';
import { createExperience, updateExperience, experienceList, getExperienceByEmail } from '../controllers/experience.controller.js';

const router = express.Router();

router.post("/create", createExperience);
router.post("/update", updateExperience);
router.get("/list", experienceList);
router.get("/email/:email/:storeId", getExperienceByEmail);

export default router;