import { notFoundError, requestError } from "@/errors";
import bookingRepository from "@/repositories/bookin-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBookings(userId: number) {
  const booking = await bookingRepository.findWhithRoomsByUserId(userId);
  if (!booking) {
    throw notFoundError;
  }
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  // Regra de negócio: Apenas usuários com ticket presencial, com hospedagem e pago podem fazer reservas.
  const userEnrollment = await enrollmentRepository.findByUserId(userId);
  if (!userEnrollment) {
    throw notFoundError;
  }
  const userTicket = await ticketRepository.findTicketByEnrollmentId(userEnrollment.id);
  if (!!userTicket.TicketType.isRemote || userTicket.status !== "PAID") {
    throw notFoundError;
  }
  await bookingRepository.createBooking(userId, roomId);
}

async function updateBooking(bookingId: number, roomId: number) {
  await bookingRepository.updateBooking(bookingId, roomId);
}

async function findByUserId(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking) {
    throw notFoundError;
  }
  return booking.id;
}

async function deleteBooking(bookingId: number) {
  await bookingRepository.deleteBooking(bookingId);
}

async function vacantRoomValidation(roomId: number) {
  const room = await bookingRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError;
  }
  const roomBookings = await bookingRepository.findBookingsByRoom(roomId);

  if (roomBookings.length === room.capacity) {
    throw requestError;
  }
}

const bookingServive = {
  getBookings,
  createBooking,
  findByUserId,
  updateBooking,
  deleteBooking,
  vacantRoomValidation,
};

export default bookingServive;
