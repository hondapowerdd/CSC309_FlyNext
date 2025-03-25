import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { resolveTokens, updateTokens } from "@/auth/token";

export const POST = async (req) => {
    try {
        const resolvedToken = await resolveTokens(req);
        const tokenType = resolvedToken["tokenType"];
        const tokenUid = resolvedToken["uid"];

        const { userId, hotelId, roomId, checkInDate, checkOutDate } = await req.json();

        if (!userId || !hotelId || !roomId || !checkInDate || !checkOutDate) {
            return new Response(JSON.stringify({ error: "Missing required hotel booking information" }), { status: 400 });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            return new Response(JSON.stringify({ error: "Invalid date format" }), { status: 400 });
        }

        if (checkIn >= checkOut) {
            return new Response(JSON.stringify({
                error: "Check-out date must be after check-in date"
            }), { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { availability: true }
        });

        if (!room) {
            return new Response(JSON.stringify({ error: "Room not found" }), { status: 404 });
        }

        const datesToCheck = [];
        for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
            datesToCheck.push(new Date(date));
        }

        const roomAvailabilities = await prisma.roomAvailability.findMany({
            where: {
                roomId: roomId,
                date: { in: datesToCheck }
            },
            select: { date: true, availability: true }
        });

        for (const date of datesToCheck) {
            const availabilityRecord = roomAvailabilities.find(record =>
                record.date.getTime() === date.getTime()
            );

            if (availabilityRecord && availabilityRecord.availability >= room.availability) {
                return new Response(JSON.stringify({
                    error: `No available rooms for selected dates. Fully booked on ${date.toISOString().split('T')[0]}`
                }), { status: 409 });
            }
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                hotelId,
                roomId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                status: "PENDING",
            }
        });

        const roomAvailabilityUpdates = [];
        for (const date of datesToCheck) {
            const existingAvailability = roomAvailabilities.find(record =>
                record.date.getTime() === date.getTime()
            );

            if (existingAvailability) {
                roomAvailabilityUpdates.push(
                    prisma.roomAvailability.update({
                        where: { roomId_date: { roomId: roomId, date: date } },
                        data: { availability: { increment: 1 } }
                    })
                );
            } else {
                roomAvailabilityUpdates.push(
                    prisma.roomAvailability.create({
                        data: {
                            roomId: roomId,
                            date: date,
                            availability: 1
                        }
                    })
                );
            }
        }

        await prisma.$transaction(roomAvailabilityUpdates);

        return new Response(JSON.stringify({
            message: "Hotel booking successful",
            booking,
            tokenUpdates: tokenType === "refresh" ? updateTokens(tokenUid) : null
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
