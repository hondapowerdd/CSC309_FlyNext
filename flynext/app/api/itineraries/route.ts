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

        const itineraries = await prisma.itinerary.findMany({
            where: { userId: user.id },
            include: {
                bookings: {
                    include: {
                        hotel: true,
                        room: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return new Response(JSON.stringify(itineraries), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[ITINERARIES] GET error:", err);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { uid } = await resolveTokens(req);
        if (!uid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { uid } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existing = await prisma.itinerary.findMany({
            where: { userId: user.id },
        });

        let maxNum = 0;
        for (const itin of existing) {
            const match = itin.name?.match(/^Itinerary (\d+)$/);
            if (match) {
                const num = parseInt(match[1]);
                if (!isNaN(num)) {
                    maxNum = Math.max(maxNum, num);
                }
            }
        }

        const newName = `Itinerary ${maxNum + 1}`;

        const itinerary = await prisma.itinerary.create({
            data: {
                userId: user.id,
                name: newName,
            },
        });

        return NextResponse.json(itinerary, { status: 201 });

    } catch (err: any) {
        console.error("[POST itinerary] Failed:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
