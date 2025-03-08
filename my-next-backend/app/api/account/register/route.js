import { NextResponse } from "next/server";
import { encrypt } from "@/auth/encryption";
import database from "@/db/database";
import { generateTokenPack } from "@/auth/token"
import { nanoid } from 'nanoid';


export async function POST(request) {
    // User Registration
  
    const registration = (await request.json())["registration"];
    if (!registration) return NextResponse.json({ error: 'Invalid registration information' }, { status: 400 });
    const { email, password, firstName, lastName, phoneNumber } = registration;

    let user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        password: password
    }

    // Ignore illegal entries
    Object.entries(user).forEach((k, v) => (!v || typeof v !== "string")  && delete user[k]);

    if (!user["email"] || !user["password"]) return NextResponse.json({ error: 'Invalid registration information' }, { status: 400 });
    
    const uid = nanoid(10); // Unique uid, also for homepage url

    try { // Create user
        await database.User.create({ data: {
            ...user,
            uid,
            password: encrypt(password)
        } });
    } catch (e) {
        return NextResponse.json({ error: 'Database Issue' }, { status: 400 });
    }

    return NextResponse.json({
        uid: uid,
        tokens: generateTokenPack({ uid: uid })
    });
  }