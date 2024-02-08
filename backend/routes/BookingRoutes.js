import { Router } from "express";
import { addBooking, deleteBooking, getBookings, getBooking } from "../controllers/BookingController.js";

const router = Router();

router.get('/', getBookings)
router.get('/:id', getBooking)
router.post('/', addBooking)
router.delete('/:id', deleteBooking)

export default router;