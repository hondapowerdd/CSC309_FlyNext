// mark notifications as read

import { NextResponse } from "next/server";

import { resolveTokens, updateTokens } from "@/auth/token";

import prisma from "@/db/database";

export async function POST(req) {
    try {
        const { uid, tokenType } = await resolveTokens(req);
        if (tokenType !== "access") {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { notificationId } = await req.json();

        if (!notificationId) {
            return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
        }

        // check if the notification exists
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId},
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // check if the notification is already read
        if (notification.isRead) {
            return NextResponse.json({ error: "Notification already read" }, { status: 400 });
        }

        // get the userId
        const userid = await prisma.user.findUnique({
            where: { uid },
            select: { id: true },
        });
        const userId = userid.id;

        // check if the notification belongs to the user
        if (notification.userId !== userId) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // to this point, the notification is valid, thus mark it as read
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        // return NextResponse.json({ message: "Notification marked as read" }, { status: 200 });

        return NextResponse.json({
            message: "Notification marked as read",
            tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
        });

    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ------------------------------------------------------------------------------------------
// sample query
// williammeng@HONDA-Book-Pro ~ % curl -X POST "http://localhost:3002/api/notifications/read" \
//      -H "Content-Type: application/json" \
//      -d '{"notificationId": "notif_1"}'

// curl -X POST "http://localhost:3002/api/notifications/read" \
//      -H "Content-Type: application/json" \
//      -d '{"notificationId": "notif_2"}'
