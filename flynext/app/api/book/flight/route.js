import { resolveTokens } from "@/auth/token";
import prisma from "@/db/database";
import axios from "axios";

export const POST = async (req) => {
    try {
        const resolvedToken = await resolveTokens(req);
        const tokenType = resolvedToken["tokenType"];
        const tokenUid = resolvedToken["uid"];

        const {
            firstName,
            lastName,
            email,
            passportNumber,
            flightIds,
            itineraryId
        } = await req.json();

        if (!firstName || !lastName || !email || !passportNumber || !flightIds?.length || !itineraryId) {
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
            flightIds,
        };

        //console.log("Sending booking data to AFS:", JSON.stringify(bookingData, null, 2));

        const response = await axios.post(apiUrl, bookingData, {
            headers: {
                "x-api-key": process.env.AFS_API_KEY,
                "Content-Type": "application/json"
            }
        });

        //console.log("Response from AFS:", response.data);

        const bookingReference = response.data?.bookingReference;

        if (!bookingReference) {
            return new Response(JSON.stringify({ error: "No booking reference returned from AFS" }), { status: 500 });
        }

        const createdBooking = await prisma.booking.create({
            data: {
                userId: user.id,
                itineraryId: itineraryId,
                flightReference: bookingReference,
                status: "PENDING",
                type: "FLIGHT",
            },
        });

        //console.log("Created booking:", createdBooking);

        return new Response(JSON.stringify({
            message: "Flight booking created successfully",
            bookings: [createdBooking],
            tokenUpdates: tokenType === "refresh" ? updateTokens(tokenUid) : null,
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
