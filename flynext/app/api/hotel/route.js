import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";
import { saveFilePublic } from "@/utils/io";
import { join } from "path";
import { nanoid } from 'nanoid';

export async function POST(request) {
    // Add hotel

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    let user;

    try {
        user = await database.User.findUnique({ where: { uid } });
    } catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
    }
    
    if (!user || user.uid !== uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const form = await request.formData();

    const hid = nanoid(10);

    // Save the logo
    const logo = form.get("logo");
    let logoName = undefined;
    if (logo && logo.type && logo.type.startsWith('image/')) {
        try {
            logoName = await saveFilePublic(join('hotels', hid, 'logo'), logo);
        } catch (e) {
            return NextResponse.json({ error: "Could not save the logo" }, { status: 400 });
        }
    }

    // Create the hotel
    const hotel = {
        name: form.get("name"),
        logo: logoName,
        address: form.get("address"),
        city: form.get("city"),
        starRating: parseInt(form.get("starRating")),
        hid: hid,
        ownerId: user.id
    }
    Object.entries(hotel).forEach(([k, v]) => (!v || typeof v !== "string") && delete user[k]);

    let hotelId;
    try {
        await database.User.update(
            {
                where: { uid },
                data: { role: "HOTEL_OWNER" }
            }
        );
        hotelId = (await database.Hotel.create({ data: hotel }))["id"];
    } catch (e) {
        return NextResponse.json({ error: "Hotel creation failed" }, { status: 400 });
    }

    // Save hotel images
    const hotelImgs = form.getAll("hotelImg").slice(0, 9);
    let imgSaveFailed = false
    try {
        const hotelImgNames = [];
        for (const [i, hotelImg] of hotelImgs.entries()) {
            if (hotelImg && hotelImg.type && hotelImg.type.startsWith('image/')) {
                hotelImgNames.push(saveFilePublic(join("hotels", hid, "hotelImgs"), hotelImg, ("_" + i.toString())));
            }
        }

        for (let hotelImgName of (await Promise.all(hotelImgNames))) {
            await database.HotelImage.create({ data: {
                hotelId: hotelId,
                imageUrl: hotelImgName
            } });
        }
    } catch (e) { imgSaveFailed = true; }
    
    return NextResponse.json({
        message: "Hotel created",
        imgSaveFailed: imgSaveFailed,
        hid: hid,
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}