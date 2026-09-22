import { Router } from "express";
import { create, getAll, search, getById, update, remove } from "../controllers/reservationController.js";

const router = Router();
router.get("/search", search);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
