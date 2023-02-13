import { Response } from "express";
import httpStatus from "http-status";

import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const bookings = await bookingService.getBookings(userId);
    return res.status(httpStatus.OK).send(bookings);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const roomId = req.body.roomId;

  try {
    await bookingService.createBooking(userId, roomId);
    const bookingId = await bookingService.findByUserId(userId);
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBookings(req: AuthenticatedRequest, res: Response) {
  const roomId = req.body.roomId;
  const userId = req.userId;
  const bookingIdStr = req.params.bookingId;
  const bookingId = Number(bookingIdStr);

  try {
    const oldBookingId = await bookingService.findByBookingAndUserId(bookingId, userId);
    const newBookingId = await bookingService.updateBooking(oldBookingId, roomId);
    return res.status(httpStatus.OK).send({ newBookingId });
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
