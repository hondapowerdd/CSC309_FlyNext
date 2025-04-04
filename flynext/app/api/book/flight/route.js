import { resolveTokens, updateTokens } from "@/auth/token";
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

        const createdBookings = [];

        for (const flightId of flightIds) {
            const bookingData = {
                firstName,
                lastName,
                email,
                passportNumber,
                flightIds: [flightId],
            };

            try {
                const response = await axios.post("https://advanced-flights-system.replit.app/api/bookings", bookingData, {
                    headers: {
                        "x-api-key": process.env.AFS_API_KEY,
                        "Content-Type": "application/json"
                    }
                });

                const bookingReference = response.data?.bookingReference;

                if (!bookingReference) {
                    console.warn(`No booking reference returned for flight ${flightId}`);
                    continue;
                }

                const createdBooking = await prisma.booking.create({
                    data: {
                        userId: user.id,
                        itineraryId: itineraryId,
                        flightReference: flightId,
                        status: "PENDING",
                        type: "FLIGHT",
                    },
                });

                createdBookings.push(createdBooking);

            } catch (err) {
                console.error(`Failed to book flight ${flightId}:`, err);
            }
        }

        if (createdBookings.length === 0) {
            return new Response(JSON.stringify({ error: "All flight bookings failed." }), { status: 500 });
        }

        return new Response(JSON.stringify({
            message: "Flight bookings completed.",
            bookings: createdBookings,
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
