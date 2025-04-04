import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/database";

export async function GET(req) {
    console.log("starting to fetch hotels by owner");
    try {
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json({ error: "Missing uid parameter" }, { status: 400 });
        }

        const hotels = await prisma.hotel.findMany({
            where: {
                ownerId: uid,
            },
        });

        return NextResponse.json({ hotels }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch hotels by owner:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
