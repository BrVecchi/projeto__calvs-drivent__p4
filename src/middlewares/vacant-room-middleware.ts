import { NextFunction, Response } from "express";
import httpStatus from "http-status";

import bookingServive from "@/services/bookings-service";

import { AuthenticatedRequest } from "./authentication-middleware";

export async function vacantRoomValidationMiddlweare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = req.body.roomId;
  try {
    await bookingServive.vacantRoomValidation(roomId);
    return next();
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "RequestError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}
