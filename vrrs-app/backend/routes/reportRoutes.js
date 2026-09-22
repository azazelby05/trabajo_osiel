import { Router } from "express";
import { getReservationRentalReport, getReportByDate } from "../controllers/reportController.js";

const router = Router();
router.get("/reservation-rental", getReservationRentalReport);
router.get("/by-date", getReportByDate);
router.get("/", getReportByDate);
export default router;
