"use client";

import FlightSearchForm from "APP/components/flights/FlightSearchForm";

export default function FlightSearchPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Search Flights</h1>
            <FlightSearchForm />
        </div>
    );
}
