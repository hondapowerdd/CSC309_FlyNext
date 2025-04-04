"use client";

import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/frontend/contexts/auth";
import { useShowLogin } from "@/frontend/contexts/showLogin";
import FlightBookingForm from "./FlightBookingForm";

interface Flight {
    id: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    price: number;
    currency: string;
    airline: { code: string; name: string };
    origin: { code: string; name: string; city: string; country: string };
    destination: { code: string; name: string; city: string; country: string };
}

interface FlightGroup {
    flights: Flight[];
}

interface Props {
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
}: Props) {
    const [details, setDetails] = useState<{ [key: string]: any }>({});
    const [activeFlightGroup, setActiveFlightGroup] = useState<{
        flightIds: string[];
        destinationCity: string;
        arrivalTimes: string[];
        groupKey: string;
    } | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState<string | null>(null);

    const { uid } = useContext(AuthContext);
    const { setShowLogin } = useShowLogin();

    const fetchDetails = async (flightId: string, isReturn = false) => {
        const o = isReturn ? destination : origin;
        const d = isReturn ? origin : destination;
        const url = `/api/flights_search/flights?origin=${o}&destination=${d}&date=${date}&id=${flightId}`;
        try {
            const res = await axios.get(url);
            setDetails((prev) => ({ ...prev, [flightId]: res.data }));
        } catch (err) {
            console.error("Failed to fetch details:", err);
        }
    };

    const handleBooking = (flights: Flight[]) => {
        if (!uid) {
            setShowLoginPrompt(flights[0].id);
            return;
        }

        const destinationCity = flights[flights.length - 1].destination.city;
        const arrivalTimes = flights.map((f) => f.arrivalTime);

        setActiveFlightGroup({
            flightIds: flights.map((f) => f.id),
            destinationCity,
            arrivalTimes,
            groupKey: flights[0].id,
        });
    };

    const renderFlightGroup = (
        group: FlightGroup,
        index: number,
        isReturn = false
    ) => {
        const first = group.flights[0];
        const last = group.flights[group.flights.length - 1];
        const totalDuration = group.flights.reduce((sum, f) => sum + f.duration, 0);
        const flightId = first.id;
        const info = details[flightId];

        return (
            <div key={index} className="border rounded p-4 mb-4 shadow relative">
                {group.flights.map((flight) => (
                    <div key={flight.id} className="mb-2">
                        <div className="font-semibold">
                            {flight.flightNumber} - {flight.airline.name}
                        </div>
                        <div>
                            {flight.origin.city} ({flight.origin.code}) →{" "}
                            {flight.destination.city} ({flight.destination.code})
                        </div>
                        <div>Departure: {new Date(flight.departureTime).toLocaleString()}</div>
                        <div>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</div>
                        <div>
                            Price: {flight.price} {flight.currency}
                        </div>
                        <div className="text-xs text-gray-500">Flight ID: {flight.id}</div>
                    </div>
                ))}

                <div className="text-right flex gap-4 justify-end">
                    <button
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => fetchDetails(flightId, isReturn)}
                    >
                        Detail
                    </button>
                    <button
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => handleBooking(group.flights)}
                    >
                        Booking
                    </button>
                </div>

                {showLoginPrompt === flightId && (
                    <div className="mt-2 text-sm text-red-600 flex items-center justify-end gap-3">
                        You must login first.
                        <button
                            className="underline text-blue-700"
                            onClick={() => setShowLogin(true)}
                        >
                            Login
                        </button>
                    </div>
                )}

                {activeFlightGroup?.groupKey === flightId && (
                    <FlightBookingForm
                        flightIds={activeFlightGroup.flightIds}
                        destinationCity={activeFlightGroup.destinationCity}
                        arrivalTimes={activeFlightGroup.arrivalTimes}
                        onClose={() => setActiveFlightGroup(null)}
                    />
                )}

                {info && (
                    <div className="mt-4 bg-gray-100 p-3 rounded">
                        <div>
                            <strong>Departure Time:</strong>{" "}
                            {new Date(info.departureTime).toLocaleString()}
                        </div>
                        <div>
                            <strong>Arrival Time:</strong>{" "}
                            {new Date(info.arrivalTime).toLocaleString()}
                        </div>
                        <div>
                            <strong>Duration:</strong> {Math.floor(info.duration / 60)}h{" "}
                            {info.duration % 60}m
                        </div>
                        <div>
                            <strong>Layovers:</strong> {info.layovers}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {outboundFlights.length > 0 && (
                <>
                    <h2 className="text-xl font-bold mb-2">Outbound Flights</h2>
                    {outboundFlights.map((group, idx) =>
                        renderFlightGroup(group, idx)
                    )}
                </>
            )}
            {returnFlights.length > 0 && (
                <>
                    <h2 className="text-xl font-bold mt-6 mb-2">Return Flights</h2>
                    {returnFlights.map((group, idx) =>
                        renderFlightGroup(group, idx, true)
                    )}
                </>
            )}
        </div>
    );
}
