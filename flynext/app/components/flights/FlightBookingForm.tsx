"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
    flightIds: string[];
    onClose: () => void;
}

// Utility to read auth tokens directly from cookies
const getAccessTokenFromCookie = (): string => {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies["accessToken"] || "";
};

export default function FlightBookingForm({ flightIds, onClose }: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [passportNumber, setPassportNumber] = useState("");
    const [itineraries, setItineraries] = useState<{ id: string }[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState("");
    const [createItinerary, setCreateItinerary] = useState(false);
    const [message, setMessage] = useState("");
    const [passportError, setPassportError] = useState("");

    useEffect(() => {
        const accessToken = getAccessTokenFromCookie();
        const fetchUserAndItineraries = async () => {
            try {
                const userRes = await axios.get("/api/user/profile", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const user = userRes.data;
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setEmail(user.email);
                setPassportNumber(user.passportNumber);

                const itinRes = await axios.get("/api/itineraries", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setItineraries(itinRes.data);
            } catch (err) {
                console.error("Failed to fetch user or itineraries", err);
            }
        };
        fetchUserAndItineraries();
    }, []);

    const handleSubmit = async () => {
        const accessToken = getAccessTokenFromCookie();

        if (passportNumber.length !== 9) {
            setPassportError("Passport has to be 9 digits");
            return;
        } else {
            setPassportError("");
        }

        let itineraryId = selectedItinerary;

        if (createItinerary) {
            try {
                const accessToken = getAccessTokenFromCookie();
                console.log("[DEBUG] accessToken before POST /api/itineraries:", accessToken); // 👈 添加日志

                const res = await axios.post("/api/itineraries", null, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                itineraryId = res.data.id;
            } catch (err) {
                setMessage("Failed to create itinerary.");
                return;
            }
        }

        if (!itineraryId) {
            setMessage("Itinerary ID is required.");
            return;
        }

        const bookingPayload = {
            firstName,
            lastName,
            email,
            passportNumber,
            flightIds,
            itineraryId,
        };

        try {
            const res = await axios.post("/api/book/flight", bookingPayload);
            console.log("Created bookings:", res.data.bookings);
            setMessage("Booking successful!");
            setTimeout(onClose, 1500);
        } catch (err) {
            console.error("Booking failed", err);
            setMessage("Booking failed.");
        }
    };

    return (
        <div className="border p-6 rounded shadow bg-white">
            <h2 className="text-lg font-semibold mb-4">Flight Booking</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="border p-2 rounded bg-gray-100" />
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="border p-2 rounded bg-gray-100" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded bg-gray-100" />
                <input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} placeholder="Passport Number" className="border p-2 rounded bg-gray-100" />
            </div>

            {passportError && (
                <p className="text-red-600 text-sm">{passportError}</p>
            )}

            <label className="block font-medium mb-1">Select Itinerary</label>
            <select className="w-full border px-3 py-2 rounded" value={selectedItinerary} onChange={(e) => setSelectedItinerary(e.target.value)} disabled={createItinerary}>
                <option value="">-- Select an existing itinerary --</option>
                {itineraries.map((item) => (
                    <option key={item.id} value={item.id}>{item.id}</option>
                ))}
            </select>

            <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={createItinerary} onChange={() => {
                    setCreateItinerary(!createItinerary);
                    if (!createItinerary) setSelectedItinerary("");
                }} />
                Create a new itinerary
            </label>

            <div className="mt-4 flex gap-3 justify-end">
                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Confirm Booking</button>
                <button onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
            </div>
            {message && <p className="mt-2 text-red-600 text-sm">{message}</p>}
        </div>
    );
}
