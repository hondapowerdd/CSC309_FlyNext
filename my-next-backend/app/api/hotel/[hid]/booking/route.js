import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

export async function GET(request, { params }) {
    // get bookings

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const { hid } = await params;

    let hotel;

    try { // Validate hotel ownership
        hotel = await database.Hotel.findUnique({
            where: { hid },
            include: { owner: true, bookings: { include: { room: params["roomTypes"] } } }
        });
    } catch (e) {
        return NextResponse.json({ error: "Database issue" }, { status: 500 });
    }
    
    if (!hotel) return NextResponse.json(
        { error: "Hotel DNE" },
        { status: 404 },
    );

    if (uid !== hotel.owner.uid) return NextResponse.json(
        { error: "Invalid credential" },
        { status: 401 }
    );

    // Filter bookings
    let bookings = hotel.bookings
    if (bookings) {
        const { searchParams } = new URL(request.url);

        let startDate = searchParams.get("startDate");
        if (startDate) {
            try {
                startDate = new Date(startDate);
            }
            catch (e) {
                return NextResponse.json({error: "Invalid check-in date"}, { status: 400 });
            }
            
            bookings = bookings.filter(booking => booking.checkInDate >= startDate);
        }

        let endDate = searchParams.get("endDate");
        if (endDate) {
            try {
                endDate = new Date(endDate);
            }
            catch (e) {
                return NextResponse.json({error: "Invalid check-out date"}, { status: 400 });
            }

            bookings = bookings.filter(booking => booking.checkOutDate <= endDate);
        }

        let roomTypes = searchParams.get("roomTypes");
        if (roomTypes) {
            roomTypes = roomTypes.split(',');

            bookings = bookings.filter(booking => (booking.room && roomTypes.includes(booking.room.type)));
        } 
    }
    
    return NextResponse.json({bookings: bookings, tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}

export async function PATCH(request, { params }) {
    // Cancel some bookings

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const { hid } = await params;

    let hotel;

    // Validate hotel ownership
    try {
        hotel = await database.Hotel.findUnique({
            where: { hid },
            include: { owner: true }
        });
    } catch (e) {
        return NextResponse.json({ error: "Database issue" }, { status: 500 });
    }
    
    if (!hotel) return NextResponse.json(
        { error: "Hotel DNE" },
        { status: 404 },
    );

    if (uid !== hotel.owner.uid) return NextResponse.json(
        { error: "Invalid credential" },
        { status: 401 }
    );

    const { bookingIds } = await request.json();
    if (!bookingIds || !Array.isArray(bookingIds)) return NextResponse.json({error: "Invalid booking ids"}, { status: 400 });

    try {
        const bookingsToDelete = await database.Booking.findMany({
            where: {
                id: { in: bookingIds }
            }
        });
        await database.Booking.updateMany({
            where: {
                id: { in: bookingIds },
            },
            data: { status: "CANCELED" }
        });
        for (const booking of bookingsToDelete) {
            await database.RoomAvailability.updateMany({
                where: {
                    roomId: booking.roomId,
                    date: {
                        gte: booking.checkInDate,
                        lt: booking.checkOutDate
                    }
                },
                data: { availability: { increment: 1 } },
            });
        }
    }
    catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

    return NextResponse.json({message: "Booking(s) deleted", tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}
