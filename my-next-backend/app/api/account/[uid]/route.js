import database from "@/db/database";
import { NextResponse } from "next/server";
import { verify, updateTokens } from "@/auth/token";

export async function PATCH(request, { params }) {
    // Profile update

    const { uid } = await params;

    const {accessToken, refreshToken} = verify(request);

    if (!accessToken && !refreshToken) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    const userId = accessToken? accessToken["uid"]:refreshToken["uid"];

    if (userId !== uid) {
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
    Object.entries(user).forEach((k, v) => (!v || typeof v !== "string")  && delete user[k]);

    try {
        await database.User.update({
            where: { uid: uid },
            data: user,
        })
    } catch (e) {
        return NextResponse.json({error: "Incorrect profile information"}, { status: 400 });
    }
    
    return NextResponse.json({message: "Profile update succeed", tokenUpdates: updateTokens(refreshToken)});
}