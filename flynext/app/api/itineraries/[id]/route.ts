import { NextRequest } from "next/server";
import prisma from "@/db/database";
import { resolveTokens } from "@/auth/token";

// export async function GET(req: NextRequest, context: { params: { id: string } }) {
export async function GET(req: NextRequest, context: any) {
    try {
        const { id: itineraryId } = context.params;
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({
            where: { uid },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const itinerary = await prisma.itinerary.findUnique({
            where: { id: itineraryId },
            include: {
                bookings: true,
            },
        });

        if (!itinerary) {
            return new Response(JSON.stringify({ error: "Itinerary not found" }), { status: 404 });
        }

        if (itinerary.userId !== user.id) {
            return new Response(JSON.stringify({ error: "Unauthorized access to this itinerary" }), { status: 403 });
        }

        return new Response(JSON.stringify(itinerary), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        console.error("Failed to fetch itinerary:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
