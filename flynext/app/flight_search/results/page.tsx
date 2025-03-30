"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import FlightResultList from "APP/components/flights/FlightResultList";

export default function FlightSearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const date = searchParams.get("date") || "";
    const returnDate = searchParams.get("returnDate") || "";

    const [results, setResults] = useState({ outboundFlights: [], returnFlights: [] });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [noFlights, setNoFlights] = useState(false);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const query = `/api/flights_search/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}` +
                    (returnDate ? `&returnDate=${returnDate}` : "");
                const res = await axios.get(query);
                const data = res.data;
                if ((data.outboundFlights?.length === 0) && (!returnDate || data.returnFlights?.length === 0)) {
                    setNoFlights(true);
                    setTimeout(() => {
                        router.push("/flight_search");
                    }, 3000);
                } else {
                    setResults(data);
                }
            } catch (err) {
                setError("Failed to load flight data.");
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
            {error && <p className="text-red-500">{error}</p>}
            {noFlights && (
                <p className="text-red-500 text-sm">! There is no flight available for your selected date. Please select another date.</p>
            )}
            {!loading && !error && !noFlights && (
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
