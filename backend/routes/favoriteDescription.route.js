import express from 'express';
import { createFavoriteDescription, favoriteDescriptionList, removeFavoriteDescription, updateFavoriteDescription } from '../controllers/favoriteDescription.controller.js';


const router = express.Router();

router.post("/create", createFavoriteDescription);
router.post("/update", updateFavoriteDescription);
router.post("/remove", removeFavoriteDescription);
router.get("/list/:storeId/:type", favoriteDescriptionList);

export default router;