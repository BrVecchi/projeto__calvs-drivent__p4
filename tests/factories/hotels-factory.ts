import { prisma } from "@/config";
import faker from "@faker-js/faker";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createNoVacantRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1080",
      capacity: 0,
      hotelId: hotelId,
    },
  });
}
