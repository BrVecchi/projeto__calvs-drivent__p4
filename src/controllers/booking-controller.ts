import { Response } from "express";
import httpStatus from "http-status";

import { AuthenticatedRequest } from "@/middlewares";
import bookingSercive from "@/services/bookings-service";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const bookings = await bookingSercive.getBookings(userId);
    return res.status(httpStatus.OK).send(bookings);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const roomId = req.body.roomId;

  try {
    await bookingSercive.createBooking(userId, roomId);
    const bookingId = await bookingSercive.findByUserId(userId);
    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBookings(req: AuthenticatedRequest, res: Response) {
  const roomId = req.body.roomId;
  const userId = req.userId;

  try {
    const oldBookingId = await bookingSercive.findByUserId(userId);
    const newBooking = await bookingSercive.updateBooking(oldBookingId, roomId);
    return res.status(httpStatus.OK).send(newBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
