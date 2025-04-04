﻿"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SuggestionItem {
    type: string;
    name: string;
    country: string;
    code?: string;
}

export default function FlightSearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
    const [returnDate, setReturnDate] = useState<Date | null>(new Date());
    const [showSuggestionsOrigin, setShowSuggestionsOrigin] = useState(false);
    const [showSuggestionsDestination, setShowSuggestionsDestination] = useState(false);
    const [suggestionsOrigin, setSuggestionsOrigin] = useState<SuggestionItem[]>([]);
    const [suggestionsDestination, setSuggestionsDestination] = useState<SuggestionItem[]>([]);
    const [isRoundTrip, setIsRoundTrip] = useState(false);

    // ⭐ 从 URL 参数读取 city 和 date
    useEffect(() => {
        const city = searchParams.get("city");
        const date = searchParams.get("date");

        if (city) setDestination(city);
        if (date) {
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) setDepartureDate(parsed);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (origin.trim()) {
                const res = await axios.get(`/api/auto-complete?query=${origin}`);
                setSuggestionsOrigin(res.data.results);
            } else {
                setSuggestionsOrigin([]);
            }
        };
        fetchSuggestions();
    }, [origin]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (destination.trim()) {
                const res = await axios.get(`/api/auto-complete?query=${destination}`);
                setSuggestionsDestination(res.data.results);
            } else {
                setSuggestionsDestination([]);
            }
        };
        fetchSuggestions();
    }, [destination]);

    const handleSearch = () => {
        if (!departureDate) return;

        const base = isRoundTrip ? "/flight_search/results_round" : "/flight_search/results";
        const query = `?origin=${origin}&destination=${destination}&date=${departureDate.toISOString().split("T")[0]}`;
        const returnQ = isRoundTrip && returnDate ? `&returnDate=${returnDate.toISOString().split("T")[0]}` : "";

        router.push(`${base}${query}${returnQ}`);
    };


    return (
        <div className="w-full bg-white p-6 rounded-md shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="From"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        onFocus={() => setShowSuggestionsOrigin(true)}
                        onBlur={() => setTimeout(() => setShowSuggestionsOrigin(false), 150)}
                    />
                    {showSuggestionsOrigin && suggestionsOrigin.length > 0 && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto rounded shadow">
                            {suggestionsOrigin.map((item: SuggestionItem, idx) => (
                                <li
                                    key={idx}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                    onClick={() => setOrigin(item.code || item.name)}
                                >
                                    {item.name} {item.code ? `(${item.code})` : ""}, {item.country}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="relative">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="To"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        onFocus={() => setShowSuggestionsDestination(true)}
                        onBlur={() => setTimeout(() => setShowSuggestionsDestination(false), 150)}
                    />
                    {showSuggestionsDestination && suggestionsDestination.length > 0 && (
                        <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto rounded shadow">
                            {suggestionsDestination.map((item: SuggestionItem, idx) => (
                                <li
                                    key={idx}
                                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                    onClick={() => setDestination(item.code || item.name)}
                                >
                                    {item.name} {item.code ? `(${item.code})` : ""}, {item.country}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex gap-2">
                    <DatePicker
                        selected={departureDate}
                        onChange={(date) => setDepartureDate(date)}
                        className="w-full p-2 border rounded"
                        placeholderText="Departure Date"
                    />
                    {isRoundTrip && (
                        <DatePicker
                            selected={returnDate}
                            onChange={(date) => setReturnDate(date)}
                            className="w-full p-2 border rounded"
                            placeholderText="Return Date"
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isRoundTrip}
                            onChange={() => setIsRoundTrip(!isRoundTrip)}
                        />
                        Round-trip
                    </label>
                </div>

                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Search Flights
                </button>
            </div>
        </div>
    );
}
