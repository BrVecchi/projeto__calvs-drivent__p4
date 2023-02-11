import { prisma } from "@/config";
import { User } from "@prisma/client";

import { createHotel, createRoomWithHotelId } from "./hotels-factory";
import { createUser } from "./users-factory";

export async function createBookingWithRoom(user?: User) {
  const incomingUser = user || (await createUser());
  const hotelId = (await createHotel()).id;
  const roomId = (await createRoomWithHotelId(hotelId)).id;

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId,
    },
    include: {
      Room: true,
    },
  });
}
