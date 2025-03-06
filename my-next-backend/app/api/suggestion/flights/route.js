// As a user, I want to see hotel suggestions for the city if I am flying to.
// I also want to see flight suggestions if I am about to book a hotel stay.
// Both suggestions must have a link to take me to the main hotel / flight
// search page with pre - filled inputs, while preserving my current, in progress order.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const POST = async (req) => {
    try {
        const { origin, return_on_checkout, hotelId, checkInDate, checkOutDate } = await req.json();

        // check all variables
        if (!origin || !hotelId || !checkInDate || !checkOutDate) {
            return new Response(JSON.stringify({
                error: "Missing required booking details"
            }), { status: 400 });
        }

        // get hotel city
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { city: true }
        });

        if (!hotel) {
            return new Response(JSON.stringify({
                error: "Hotel not found"
            }), { status: 404 });
        }

        if (!hotel.city) {
            return new Response(JSON.stringify({
                error: "Hotel city information missing"
            }), { status: 400 });
        }

        // generate link
        const departureDate = checkInDate;
        let link = `/flights_search/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(hotel.city)}&date=${departureDate}`;

        if (return_on_checkout) {
            link += `&returnDate=${checkOutDate}`;
        }

        return new Response(JSON.stringify({ link }), { status: 200 });

    } catch (error) {
        console.error("Flight suggestion error:", error);
        return new Response(JSON.stringify({
            error: "Failed to fetch flight suggestions",
            details: error.message
        }), { status: 500 });
    }
};