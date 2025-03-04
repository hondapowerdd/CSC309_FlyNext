// As a visitor, I want to view the availability and details of
// different room types for my selected dates in a selected hotel.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, res) {
    try {
        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get("hotelId");
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");

        if (!hotelId || !checkInDate || !checkOutDate) {
            return new Response(
                JSON.stringify({ error: "hotelId, checkInDate, and checkOutDate are required" }),
                { status: 400 }
            );
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            return new Response(JSON.stringify({ error: "Invalid date format" }), { status: 400 });
        }

        const rooms = await prisma.room.findMany({
            where: {
                hotelId: hotelId,
                bookings: {
                    none: {
                        OR: [
                            {
                                checkInDate: { lte: checkOut },
                                checkOutDate: { gte: checkIn },
                            },
                        ],
                    },
                },
            },
            select: {
                id: true,
                name: true,
                type: true,
                pricePerNight: true,
                availability: true,
                amenities: true,
                images: {
                    select: {
                        imageUrl: true,
                    },
                },
            },
        });

        if (rooms.length === 0) {
            return new Response(
                JSON.stringify({ message: "No available rooms for the selected dates" }),
                { status: 200 }
            );
        }

        return new Response(JSON.stringify({ availableRooms: rooms }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
