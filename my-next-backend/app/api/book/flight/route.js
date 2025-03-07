import axios from "axios";

export const POST = async (req) => {
    try {
        const { firstName, lastName, email, passportNumber, flightIds } = await req.json();

        if (!firstName || !lastName || !email || !passportNumber || !flightIds) {
            return new Response(JSON.stringify({ error: "Missing required flight booking information" }), { status: 400 });
        }

        const apiUrl = "https://advanced-flights-system.replit.app/api/bookings";
        const bookingData = {
            firstName,
            lastName,
            email,
            passportNumber,
            flightIds
        };

        try {
            const response = await axios.post(apiUrl, bookingData, {
                headers: {
                    "x-api-key": process.env.AFS_API_KEY,
                    "Content-Type": "application/json",
                },
            });

            return new Response(JSON.stringify({
                message: "Flight booking successful",
                flightBooking: response.data
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });

        } catch (afsError) {
            // Problem with AFS
            console.error("AFS API error:", afsError.response?.data || afsError.message);

            return new Response(JSON.stringify({
                error: "AFS flight booking failed",
                details: afsError.response?.data || afsError.message
            }), {
                status: afsError.response?.status || 500,
                headers: { "Content-Type": "application/json" },
            });
        }

    } catch (error) {
        // problem outside AFS (code)
        console.error("Internal server error:", error);
        return new Response(JSON.stringify({ error: "Failed to process flight booking", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};