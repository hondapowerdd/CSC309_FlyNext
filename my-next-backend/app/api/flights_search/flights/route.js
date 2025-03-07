//As a visitor, I want to search for flights by specifying a source,
// destination, and date(s).Source and destination could be either a
// city or an airport.I want to search for one - way or round - trip flights.

// As a visitor, I want to view flight details, including departure / arrival times,
// duration, and layovers.

import axios from "axios";

//Helper to check time is valid or not
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


    //validate require inputs
    if (!origin || !destination || !date) {
        return new Response(JSON.stringify({
            error: "Missing origin/destination/date parameters"
        }), { status: 400 });
    }

    // Validate parameters
    if (typeof origin !== 'string' || typeof destination !== 'string' || typeof date !== 'string') {
        return new Response(JSON.stringify({ error: "Invalid parameter type: origin, destination, and date must be strings" }), { status: 400 });
    }

    // Validate date format
    if (!isValidDate(date)) {
        return new Response(JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD with valid values" }), { status: 400 });
    }

    // Validate returnDate
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

    try {
        // Fetch outbound flights
        const outboundResponse = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
            params: { origin, destination, date },
            headers: { "x-api-key": process.env.AFS_API_KEY },
        });

        let outboundFlights = outboundResponse.data.results;
        let returnFlights = [];

        // If round-trip flight
        if (returnDate) {
            const returnResponse = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
                params: { origin: destination, destination: origin, date: returnDate },
                headers: { "x-api-key": process.env.AFS_API_KEY },
            });

            returnFlights = returnResponse.data.results;
        }

        // If requesting flight details
        if (flightId) {
            const findFlight = (flights) =>
                flights.flatMap(flightGroup => flightGroup.flights || []).find(f => f.id === flightId);

            const foundOutboundFlight = findFlight(outboundFlights);
            const foundReturnFlight = findFlight(returnFlights);
            const foundFlight = foundOutboundFlight || foundReturnFlight;

            if (foundFlight) {
                const parentFlightGroup = [...outboundFlights, ...returnFlights].find(group =>
                    group.flights.some(f => f.id === flightId)
                );
                const layovers = parentFlightGroup ? parentFlightGroup.flights.length - 1 : 0;

                return new Response(JSON.stringify({
                    departureTime: foundFlight.departureTime,
                    arrivalTime: foundFlight.arrivalTime,
                    duration: foundFlight.duration,
                    layovers,
                }), { status: 200, headers: { "Content-Type": "application/json" } });
            }

            return new Response(JSON.stringify({ error: "Flight not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({
            outboundFlights,
            returnFlights: returnDate ? returnFlights : undefined,
        }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch flights", details: error.message }), { status: 500 });
    }
};