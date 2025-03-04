import axios from "axios";

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate");
    const flightId = searchParams.get("id");

    //check three necessary info
    if (!origin || !destination || !date) {
        return new Response(JSON.stringify({ error: "Missing required query parameters" }), { status: 400 });
    }

    try {
        //find outbound
        const outboundResponse = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
            params: { origin, destination, date },
            headers: {
                "x-api-key": process.env.AFS_API_KEY
            }
        });

        let outboundFlights = outboundResponse.data.results;
        let returnFlights = [];

        //if there is returnDate(round-trip flights)
        if (returnDate) {
            const returnResponse = await axios.get("https://advanced-flights-system.replit.app/api/flights", {
                params: { origin: destination, destination: origin, date: returnDate },
                headers: {
                    "x-api-key": process.env.AFS_API_KEY
                }
            });

            returnFlights = returnResponse.data.results;
        }

        //If ask for detail. ***Quest2***
        if (flightId) {
            const findFlight = (flights) =>
                flights.flatMap(flightGroup => flightGroup.flights || []).find(f => f.id === flightId);

            const foundOutboundFlight = findFlight(outboundFlights);
            const foundReturnFlight = findFlight(returnFlights);

            const foundFlight = foundOutboundFlight || foundReturnFlight;

            if (foundFlight) {
                // find layovers
                const parentFlightGroup = [...outboundFlights, ...returnFlights].find(group =>
                    group.flights.some(f => f.id === flightId)
                );
                const layovers = parentFlightGroup ? parentFlightGroup.flights.length - 1 : 0;

                return new Response(JSON.stringify({
                    departureTime: foundFlight.departureTime,
                    arrivalTime: foundFlight.arrivalTime,
                    duration: foundFlight.duration,
                    layovers: layovers
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify({ error: "Flight not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({
            outboundFlights,
            returnFlights: returnDate ? returnFlights : undefined
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch flights", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
