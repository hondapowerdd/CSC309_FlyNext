import database from "@/db/database";
import { NextResponse } from "next/server";
import { verify, updateTokens } from "@/auth/token";

export async function POST(request) {
    // Add hotel

    const {accessToken, refreshToken} = verify(request);

    if (!accessToken && !refreshToken) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const uid = accessToken? accessToken["uid"]:refreshToken["uid"];

    let user;

    try {
        user = await database.User.findUnique({ where: { uid } });
    } catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
    }
    
    if (!user || !verifyEncrypted(password, user.password)) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const { hotel } = await request.json();
    Object.entries(hotel).forEach((k, v) => (!v || typeof v !== "string")  && delete user[k]);
    const { name, logo, address, city, starRating } = hotel;

    try {
        await database.Hotel.create({ data: { name, logo, address, city, starRating } });
    } catch (e) {
        return NextResponse.json({error: 'Invalid hotel information'}, { status: 400 });
    }
    
    return NextResponse.json({message: "Hotel created", tokenUpdates: updateTokens(refreshToken)});
}
