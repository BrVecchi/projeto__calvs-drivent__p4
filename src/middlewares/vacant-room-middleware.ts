import { NextFunction, Response } from "express";
import httpStatus from "http-status";

import { notFoundError, requestError } from "@/errors";
import bookingServive from "@/services/bookings-service";

import { AuthenticatedRequest } from "./authentication-middleware";

export async function vacantRoomValidationMiddlweare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = req.body.roomId;
  try {
    await bookingServive.vacantRoomValidation(roomId);
    return next();
  } catch (error) {
    if (error.name === "notFoundError") {
      generateNotFoundResponse(res);
    }
    if (error.name === "RequestError") {
      generateForbiddenResponse(res);
    }
  }
}

function generateNotFoundResponse(res: Response) {
  res.status(httpStatus.NOT_FOUND).send(notFoundError());
}

function generateForbiddenResponse(res: Response) {
  res.status(httpStatus.FORBIDDEN).send(requestError(403, "This room is already full"));
}
