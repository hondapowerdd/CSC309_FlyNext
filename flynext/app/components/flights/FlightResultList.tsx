"use client";

import { useState } from "react";
import axios from "axios";

interface Flight {
    id: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    price: number;
    currency: string;
    airline: {
        code: string;
        name: string;
    };
    origin: {
        code: string;
        name: string;
        city: string;
        country: string;
    };
    destination: {
        code: string;
        name: string;
        city: string;
        country: string;
    };
}

interface FlightGroup {
    flights: Flight[];
}

interface FlightResultListProps {
    outboundFlights: FlightGroup[];
    returnFlights: FlightGroup[];
    origin: string;
    destination: string;
    date: string;
}

export default function FlightResultList({
    outboundFlights,
    returnFlights,
    origin,
    destination,
    date,
}: FlightResultListProps) {
    const [details, setDetails] = useState<{ [id: string]: any }>({});

    const fetchDetails = async (flightId: string) => {
        if (!details[flightId]) {
            try {
                const res = await axios.get(
                    `/api/flights_search/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&id=${flightId}`
                );
                setDetails((prev) => ({ ...prev, [flightId]: res.data }));
            } catch (err) {
                console.error("Failed to load flight detail", err);
            }
        }
    };

    const renderFlights = (flightsData: FlightGroup[], label: string) => (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{label}</h2>
            {flightsData.map((group, index) => (
                <div key={index} className="border p-4 rounded mb-4 shadow">
                    {group.flights.map((flight) => (
                        <div key={flight.id} className="mb-4 border-b pb-4">
                            <div className="font-bold mb-1">
                                {flight.flightNumber} - {flight.airline.name}
                            </div>
                            <div>From: {flight.origin.name} ({flight.origin.code}), {flight.origin.city}, {flight.origin.country}</div>
                            <div>To: {flight.destination.name} ({flight.destination.code}), {flight.destination.city}, {flight.destination.country}</div>
                            <div>Departure: {new Date(flight.departureTime).toLocaleString()}</div>
                            <div>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</div>
                            <div>Duration: {Math.floor(flight.duration / 60)}h {flight.duration % 60}m</div>
                            <div>Price: {flight.price} {flight.currency}</div>
                            <button
                                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => fetchDetails(flight.id)}
                            >
                                Detail
                            </button>

                            {details[flight.id] && (
                                <div className="mt-2 ml-4 p-2 border rounded bg-gray-100">
                                    <div><strong>Departure Time:</strong> {new Date(details[flight.id].departureTime).toLocaleString()}</div>
                                    <div><strong>Arrival Time:</strong> {new Date(details[flight.id].arrivalTime).toLocaleString()}</div>
                                    <div><strong>Duration:</strong> {Math.floor(details[flight.id].duration / 60)}h {details[flight.id].duration % 60}m</div>
                                    <div><strong>Layovers:</strong> {details[flight.id].layovers}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div>
            {outboundFlights.length === 0 && returnFlights.length === 0 ? (
                <p>No flights found.</p>
            ) : (
                <>
                    {outboundFlights.length > 0 && renderFlights(outboundFlights, "Outbound Flights")}
                    {returnFlights.length > 0 && renderFlights(returnFlights, "Return Flights")}
                </>
            )}
        </div>
    );
}
