import { Response } from "express";
import httpStatus from "http-status";

import { prisma } from "@/config";
import { AuthenticatedRequest } from "@/middlewares";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
      },
    });
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
    await prisma.booking.create({
      data: {
        userId,
        roomId,
      },
    });
    const bookingId = await prisma.booking.findFirst({
      where: {
        userId,
        roomId,
      },
    });
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
    const oldBooking = await prisma.booking.findFirst({
      where: {
        userId,
      },
    });
    await prisma.booking.delete({
      where: {
        id: oldBooking.id,
      },
    });
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        roomId,
      },
    });
    return res.status(httpStatus.OK).send(newBooking.id);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
