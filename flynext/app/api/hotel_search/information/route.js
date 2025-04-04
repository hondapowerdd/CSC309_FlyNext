// As a visitor, I want to view detailed hotel information, including room types, amenities, and pricing.

import prisma from "@/db/database";

export async function GET(req, res) {
    try {
        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get("hotelId");

        if (!hotelId) {
            return new Response(JSON.stringify({ error: "Hotel ID is required" }), { status: 400 });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { hid: hotelId },
            include: {
                rooms: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        amenities: true,
                        pricePerNight: true,
                    },
                },
                owner: {
                    select: {
                        uid: true
                    }
                }
            },
        });

        if (!hotel) {
            return new Response(JSON.stringify({ error: "Hotel not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(hotel), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (error) {
        // log the error
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}


// ------------------------------------------------------------------------------------------
// query example
// curl -X GET "http://localhost:3005/api/hotel_search/information?hotelId=hotel_1"