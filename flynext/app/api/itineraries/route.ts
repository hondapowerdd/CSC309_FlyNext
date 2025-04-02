import { NextRequest } from "next/server";
import prisma from "@/db/database";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET_ACCESS as string;

export const POST = async (req: NextRequest) => {
    try {
        const authHeader = req.headers.get("authorization");
        console.log("[DEBUG] Auth header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(JSON.stringify({ error: "Missing token" }), { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const uid = decoded.uid;

        const user = await prisma.user.findUnique({
            where: { uid }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const newItinerary = await prisma.itinerary.create({
            data: {
                userId: user.id
            }
        });

        return new Response(JSON.stringify(newItinerary), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Failed to create itinerary", err);
        return new Response(JSON.stringify({ error: "Failed to create itinerary" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
