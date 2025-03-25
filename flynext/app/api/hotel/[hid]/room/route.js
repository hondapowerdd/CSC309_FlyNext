import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

const _retrieveHotel = async (hid, uid, roomAvailability) => {
    let hotel;
    try {
        hotel = await database.Hotel.findUnique({
            where: { hid },
            include: {
                owner: true,
                rooms: (roomAvailability? { include: { roomAvailability: true } }:false)
            }
        });
    } catch (e) {
        return { error: "Database issue", status: 500 };
    }
    
    if (!hotel) return { error: "Hotel DNE", status: 404 };

    if (uid !== hotel.owner.uid) return { error: "Invalid credential", status: 400 };

    return { hotel };
}

export async function GET(request, { params }) {
    // get room availabilities

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const { hid } = await params;

    const { hotel, error, status } = await _retrieveHotel(hid, uid, true);

    if (error) return NextResponse.json({ error }, { status });

    // Filter bookings
    let rooms = hotel.rooms

    const { searchParams } = new URL(request.url);
    let startDate = new Date(searchParams.get("startDate"));
    let endDate = new Date(searchParams.get("endDate"));
    if (startDate && endDate) {
        for (let room of rooms) {
            room["rangedAvailability"] = room["roomAvailability"].reduce(
                (acc, cur) => {
                    if (
                        (cur["date"] < endDate || cur["date"] >= startDate) &&
                        cur["availability"] < acc
                    ) return cur["availability"];
                    return acc;
                },
                room["availability"]
            );
        }
    }
    
    return NextResponse.json({ rooms: rooms, tokenUpdates: tokenType==="refresh"? updateTokens(uid):null });
}

export async function POST(request, { params }) {
    // Define a room type

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const form = await request.formData();
    const room = {
        name: form.get("name"),
        type: form.get("type"),
        amenities: form.get("amenities"),
        pricePerNight: parseFloat(form.get("pricePerNight")),
        availability: parseInt(form.get("availability"))
    };
    
    if (!room.name || !room.type || !room.pricePerNight) return NextResponse.json({error: "Invalid room information"}, { status: 400 });

    const { hid } = await params;

    const { hotel, error, status } = await _retrieveHotel(hid, uid);
    if (error) return NextResponse.json({ error }, { status });

    room["hotel"] = { connect: { id: hotel.id } };

    if (error) return NextResponse.json({ error: error }, { status: status });

    let roomId;
    try {
        roomId = (await database.Room.create({
            data: room
        }))["id"];
    }
    catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // Save room images
    const roomImgs = form.getAll("roomImg").slice(0, 5);
    let imgSaveFailed = false
    try {
        const roomImgNames = [];
        for (const [i, roomImg] of roomImgs.entries()) {
            if (roomImg && roomImg.type && roomImg.type.startsWith('image/')) {
                roomImgNames.push(saveFilePublic(join("rooms", hid, "rooms", roomId, "roomImgs"), roomImg, ("_" + i.toString())));
            }
        }

        for (let roomImgName of (await Promise.all(roomImgNames))) {
            await database.roomImage.create({ data: {
                roomId: roomId,
                imageUrl: roomImgName
            } });
        }
    } catch (e) { imgSaveFailed = true; }

    return NextResponse.json({
        message: "Room created",
        imgSaveFailed: imgSaveFailed,
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}

export async function PATCH(request, { params }) {
    // Modify room availability

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const update = (await request.json())["availabilityUpdate"];
    if (!update) return NextResponse.json({ error: "Invalid availability update" }, { status: 400 });

    const room = update["room"];
    const availability = parseInt(update["availability"]);
    if (!room || typeof availability !== 'number' || isNaN(availability)) return NextResponse.json({ error: "Invalid availability update" }, { status: 400 });
    const { name, type } = room;
    if (!name || !type) return NextResponse.json({ error: "Invalid availability update" }, { status: 400 });

    const { hid } = await params;

    const { hotel, error, status } = await _retrieveHotel(hid, uid);

    if (error) return NextResponse.json({ error: error }, { status: status });
    
    try {
        const room = await database.Room.findUnique({
            where: {
                hotelId_name_type: {
                    type: type,
                    name: name,
                    hotelId: hotel.id
                }
            },
            include: {
                roomAvailability: true
            }
        });
        const { id, roomAvailability } = room;
        console.log(room);
        if (roomAvailability) for (const date of roomAvailability) if (date.availability > availability) return NextResponse.json({ error: "Need to resolve bookings" }, { status: 400 });
        await database.Room.update({
            where: { id },
            data: { availability: availability }
        });
    }
    catch (e) {
        return NextResponse.json({ error: "Database issue" }, { status: 500 });
    }

    return NextResponse.json({
        message: "Availability updated",
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}