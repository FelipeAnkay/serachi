import express from 'express';
import {updateStore, createStore, getStoreById, usersCompany } from '../controllers/store.controller.js';

const router = express.Router();

router.post("/create", createStore);

router.post("/update", updateStore);

router.get("/get/:id", getStoreById);

router.get("/users/:storeId", usersCompany);

export default router;