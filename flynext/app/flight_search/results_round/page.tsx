"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import FlightResultList from "APP/components/flights/FlightResultList";

export default function FlightResultsRoundPage() {
    const searchParams = useSearchParams();

    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";
    const returnDate = searchParams.get("returnDate") || "";

    const [results, setResults] = useState({ outboundFlights: [], returnFlights: [] });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlights = async () => {
            if (!origin || !destination || !date || !returnDate) {
                setError("Missing required search parameters.");
                setLoading(false);
                return;
            }

            try {
                const query = `/api/flights_search/flights?origin=${origin}&destination=${destination}&date=${date}&returnDate=${returnDate}`;
                const res = await axios.get(query);

                setResults(res.data);

                if (
                    res.data.outboundFlights?.length === 0 &&
                    (!res.data.returnFlights || res.data.returnFlights.length === 0)
                ) {
                    setError("No flights found. Try different dates.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load flight results.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [origin, destination, date, returnDate]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Round Trip Search Results</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {!loading && !error && (
                <FlightResultList
                    outboundFlights={results.outboundFlights || []}
                    returnFlights={results.returnFlights || []}
                    origin={origin}
                    destination={destination}
                    date={date}
                />
            )}
        </div>
    );
}
