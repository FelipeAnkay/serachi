import express from 'express';
import { createExperience, updateExperience, experienceList } from '../controllers/experience.controller.js';

const router = express.Router();

router.post("/create", createExperience);
router.post("/update", updateExperience);
router.get("/list", experienceList);

export default router;