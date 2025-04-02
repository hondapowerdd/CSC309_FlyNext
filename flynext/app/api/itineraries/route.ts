import { resolveTokens } from "@/auth/token";
import prisma from "@/db/database";

export const GET = async (req: Request) => {
    try {
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({ where: { uid } });
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const itineraries = await prisma.itinerary.findMany({
            where: { userId: user.id },
            select: { id: true }, 
        });

        return new Response(JSON.stringify(itineraries), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("GET /api/itineraries failed:", err);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const POST = async (req: Request) => {
    try {
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({ where: { uid } });
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const newItinerary = await prisma.itinerary.create({
            data: {
                userId: user.id,
            },
        });

        return new Response(JSON.stringify(newItinerary), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("POST /api/itineraries failed:", err);
        return new Response(JSON.stringify({ error: "Failed to create itinerary" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
