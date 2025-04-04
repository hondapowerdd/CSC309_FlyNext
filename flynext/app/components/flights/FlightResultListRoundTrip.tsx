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
    returnDate?: string;
}

export default function FlightResultList({
    outboundFlights,
    returnFlights,
    origin,
    destination,
    date,
    returnDate,
}: Props) {
    const [details, setDetails] = useState<{ [key: string]: any }>({});
    const [selectedOutbound, setSelectedOutbound] = useState<FlightGroup | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<FlightGroup | null>(null);
    const [selectedOutboundKey, setSelectedOutboundKey] = useState<string | null>(null);
    const [selectedReturnKey, setSelectedReturnKey] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState<string | null>(null);

    const { uid } = useContext(AuthContext);
    const { setShowLogin } = useShowLogin();

    const fetchDetails = async (
        flightId: string,
        flightDate: string,
        type: "outbound" | "return"
    ) => {
        const o = type === "return" ? destination : origin;
        const d = type === "return" ? origin : destination;

        const url = `/api/flights_search/flights?origin=${o}&destination=${d}&date=${flightDate}&id=${flightId}`;
        console.log("[DETAIL FETCH]", url);

        try {
            const res = await axios.get(url);
            setDetails((prev) => ({ ...prev, [flightId]: res.data }));
        } catch (err) {
            console.error("Failed to fetch details:", err);
        }
    };

    const renderFlightGroup = (
        group: FlightGroup,
        index: number,
        type: "outbound" | "return"
    ) => {
        const first = group.flights[0];
        const flightId = first.id;
        const info = details[flightId];
        const flightGroupKey = JSON.stringify(group.flights.map(f => f.id));

        const isSelected =
            (type === "outbound" && selectedOutboundKey === flightGroupKey) ||
            (type === "return" && selectedReturnKey === flightGroupKey);

        return (
            <div
                key={index}
                className={`border rounded p-4 mb-4 shadow relative ${isSelected ? "ring-2 ring-blue-500" : ""
                    }`}
            >
                {group.flights.map((flight) => (
                    <div key={flight.id} className="mb-2">
                        <div className="font-semibold">
                            {flight.flightNumber} - {flight.airline.name}
                        </div>
                        <div>
                            {flight.origin.city} ({flight.origin.code}) →{" "}
                            {flight.destination.city} ({flight.destination.code})
                        </div>
                        <div>
                            Departure: {new Date(flight.departureTime).toLocaleString()}
                        </div>
                        <div>
                            Arrival: {new Date(flight.arrivalTime).toLocaleString()}
                        </div>
                        <div>
                            Price: {flight.price} {flight.currency}
                        </div>
                        <div className="text-xs text-gray-500">
                            Flight ID: {flight.id}
                        </div>
                    </div>
                ))}

                <div className="text-right flex gap-4 justify-end">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() =>
                            fetchDetails(
                                flightId,
                                type === "return" ? returnDate! : date,
                                type
                            )
                        }
                    >
                        Detail
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${isSelected
                            ? "bg-blue-700 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        onClick={() => {
                            if (!uid) {
                                setShowLoginPrompt(flightId);
                                return;
                            }

                            if (type === "outbound") {
                                setSelectedOutbound(group);
                                setSelectedOutboundKey(flightGroupKey);
                            } else {
                                setSelectedReturn(group);
                                setSelectedReturnKey(flightGroupKey);
                            }
                        }}
                    >
                        {isSelected ? "Selected" : "Select"}
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
                            <strong>Duration:</strong>{" "}
                            {Math.floor(info.duration / 60)}h {info.duration % 60}m
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
                        renderFlightGroup(group, idx, "outbound")
                    )}
                </>
            )}
            {returnFlights.length > 0 && (
                <>
                    <h2 className="text-xl font-bold mt-6 mb-2">Return Flights</h2>
                    {returnFlights.map((group, idx) =>
                        renderFlightGroup(group, idx, "return")
                    )}
                </>
            )}

            {selectedOutbound && selectedReturn && (
                <div className="mt-6 border rounded p-6 bg-white shadow">
                    <h3 className="text-lg font-semibold mb-4">Ready to Book</h3>
                    <FlightBookingForm
                        flightIds={[
                            ...selectedOutbound.flights.map((f) => f.id),
                            ...selectedReturn.flights.map((f) => f.id),
                        ]}
                        arrivalTimes={[
                            ...selectedOutbound.flights.map((f) => f.arrivalTime),
                            ...selectedReturn.flights.map((f) => f.arrivalTime),
                        ]}
                        destinationCity={
                            selectedReturn.flights[selectedReturn.flights.length - 1].destination.city
                        }
                        onClose={() => {
                            setSelectedOutbound(null);
                            setSelectedReturn(null);
                            setSelectedOutboundKey(null);
                            setSelectedReturnKey(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
