import { prisma } from "@/config";

async function findWhithRoomsByUserId(userId: number) {
  return prisma.booking.findMany({
    where: {
      userId: userId,
    },
    include: {
      Room: true,
    },
  });
}

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}

async function findByBookingAndUserId(bookingId: number, userId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
  });
}

async function findBookingsByRoom(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function deleteBooking(bookingId: number) {
  return prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

const bookingRepository = {
  findWhithRoomsByUserId,
  findByUserId,
  findByBookingAndUserId,
  findBookingsByRoom,
  createBooking,
  deleteBooking,
  findRoomById,
  updateBooking,
};

export default bookingRepository;
