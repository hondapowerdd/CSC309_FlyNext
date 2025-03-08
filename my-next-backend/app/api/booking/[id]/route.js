import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

export async function PATCH(request, { params }) {
    // Profile update

    const { tokenType, tokenUid } = await resolveTokens(request);
    // const tokenType = resolvedToken["tokenType"];
    // const tokenUid = resolvedToken["uid"];

    const { id } = await params;

    let booking;
    try { // Cancel booking
        booking = await database.Booking.update({
            where: {
                id,
                user: { uid: tokenUid }
             },
            data: { status: "CANCELED" }
        })
    } catch (e) {
        return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
    }

    try { // Release availability
        const booking = await database.roomAvailability.updateMany({
            where: {
                roomId: booking.roomId,
                date: {
                    gte: booking.checkInDate,
                    lt: booking.checkOutDate
                },
                user: { uid: tokenUid }
             },
            data: {
                availability: { increment: 1 },
            },
        })
    } catch (e) {
        return NextResponse.json({ error: "Some error occured, please contact us via ..." }, { status: 500 });
    }
    
    return NextResponse.json({
        message: "Profile update succeed",
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}