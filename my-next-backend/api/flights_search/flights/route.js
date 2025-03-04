import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { source, destination, date, tripType } = req.query;

        // check all necessary info
        if (!source || !destination || !date) {
            return res.status(400).json({ error: "Missing required parameters: source, destination, date" });
        }

        // set up request
        const apiUrl = "https://advanced-flights-system.replit.app/api/flights";
        const params = {
            origin: source,
            destination: destination,
            date: date,
        };
        const response = await axios.get(apiUrl, {
            params: params,
            headers: {
                "x-api-key": process.env.AFS_API_KEY,
            },
        });
        const flights = response.data.results;

        // check for round-trip
        if (tripType === "round-trip") {
            const returnResponse = await axios.get(apiUrl, {
                params: {
                    origin: destination,
                    destination: source,
                    date: date,
                },
                headers: {
                    "x-api-key": process.env.AFS_API_KEY,
                },
            });

            return res.status(200).json({
                outbound: flights,
                return: returnResponse.data.results,
            });
        }

        return res.status(200).json({ flights });

    } catch (error) {
        console.error("Error fetching flights:", error);
        return res.status(500).json({ error: "Failed to fetch flights" });
    }
}
