import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";

import app, { init } from "@/app";
import bookingRepository from "@/repositories/bookin-repository";
import faker from "@faker-js/faker";

import {
  createBookingWithRoom,
  createEnrollmentWithAddress,
  createHotel,
  createRoomWithHotelId,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
} from "../factories";
import { createUser } from "../factories/users-factory";
import { generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

// beforeEach(async () => {
//   await cleanDb();
// });

const server = supertest(app);

describe("GET /bookings", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/bookings");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should return status 404 when user don`t have a booking", async () => {
      const token = await generateValidToken();

      const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should return status 200 and booking data with room when there is a booking for givin user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await createBookingWithRoom(user);

      const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: booking.id,
          userId: booking.userId,
          roomId: booking.roomId,
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString(),
          Room: {
            id: booking.Room.id,
            capacity: booking.Room.capacity,
            hotelId: booking.Room.hotelId,
            name: booking.Room.name,
            createdAt: booking.Room.createdAt.toISOString(),
            updatedAt: booking.Room.updatedAt.toISOString(),
          },
        },
      ]);
    });
  });
});

describe("POST /bookings", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/bookings");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should return status 404 if there is no room for given roomId", async () => {
      const user = await createUser();
      const enrollmentId = (await createEnrollmentWithAddress(user)).id;
      const ticketTypeId = (await createTicketTypeWithHotel()).id;
      await createTicket(enrollmentId, ticketTypeId, "PAID");
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      await createRoomWithHotelId(hotel.id);

      const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`).send({ roomId: 0 });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    // it("should return status 403 if there is no vacant for given room", async () => {
    //   const user = await createUser();
    //   const enrollmentId = (await createEnrollmentWithAddress(user)).id;
    //   const ticketTypeId = (await createTicketTypeWithHotel()).id;
    //   await createTicket(enrollmentId, ticketTypeId, "PAID");
    //   const token = await generateValidToken(user);
    //   const hotel = await createHotel();
    //   const room = await createRoomWithHotelId(hotel.id);

    //   const response = await server.post("/bookings").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });
    //   expect(response.status).toBe(httpStatus.OK);
    // });

    describe("when there is vacant room", () => {
      it("should respond with status 403 if ticket is remote for given user", async () => {
        const user = await createUser();
        const enrollmentId = (await createEnrollmentWithAddress(user)).id;
        const ticketTypeId = (await createTicketTypeRemote()).id;
        await createTicket(enrollmentId, ticketTypeId, "RESERVED");
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
          .post("/bookings")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if there is no enrollment for given user", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
          .post("/bookings")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket is not PAID for given user", async () => {
        const user = await createUser();
        const enrollmentId = (await createEnrollmentWithAddress(user)).id;
        const ticketTypeId = (await createTicketTypeWithHotel()).id;
        await createTicket(enrollmentId, ticketTypeId, "RESERVED");
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
          .post("/bookings")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should return status 200 and bookingId data", async () => {
        const user = await createUser();
        const enrollmentId = (await createEnrollmentWithAddress(user)).id;
        const ticketTypeId = (await createTicketTypeWithHotel()).id;
        await createTicket(enrollmentId, ticketTypeId, "PAID");
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);

        const response = await server
          .post("/bookings")
          .set("Authorization", `Bearer ${token}`)
          .send({ roomId: room.id });
        const bookingId = (await bookingRepository.findByUserId(user.id)).id;
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          bookingId: bookingId,
        });
      });
    });
  });
});

describe("PUT /bookings/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/bookings");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/bookings").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});
