import { Router } from "express";

import { getBookings, postBookings, updateBookings } from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("", postBookings)
  .put("/:bookingId", updateBookings);

export { bookingsRouter };
