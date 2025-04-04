import { resolveTokens } from "@/auth/token";
import prisma from "@/db/database";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({ where: { uid } });
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const allItineraries = await prisma.itinerary.findMany({
            where: { userId: user.id },
            include: {
                bookings: {
                    select: {
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        console.log("===== All Itineraries Debug Info =====");
        for (const itin of allItineraries) {
            console.log(`Itinerary ID: ${itin.id}`);
            if (itin.bookings.length === 0) {
                console.log("  No bookings.");
            } else {
                itin.bookings.forEach((b, i) => {
                    console.log(`  Booking #${i + 1}: type = ${b.type}`);
                });
            }
        }

        const filtered = allItineraries.filter((itin) => {
            const hasHotelBooking = itin.bookings.some((b) => b.type === "HOTEL");
            return !hasHotelBooking;
        });

        console.log("[Filtered Itineraries]", filtered.map(i => i.id));

        return new Response(JSON.stringify(filtered), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[ITINERARIES/CONTAIN_HOTEL] GET error:", err);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
