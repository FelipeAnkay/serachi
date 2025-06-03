import express from 'express';
import { createRole, getRoleById, getRolesByStoreId, removeRole, updateRole } from '../controllers/role.controller.js';

const router = express.Router();

router.post("/create", createRole);
router.post("/update", updateRole);
router.post("/remove", removeRole);
router.get("/get/:id",getRoleById);
router.get("/roles/:storeId", getRolesByStoreId);

export default router;
