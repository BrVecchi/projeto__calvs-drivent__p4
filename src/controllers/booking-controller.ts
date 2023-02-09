import { Response } from "express";
import httpStatus from "http-status";

import { AuthenticatedRequest } from "@/middlewares";
import bookingRepository from "@/repositories/bookin-repository";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const bookings = await bookingRepository.findBokkingsByUserId(userId);
    return res.status(httpStatus.OK).send(bookings);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const roomId = req.body.roomId;
  // Regra de negócio: Apenas usuários com ticket presencial, com hospedagem e pago podem fazer reservas.
  // `roomId` não existente: Deve retornar status code 404.
  // `roomId` sem vaga: Deve retornar status code 403.
  // Fora da regra de negócio: Deve retornar status code 403.
  try {
    await bookingRepository.createBokking(userId, roomId);
    const bookingId = await bookingRepository.findBokking(userId);
    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBookings(req: AuthenticatedRequest, res: Response) {
  const roomId = req.body.roomId;
  const userId = req.userId;
  //   Regra de negócio:**
  //     - A troca só pode ser efetuada para usuários que possuem reservas.
  //     - A troca só pode ser efetuada apenas para quartos livres.
  //   - `roomId` não existente: Deve retornar status code 404.
  //   - `roomId` sem vaga: Deve retornar status code 403.
  //   - Fora da regra de negócio: Deve retornar status code 403.
  try {
    const oldBooking = await bookingRepository.findBokking(userId);
    await bookingRepository.deleteBooking(oldBooking.id);
    const newBooking = await bookingRepository.createBokking(userId, roomId);
    return res.status(httpStatus.OK).send(newBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
