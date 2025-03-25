import database from "@/db/database";
import { NextResponse } from "next/server";
import { verifyEncrypted } from "@/auth/encryption";
import { generateTokenPack } from "@/auth/token";

export async function POST(request, { params }) {
    // User Login
    const { uid } = await params;
    const { password } = await request.json();

    let user;

    try { // Find user
        user = await database.User.findUnique({ where: { uid } });
    } catch (e) {
        return NextResponse.json({error: "Database issue"}, { status: 500 });
    }
    
    if (!user || !verifyEncrypted(password, user.password)) { // Verrify password
        return NextResponse.json(
            { error: "Invalid id or password" },
            { status: 401 },
        );
    }
    
    return NextResponse.json({ tokens: generateTokenPack({ uid: uid }) });
}
