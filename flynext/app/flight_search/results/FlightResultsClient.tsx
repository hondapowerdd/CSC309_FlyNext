"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import FlightResultList from "APP/components/flights/FlightResultList";
import { useRouter } from "next/navigation";

export default function FlightResultsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";
    const returnDate = searchParams.get("returnDate") || "";

    const [results, setResults] = useState({ outboundFlights: [], returnFlights: [] });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlights = async () => {
            if (!origin || !destination || !date) {
                setError("Please perform a flight search first.");
                setLoading(false);
                return;
            }

            try {
                const query = `/api/flights_search/flights?origin=${origin}&destination=${destination}&date=${date}` +
                    (returnDate ? `&returnDate=${returnDate}` : "");
                const res = await axios.get(query);

                if (
                    res.data.outboundFlights?.length === 0 &&
                    (!res.data.returnFlights || res.data.returnFlights.length === 0)
                ) {
                    router.push(`/flight_search?error=no-flights`);
                } else {
                    setResults(res.data);
                }
            } catch (err) {
                setError("No flights found for this date. Please try another one.");
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, [origin, destination, date, returnDate, router]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Search Results</h1>
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
