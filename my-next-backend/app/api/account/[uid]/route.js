import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";
import { saveFilePublic } from "@/utils/io";
import { join } from "path";

export async function PATCH(request, { params }) {
    // Profile update

    const resolvedToken = await resolveTokens(request);
    const tokenType = resolvedToken["tokenType"];
    const tokenUid = resolvedToken["uid"];

    const { uid } = await params;

    if (tokenUid !== uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    // Use form data since we have images.
    const form = await request.formData();

    const profilePic = form.get("profilePic");
    let profilePicName = undefined;
    if (profilePic && profilePic.type && profilePic.type.startsWith('image/')) {
        try {
            profilePicName = await saveFilePublic(join('profiles', uid, 'profileImgs'), profilePic);
        } catch (e) {
            return NextResponse.json({ error: "Could not save the profile img" }, { status: 400 });
        }
    }
    
    const user = {
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phoneNumber: form.get("phoneNumber"),
        profilePic: profilePicName
    }

    // Ignore illegal entries
    Object.entries(user).forEach(([k, v]) => (!v || typeof v !== "string")  && delete user[k]);

    try { // Update profile
        await database.User.update({
            where: { uid: uid },
            data: user,
        })
    } catch (e) {
        return NextResponse.json({ error: "Invalid profile update info" }, { status: 400 });
    }
    
    return NextResponse.json({
        message: "Profile update succeed",
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}