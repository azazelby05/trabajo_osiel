import { Router } from "express";
import { create, getAll, search, update, remove } from "../controllers/userController.js";

const router = Router();
router.get("/search", search);
router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
