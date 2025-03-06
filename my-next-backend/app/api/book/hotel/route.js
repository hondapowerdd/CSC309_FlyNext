import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const POST = async (req) => {
    try {
        const { userId, hotelId, roomId, checkInDate, checkOutDate } = await req.json();

        if (!userId || !hotelId || !roomId || !checkInDate || !checkOutDate) {
            return new Response(JSON.stringify({ error: "Missing required hotel booking information" }), { status: 400 });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn) || isNaN(checkOut)) {
            return new Response(JSON.stringify({ error: "Invalid date format" }), { status: 400 });
        }

        //date check
        if (checkIn >= checkOut) {
            return new Response(JSON.stringify({
                error: "Check-out date must be after check-in date"
            }), { status: 400 });
        }

        // check room avaliability
        const existingBooking = await prisma.booking.findFirst({
            where: {
                roomId: roomId,
                status: "CONFIRMED",
                OR: [
                    {
                        checkInDate: { lte: checkOut },
                        checkOutDate: { gte: checkIn }
                    }
                ]
            }
        });

        if (existingBooking) {
            return new Response(JSON.stringify({ error: "No available rooms for selected dates" }), { status: 409 });
        }

        // room avaliability
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { availability: true }
        });

        if (!room || room.availability <= 0) {
            return new Response(JSON.stringify({ error: "No available rooms of this type" }), { status: 400 });
        }

        // create room
        const [booking, updatedRoom] = await prisma.$transaction([
            prisma.booking.create({
                data: {
                    userId,
                    hotelId,
                    roomId,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    status: "CONFIRMED",
                }
            }),
            prisma.room.update({
                where: { id: roomId },
                data: { availability: { decrement: 1 } }
            })
        ]);

        return new Response(JSON.stringify({
            message: "Hotel booking successful",
            booking,
            remainingAvailability: updatedRoom.availability
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error booking hotel:", error);
        return new Response(JSON.stringify({ error: "Failed to book hotel", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};