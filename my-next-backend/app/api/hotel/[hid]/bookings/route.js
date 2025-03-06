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

    // Validate hotel ownership
    try {
        hotel = await database.Hotel.findUnique({ where: { hid } });
    } catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
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
        let { checkInDate, checkOutDate, roomTypes } = await request.json();

        if (checkInDate) {
            try {
                checkInDate = new Date(checkInDate);
            }
            catch (e) {
                return NextResponse.json({error: "Invalid check-in date"}, { status: 400 });
            }
            
            bookings = bookings.filter(booking => booking.checkInDate >= checkInDate);
        }

        if (checkOutDate) {
            try {
                checkOutDate = new Date(checkOutDate);
            }
            catch (e) {
                return NextResponse.json({error: "Invalid check-out date"}, { status: 400 });
            }

            bookings = bookings.filter(booking => booking.checkOutDate <= checkOutDate);
        }

        if (roomTypes) {
            if (!Array.isArray(roomTypes)) return NextResponse.json({error: "Invalid roomType filter"}, { status: 400 });

            bookings.filter(booking => roomTypes.includes(booking.room.type));
        } 
    }
    
    return NextResponse.json({bookings: bookings, tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}

export async function DELETE(request, { params }) {
    // Delete some bookings

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
        hotel = await database.Hotel.findUnique({ where: { hid } });
    } catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
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
        await database.example.deleteMany({
            where: {
                id: { in: bookingIds }
            }
        });
    }
    catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
    }

    return NextResponse.json({message: "Booking(s) deleted", tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}
