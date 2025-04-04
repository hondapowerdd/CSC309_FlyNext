import axios from "axios";

// Helper to check time format validity
const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
};

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);

    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate");
    const flightId = searchParams.get("id");

    const isDetailRequest = !!flightId;

    if (!isDetailRequest) {
        if (!origin || !destination || !date) {
            return new Response(JSON.stringify({
                error: "Missing origin/destination/date parameters"
            }), { status: 400 });
        }

        if (typeof origin !== 'string' || typeof destination !== 'string' || typeof date !== 'string') {
            return new Response(JSON.stringify({ error: "Invalid parameter type: origin, destination, and date must be strings" }), { status: 400 });
        }

        if (!isValidDate(date)) {
            return new Response(JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD with valid values" }), { status: 400 });
        }

        if (returnDate) {
            if (typeof returnDate !== 'string' || !isValidDate(returnDate)) {
                return new Response(JSON.stringify({ error: "Invalid returnDate format. Use YYYY-MM-DD" }), { status: 400 });
            }

            const departureDate = new Date(date);
            const returnDateObj = new Date(returnDate);
            if (returnDateObj <= departureDate) {
                return new Response(JSON.stringify({ error: "Return date must be after departure date" }), { status: 400 });
            }
        }
    }

    try {
        const headers = { "x-api-key": process.env.AFS_API_KEY };

        const safeDate = date || "2025-01-01";
        const safeReturnDate = returnDate || "2025-01-02";

        const outboundRes = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
            params: { origin, destination, date: safeDate },
            headers,
        });

        const outboundFlights = outboundRes.data.results || [];

        let returnFlights = [];

        if (returnDate || isDetailRequest) {
            const returnRes = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
                params: { origin: destination, destination: origin, date: safeReturnDate },
                headers,
            });

            returnFlights = returnRes.data.results || [];
        }

        if (isDetailRequest) {
            const allGroups = [...outboundFlights, ...returnFlights];

            const matchingGroup = allGroups.find(group =>
                group.flights.some(flight => flight.id === flightId)
            );

            if (matchingGroup) {
                const flights = matchingGroup.flights;
                const departureTime = flights[0].departureTime;
                const arrivalTime = flights[flights.length - 1].arrivalTime;
                const duration = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
                const layovers = flights.length - 1;

                return new Response(JSON.stringify({
                    departureTime,
                    arrivalTime,
                    duration,
                    layovers,
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify({ error: "Flight not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({
            outboundFlights,
            returnFlights: returnDate ? returnFlights : undefined,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Failed to fetch flights",
            details: error.message,
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
