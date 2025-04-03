"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AuthContext } from "@/frontend/contexts/auth";
import axios from "axios";

interface Room {
    id: string;
    name: string;
    type: string;
    amenities: string;
    pricePerNight: number;
}

interface Hotel {
    id: string;
    name: string;
    address: string;
    city: string;
    starRating: number;
    rooms: Room[];
}

interface AvailabilityEntry {
    type: string;
    totalRooms: number;
    availabilityByDate: Record<string, number>;
}

export default function HotelDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { accessToken } = useContext(AuthContext);
    const router = useRouter();

    const hotelId = params.hid as string;
    // console.log(hotelId);
    const checkInDate = searchParams.get('checkInDate') || '';
    const checkOutDate = searchParams.get('checkOutDate') || '';

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [message, setMessage] = useState<string>("");

    const [userId, setUserId] = useState(""); //change:
    const [userLoading, setUserLoading] = useState(true);
    const [itineraries, setItineraries] = useState<{ id: string }[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState("");
    const [createItinerary, setCreateItinerary] = useState(false);

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const infoRes = await fetch(
                    `../api/hotel_search/information?hotelId=${hotelId}`
                );
                const hotelData = await infoRes.json();
                setHotel(hotelData);

                const availabilityRes = await fetch(
                    `../api/hotel_search/availability?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
                );
                const availabilityData = await availabilityRes.json();
                setAvailability(availabilityData.availabilityByRoomType || []);
            } catch (error) {
                console.error("Error fetching hotel details:", error);
            } finally {
                setLoading(false);
            }
        };


        
        fetchHotelData();
    }, [hotelId, checkInDate, checkOutDate]);

    useEffect(() => {
        const fetchUserId = async () => {
            if (!accessToken) return;

            try {
                const res = await axios.get("/api/account/get_id", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setUserId(res.data.id);

                const itinRes = await axios.get("/api/itineraries", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setItineraries(itinRes.data);
            } catch (error) {
                console.error("Error fetching user id:", error);
            } finally {
                setUserLoading(false); //change
            }
        };

        fetchUserId();
    }, [accessToken]);

    //Kenson: add to book hotel
    const handleBooking = async () => {

        //change
        if (!selectedRoom || !userId || !hotelId || !checkInDate || !checkOutDate) {
            const missingFields = [];
            if (!selectedRoom) missingFields.push("room");
            if (!userId) missingFields.push("user ID");
            if (!hotelId) missingFields.push("hotel ID");
            if (!checkInDate) missingFields.push("check-in date");
            if (!checkOutDate) missingFields.push("check-out date");

            alert(`Missing information for booking:\n- ${missingFields.join("\n- ")}`); 
            return;
        }
        let itineraryId = selectedItinerary;
        if (createItinerary) {
            try {
                const res = await axios.post("/api/itineraries", null, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                itineraryId = res.data.id;
            } catch (err: any) {
                console.error("Failed to create itinerary", err);
                setMessage("❌ Failed to create itinerary");
                return;
            }
        }
        if (!itineraryId) {
            setMessage("Itinerary is required.");
            return;
        }

        try {

            const res = await fetch("/api/book/hotel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    hotelId,
                    roomId: selectedRoom.id,
                    checkInDate,
                    checkOutDate,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Hotel booked successfully!");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setMessage(`❌ Booking failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Booking failed:", err);
            setMessage("❌ Booking failed due to server error.");
        }
    };

    if (loading) {
        return <div className="p-6 text-lg">Loading hotel details...</div>;
    }

    if (!hotel) {
        return <div className="p-6 text-red-600">Hotel not found.</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Hotel Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{hotel.name}</h1>
                <p className="text-gray-600">{hotel.address || "No address provided"}</p>
                <p className="text-sm text-gray-500">
                    ⭐ {hotel.starRating} stars — {hotel.city}
                </p>
            </div>

            {/* Rooms */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-3">Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotel.rooms.map((room) => (
                        <div
                            key={room.id}
                            className={`border rounded p-4 shadow-sm bg-white cursor-pointer hover:shadow-md transition ${selectedRoom?.id === room.id ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
                            onClick={() => setSelectedRoom(room)}
                        >
                            <h3 className="text-lg font-bold mb-1">{room.name}</h3>
                            <p className="text-sm mb-1">Type: {room.type}</p>
                            <p className="text-sm mb-1">Amenities: {room.amenities}</p>
                            <p className="text-blue-600 font-semibold">
                                ${room.pricePerNight} / night
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/*/!* Rooms *!/*/}
            {/*{hotel?.rooms && Array.isArray(hotel.rooms) && hotel.rooms.length > 0 && (*/}
            {/*    <div className="mb-10">*/}
            {/*        <h2 className="text-2xl font-semibold mb-3">Rooms</h2>*/}
            {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
            {/*            {hotel.rooms.map((room) => (*/}
            {/*                <div key={room.id} className="border rounded p-4 shadow-sm bg-white">*/}
            {/*                    <h3 className="text-lg font-bold mb-1">{room.name}</h3>*/}
            {/*                    <p className="text-sm mb-1">Type: {room.type}</p>*/}
            {/*                    <p className="text-sm mb-1">Amenities: {room.amenities}</p>*/}
            {/*                    <p className="text-blue-600 font-semibold">*/}
            {/*                        ${room.pricePerNight} / night*/}
            {/*                    </p>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}


            {/* Availability */}
            <div>
                <h2 className="text-2xl font-semibold mb-3">Room Availability</h2>
                {availability.length === 0 ? (
                    <p className="text-gray-500">No availability data found.</p>
                ) : (
                    availability.map((entry, index) => (
                        <div
                            key={index}
                            className="mb-6 p-4 border rounded shadow-sm bg-white"
                        >
                            <h3 className="text-lg font-bold mb-2">{entry.type} Rooms</h3>
                            <p className="text-sm mb-2">Total: {entry.totalRooms}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm text-gray-700">
                                {Object.entries(entry.availabilityByDate).map(
                                    ([date, count]) => (
                                        <div key={date}>
                                            {date}: <span className="font-medium">{count}</span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Itinerary Selection */} {/* change: */}
            {selectedRoom && (
                <div className="mt-6 border p-4 rounded bg-gray-50 shadow">
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

                    <button
                        onClick={handleBooking}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Book Selected Room
                    </button>
                    {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
                </div>
            )}

            

        </div>
    );
}
