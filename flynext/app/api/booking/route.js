import axios from "axios";
import database from "@/db/database";
import { NextResponse } from "next/server";
import { resolveTokens, updateTokens } from "@/auth/token";

export async function GET(request) {
    // get bookings

    const { uid, tokenType } = await resolveTokens(request);

    if (!uid) {
        return NextResponse.json(
            { error: "Invalid credential" },
            { status: 401 },
        );
    }

    let user;

    try { // Retrieve user bookings
        user = await database.User.findUnique({
            where: { uid },
            include: {
                itineraries: {
                    include: {
                        invoices: {
                            select: {
                                amount: true
                            }
                        },
                        bookings: {
                            include: {
                                room: true,
                                hotel: true
                            }
                        }
                    }
                },
            }
        });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
    
    if (!user) return NextResponse.json(
        { error: "User DNE" },
        { status: 404 },
    );

    let afsFailed = false
    // Retrieve flight info
    for (const itinerary of user.itineraries) {
        for (const booking of itinerary.bookings) {
            if (booking.type === "FLIGHT") {
                try {
                    const flight = (await axios.get("https://advanced-flights-system.replit.app/api/flights/" + booking.flightReference, {
                        // params: {
                        //     "x-api-key": process.env.AFS_API_KEY
                        // },
                        headers: {
                            "x-api-key": process.env.AFS_API_KEY,
                            "Content-Type": "application/json"
                        }
                    })).data;
                    booking.flight = {
                        price: flight.price,
                        origin: flight.origin.code,
                        destination: flight.destination.code
                    }
                    
                } catch (e) { 
                    console.log(e);
                    afsFailed = true;
                }
            }
        };
    }
    
    return NextResponse.json({
        // bookings: user.bookings,
        itineraries: user.itineraries,
        afsFailed,
        tokenUpdates: tokenType==="refresh"? updateTokens(uid):null
    });
}