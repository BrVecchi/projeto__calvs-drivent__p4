import { prisma } from "@/config";
import { Hotel, Room, User } from "@prisma/client";

import { createHotel, createRoomWithHotelId } from "./hotels-factory";
import { createUser } from "./users-factory";

export async function createBookingWithRoom(user?: User, hotel?: Hotel, room?: Room) {
  const incomingUser = user || (await createUser());
  const newHotel = hotel || (await createHotel());
  const newRoom = room || (await createRoomWithHotelId(newHotel.id));

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId: newRoom.id,
    },
    include: {
      Room: true,
    },
  });
}
