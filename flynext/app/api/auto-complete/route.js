//As a visitor, I want to have an auto-complete dropdown to suggest
// cities and airports as I type in the source or destination field.

import axios from "axios";

export const GET = async (req) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
        return new Response(JSON.stringify({ error: "Missing query parameter" }), { status: 400 });
    }

    try {
        const citiesResponse = await axios.get("https://advanced-flights-system.replit.app/api/cities", {
            headers: { "x-api-key": process.env.AFS_API_KEY }
        });

        const airportsResponse = await axios.get("https://advanced-flights-system.replit.app/api/airports", {
            headers: { "x-api-key": process.env.AFS_API_KEY }
        });

        const sanitizedQuery = query.trim().toLowerCase();

        // filter for cities
        const filteredCities = citiesResponse.data.filter(city =>
            city.city.toLowerCase().includes(sanitizedQuery)
        ).map(city => ({
            type: "city",
            name: city.city,
            country: city.country
        }));
        //airports
        const filteredAirports = airportsResponse.data.filter(airport =>
            airport.name.toLowerCase().includes(sanitizedQuery) ||
            airport.city.toLowerCase().includes(sanitizedQuery) ||
            airport.code.toLowerCase().includes(sanitizedQuery)
        ).map(airport => ({
            type: "airport",
            name: airport.name,
            code: airport.code,
            city: airport.city,
            country: airport.country
        }));

        
        const results = [...filteredCities, ...filteredAirports];

        return new Response(JSON.stringify({ results }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch suggestions", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
