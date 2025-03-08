// 1. As a user, I want to receive notifications when I book a new itinerary,
//     and when there are external changes to my booking (e.g., cancellation by me or hotel owner).
//
// 2. As a hotel owner, I want to receive notifications when a new booking is made for my hotel.
//
// 3. As a user or hotel owner, I want to see the number of unread notifications as a badge and have it updated as I read them.
//

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const unreadOnly = searchParams.get("unreadOnly") === "true"; // Only unread notifications
        // const type = searchParams.get("type"); // Filter by type

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        let whereClause = { userId };

        if (unreadOnly) {
            whereClause.isRead = false;
        }

        // if (type) {
        //     whereClause.type = type; // Filter by notification type
        // }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


// ------------------------------------------------------------------------------------------
// sample query

// curl -X GET "http://localhost:3002/api/notifications?userId=owner_1"
//  curl -X GET "http://localhost:3002/api/notifications?userId=owner_1&unreadOnly=true"