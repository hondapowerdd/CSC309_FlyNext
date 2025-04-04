"use client";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/frontend/contexts/auth";
import { useRouter } from "next/navigation";

interface Props {
    flightIds: string[];
    arrivalTimes: string[];
    onClose: () => void;
    destinationCity: string;
}

export default function FlightBookingForm({ flightIds, arrivalTimes, onClose, destinationCity }: Props) {
    const { accessToken } = useContext(AuthContext);
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [passportNumber, setPassportNumber] = useState("");
    const [itineraries, setItineraries] = useState<{ id: string; name?: string }[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState("");
    const [createItinerary, setCreateItinerary] = useState(false);
    const [message, setMessage] = useState("");
    const [passportError, setPassportError] = useState("");

    useEffect(() => {
        const fetchUserAndItineraries = async () => {
            try {
                const userRes = await axios.get("/api/account/profile", {
                    headers: { Authorization: `Bearer accessToken` },
                });
                const user = userRes.data;
                setFirstName(user.firstName ?? "");
                setLastName(user.lastName ?? "");
                setEmail(user.email ?? "");
                setPassportNumber(user.passportNumber ?? "");

                const itinRes = await axios.get("/api/itineraries", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const filtered = itinRes.data.filter((itin: any) =>
                    !itin.bookings.some((b: any) => b.type === "FLIGHT")
                );

                setItineraries(filtered);
            } catch (err) {
                console.error("Failed to fetch user or itineraries", err);
            }
        };

        if (accessToken) {
            fetchUserAndItineraries();
        }
    }, [accessToken]);

    const handleSubmit = async () => {
        if (passportNumber.length !== 9) {
            setPassportError("Passport has to be 9 digits");
            return;
        } else {
            setPassportError("");
        }

        let itineraryId = selectedItinerary;
        let itineraryName = "";

        if (createItinerary) {
            try {
                const res = await axios.post("/api/itineraries", null, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                itineraryId = res.data.id;
                itineraryName = res.data.name;
            } catch (err: any) {
                console.error("Failed to create itinerary", err);
                setMessage(err?.response?.data?.error || "Failed to create itinerary.");
                return;
            }
        }


        //if (!itineraryId) {
        //    setMessage("Itinerary ID is required.");
        //    return;
        //}

        if (!itineraryName && itineraryId) {
            const matched = itineraries.find(i => i.id === itineraryId);
            if (matched?.name) {
                itineraryName = matched.name;
            }
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
            const res = await axios.post("/api/book/flight", bookingPayload, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            //console.log("Created bookings:", res.data.bookings);
            const displayName = itineraryName || itineraryId;
            setMessage(`✅ Booking successful! Your itinerary is ${displayName}`);


            const itinCheck = await axios.get(`/api/itineraries/${itineraryId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const bookings = itinCheck.data.bookings;
            const hasHotelBooking = bookings.some((b: any) => b.type === "HOTEL");

            if (!hasHotelBooking) {
                const city = destinationCity ?? "";

                const checkInRaw = arrivalTimes?.[0];
                const checkIn = checkInRaw ? new Date(checkInRaw) : new Date(); 

                const formattedCheckIn = checkIn.toISOString().split("T")[0];

                const shouldRedirect = window.confirm(
                    "Booking successful!\nWe found you have not booked a hotel yet.\nDo you want to find one now?"
                );

                if (shouldRedirect) {
                    localStorage.setItem("activeItineraryId", itineraryId);
                    router.push(`/hotel?city=${encodeURIComponent(city)}&checkInDate=${formattedCheckIn}`);
                } else {
                    setTimeout(onClose, 1500);
                }
            }
 else {
                setTimeout(onClose, 1500);
            }
        } catch (err: any) {
            console.error("Booking failed", err);
            setMessage(err?.response?.data?.error || "Booking failed.");
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

            {passportError && <p className="text-red-600 text-sm">{passportError}</p>}

            <label className="block font-medium mb-1">Select Itinerary</label>
            <select className="w-full border px-3 py-2 rounded" value={selectedItinerary} onChange={(e) => setSelectedItinerary(e.target.value)} disabled={createItinerary}>
                <option value="">-- Select an existing itinerary --</option>
                {itineraries.map((item) => (
                    <option key={item.id} value={item.id}>{item.name ?? item.id}</option>
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
