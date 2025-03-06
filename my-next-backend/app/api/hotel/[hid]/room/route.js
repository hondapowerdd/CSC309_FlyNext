import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

const _retrieveHotel = async (hid, uid) => {
    try {
        hotel = await database.Hotel.findUnique({ where: { hid } });
    } catch (e) {
        return {error: "Database issue", status: 500};
    }
    
    if (!hotel) return { error: "Hotel DNE", status: 404 };

    if (uid !== hotel.owner.uid) return { error: "Invalid credential", status: 400 };

    return hotel;
}

export async function GET(request, { params }) {
    // get bookings

    const { uid, tokenType } = resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const {startDate, endDate} = request.json()["range"];

    const { hid } = await params;

    const { hotel, error, status } = _retrieveHotel(hid, uid);

    if (error) return NextResponse.json({ error: error }, { status: status });

    // Filter bookings
    let rooms = hotel.rooms
    for (let room of rooms) {
        room["rangedAvailability"] = room["bookings"].reduce(
            (acc, cur) => acc - ((cur["checkInDate"] <= endDate && cur["checkOutDate"] >= startDate)? 1:0),
            room[availability]
        );
    }

    
    return NextResponse.json({rooms: rooms, tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}

export async function POST(request, { params }) {
    // Define a room type

    const { uid, tokenType } = resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const { roomType } = await request.json();
    const { name, amenities, pricePerNight, availability } = roomType;
    if (!name || !pricePerNight) return NextResponse.json({error: "Invalid room information"}, { status: 400 });

    const { hid } = await params;

    const { hotel, error, status } = _retrieveHotel(hid, uid);

    if (error) return NextResponse.json({ error: error }, { status: status });

    try {
        await database.Room.create({
            data: {
                name: name,
                amenities: amenities,
                pricePerNight: pricePerNight,
                availability: availability? availability:0,
                hotelId: hotel.id
            }
        });
    }
    catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
    }

    return NextResponse.json({message: "Room created", tokenUpdates: tokenType==="refresh"? updateTokens(uid):null});
}

export async function Patch(request, { params }) {
    // Modify room availability

    const { uid, tokenType } = resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const update = await request.json()["availabilityUpdate"];
    const roomType = update["roomType"];
    const availability = parseInt(update["availability"]);

    if (!roomType || !availability) return NextResponse.json({error: "Invalid availability update"}, { status: 400 });

    const { hid } = await params;

    const { hotel, error, status } = _retrieveHotel(hid, uid);

    if (error) return NextResponse.json({ error: error }, { status: status });
    
    let oldAvailability;
    try {
        oldAvailability = await database.Room.findUnique({ where: { name: roomType, hotelId: hotel.id } })["availability"];
        await database.Room.update({
            where: {
                name: roomType,
                hotelId: hotel.id
            },
            data: { availability: availability }
        });
    }
    catch (e) {
        return NextResponse.json({ error: "Database issue" }, { status: 500 });
    }

    return NextResponse.json({
        message: "Availability updated",
        potentialConflict: oldAvailability > availability,
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}