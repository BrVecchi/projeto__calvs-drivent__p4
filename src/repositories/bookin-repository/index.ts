import { prisma } from "@/config";

async function findBokkingsByUserId(userId: number) {
  return prisma.booking.findMany({
    where: {
      userId: userId,
    },
    include: {
      Room: true,
    },
  });
}

async function findBokking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}

async function createBokking(userId: number, roomId: number) {
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

const bookingRepository = {
  findBokkingsByUserId,
  findBokking,
  createBokking,
  deleteBooking,
};

export default bookingRepository;
