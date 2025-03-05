import { NextResponse } from "next/server";
import { encrypt } from "@/auth/encryption";
import database from "@/db/database";
import { generateTokenPack } from "@/auth/token"


export async function POST(request) {
    // User Registration
  
    const { email, password, firstName, lastName, phoneNumber } = await request.json();

    let user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        password: password
    }

    Object.keys(user).forEach(i => ((!user[i] || typeof user[i] !== "string")  && delete user[i]));

    if (!user["email"] || !user["password"]) return NextResponse.json({error: 'Invalid registration information'}, { status: 400 });
    
    let uid;
    try {
        uid = (await database.User.create({ data: {...user, password: encrypt(password)} }))["uid"];
    } catch (e) {
        return NextResponse.json({error: 'Invalid registration information'}, { status: 400 });
    }

    return NextResponse.json(generateTokenPack({uid: uid}));
  }