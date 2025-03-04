import database from "@/db/database";
import { NextResponse } from "next/server";
import { verify } from "@/auth/token";

export async function PATCH(request, { params }) {
    // Profile update

    const { id } = await params;

    const {accessToken, refreshToken} = verify(request);

    if (!accessToken && !refreshToken) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const userId = accessToken? accessToken["id"]:refreshToken["id"];

    if (userId !== id) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const {firstName, lastName, email, phoneNumber} = params;
    const user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber
    }

    try {
        await database.User.update({
            where: { id: id },
            data: Object.keys(user).forEach(i => (!user[i] || typeof user[i] !== "string")  && delete user[i]),
          })
    } catch (e) {
        return NextResponse.json({error: "Incorrect profile information"}, { status: 400 });
    }
    
    return NextResponse.json({message: "Profile update succeed", tokenUpdates: refreshToken? generateTokenPack({id: id}):null});
}