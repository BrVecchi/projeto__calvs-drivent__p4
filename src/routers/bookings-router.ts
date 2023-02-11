import { Router } from "express";

import { getBookings, postBookings, updateBookings } from "@/controllers/booking-controller";
import { authenticateToken, vacantRoomValidationMiddlweare } from "@/middlewares";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", vacantRoomValidationMiddlweare, postBookings)
  .put("/:bookingId", vacantRoomValidationMiddlweare, updateBookings);

export { bookingsRouter };
