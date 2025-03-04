import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, res) {
    try {
        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get("id");

        if (!hotelId) {
            return new Response(JSON.stringify({ error: "Hotel ID is required" }), { status: 400 });
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                rooms: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        pricePerNight: true,
                        amenities: true,
                    },
                },
                images: {
                    select: {
                        imageUrl: true,
                    },
                },
            },
        });

        if (!hotel) {
            return new Response(JSON.stringify({ error: "Hotel not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(hotel), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
