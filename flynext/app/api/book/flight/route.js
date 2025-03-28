import axios from "axios";
import prisma from "@/db/database";
import { resolveTokens, updateTokens } from "@/auth/token";

export const POST = async (req) => {
    try {
        const resolvedToken = await resolveTokens(req);
        const tokenType = resolvedToken["tokenType"];
        const tokenUid = resolvedToken["uid"];

        const { firstName, lastName, email, passportNumber, flightId, itineraryId } = await req.json();

        if (!firstName || !lastName || !email || !passportNumber || !flightId || !itineraryId) {
            return new Response(JSON.stringify({ error: "Missing required flight booking information" }), { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { firstName, lastName, email }
        });


        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const apiUrl = "https://advanced-flights-system.replit.app/api/bookings";
        const bookingData = {
            firstName,
            lastName,
            email,
            passportNumber,
            flightIds: [flightId]
        };

        const response = await axios.post(apiUrl, bookingData, {
            headers: {
                "x-api-key": process.env.AFS_API_KEY,
                "Content-Type": "application/json",
            },
        });

        const bookingReference = response.data?.bookingReference;

        await prisma.booking.create({
            data: {
                userId: user.id,
                itineraryId: itineraryId,
                flightReference: bookingReference,
                status: "PENDING",
                type: "FLIGHT"
            }
        });

        return new Response(JSON.stringify({
            message: "Flight booking successful",
            flightBooking: response.data,
            tokenUpdates: tokenType === "refresh" ? updateTokens(tokenUid) : null
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Internal server error:", error);
        return new Response(JSON.stringify({ error: "Failed to process flight booking", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
