import { notFoundError, requestError } from "@/errors";
import bookingRepository from "@/repositories/bookin-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBookings(userId: number) {
  const booking = await bookingRepository.findWhithRoomsByUserId(userId);
  if (booking.length === 0) {
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
  const booking = await bookingRepository.updateBooking(bookingId, roomId);
  return booking.id;
}

async function findByUserId(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  return booking.id;
}

async function findByBookingAndUserId(bookingId: number, userId: number) {
  const booking = await bookingRepository.findByBookingAndUserId(bookingId, userId);
  if (!booking) {
    throw notFoundError;
  }
  return booking.id;
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

const bookingService = {
  getBookings,
  createBooking,
  findByUserId,
  findByBookingAndUserId,
  updateBooking,
  vacantRoomValidation,
};

export default bookingService;
