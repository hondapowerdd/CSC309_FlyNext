import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

export async function PATCH(request, { params }) {
    // cancell booking

    const { tokenType, tokenUid } = await resolveTokens(request);
    // const tokenType = resolvedToken["tokenType"];
    // const tokenUid = resolvedToken["uid"];

    const { id } = await params;

    let booking;
    try { // Cancel booking
        booking = await database.Booking.findUnique({
            where: {
                id,
                user: { uid: tokenUid }
            },
        });
        if (booking.status === "CANCELED") return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
        booking = await database.Booking.update({
            where: {
                id,
                user: { uid: tokenUid }
             },
            data: { status: "CANCELED" }
        })
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

    try { // Release availability
        await database.roomAvailability.updateMany({
            where: {
                roomId: booking.roomId,
                date: {
                    gte: booking.checkInDate,
                    lt: booking.checkOutDate
                }
             },
            data: {
                availability: { increment: 1 },
            },
        });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update availability info" }, { status: 500 });
    }
    
    return NextResponse.json({
        message: "Booking cancelled",
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}