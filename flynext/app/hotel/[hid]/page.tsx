"use client";

import { useEffect, useState, useContext } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AuthContext } from "@/frontend/contexts/auth";
import axios from "axios";
import NewRoomForm from "APP/components/hotel-management/NewRoomForm";

interface Room {
    id: string;
    name: string;
    type: string;
    amenities: string;
    pricePerNight: number;
}

interface Hotel {
    id: string;
    hid: string
    name: string;
    address: string;
    city: string;
    starRating: number;
    rooms: Room[];
    owner: Record<string, string>
}

interface AvailabilityEntry {
    type: string;
    totalRooms: number;
    availabilityByDate: Record<string, number>;
}

interface Itinerary {
    id: string;
    // bookings: { type: string }[];
    bookings: { type: string; status: string }[];
    status: string
    invoices?: any[];
}

export default function HotelDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { uid, accessToken } = useContext(AuthContext);
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
    // const [userLoading, setUserLoading] = useState(true);
    const [itineraries, setItineraries] = useState<{ id: string; name?: string }[]>([]);
    const [selectedItinerary, setSelectedItinerary] = useState("");
    const [createItinerary, setCreateItinerary] = useState(false);

    const [showRoomForm, setShowRoomForm] = useState(false);

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const infoRes = await fetch(
                    `../api/hotel_search/information?hotelId=${hotelId}`
                );
                const hotelData = await infoRes.json();
                // console.log(hotelData);
                setHotel(hotelData);

                const availabilityRes = await fetch(
                    `/api/hotel_search/availability?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
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
        const fetchUserIdAndItineraries = async () => {
            if (!accessToken) return;

            try {
                const res = await axios.get("/api/account/get_id", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setUserId(res.data.id);

                const itinRes = await axios.get("/api/itineraries", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                const filtered = itinRes.data.filter((itin: Itinerary) =>
                    !itin.invoices && !itin.bookings.some((b) => b.type === "HOTEL" || b.status === "COMPLETED")
                );
                setItineraries(filtered);

            } catch (error) {
                console.error("Error fetching user id or itineraries:", error);
            }
        };

        fetchUserIdAndItineraries();
    }, [accessToken]);


    //Kenson: add to book hotel
    const handleBooking = async () => {
        let itineraryName = "";
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
                itineraryName = res.data.name;
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    hotelId,
                    roomId: selectedRoom.id,
                    checkInDate,
                    checkOutDate,
                    itineraryId, 
                }),
            });

            const data = await res.json();
            if (!itineraryName && itineraryId) {
                const matched = itineraries.find(i => i.id === itineraryId);
                if (matched?.name) {
                    itineraryName = matched.name;
                }
            }

            if (res.ok) {
                setMessage(`✅ Hotel booked successfully! Your itinerary is ${itineraryName || itineraryId}`);


                try {
                    const itinCheck = await axios.get(`/api/itineraries/${itineraryId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    const bookings = itinCheck.data.bookings;
                    const hasFlightBooking = bookings.some((b: any) => b.type === "FLIGHT");

                    if (!hasFlightBooking && hotel) {
                        const city = hotel.city ?? "";
                        const checkOut = new Date(checkOutDate);
                        const formattedDate = checkOut.toISOString().split("T")[0];

                        const shouldRedirect = window.confirm(
                            "Booking successful!\nWe found you have not booked a flight yet.\nDo you want to search for one now?"
                        );

                        if (shouldRedirect) {
                            localStorage.setItem("activeItineraryId", itineraryId);
                            router.push(`/flight_search?city=${encodeURIComponent(city)}&date=${formattedDate}`);
                        } else {
                            setTimeout(() => window.location.reload(), 1500);
                        }
                    } else {
                        setTimeout(() => window.location.reload(), 1500);
                    }


                } catch (err) {
                    console.error("Error checking itinerary after booking:", err);
                    setTimeout(() => window.location.reload(), 1500);
                }
            }
            else {
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
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{hotel.name}</h1>
                    <p className="text-gray-600">{hotel.address || "No address provided"}</p>
                    <p className="text-sm text-gray-500">
                        ⭐ {hotel.starRating} stars — {hotel.city}
                    </p>
                </div>
                
                {uid === hotel.owner.uid && (
                    <button
                        onClick={() => router.push(`/hotel/${hotel.hid}/bookings`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        View Bookings
                    </button>
                )}
            </div>

            {/* Rooms */}
            <div className="my-8">
                <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-2xl font-semibold mb-3">Rooms</h2>
                    {uid === hotel.owner.uid && (
                        <button
                            onClick={() => setShowRoomForm(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
                            disabled={hotel.rooms.length >= 4}
                        >
                            Add New Room
                        </button>
                    )}
                </div>
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

            {selectedRoom && (
                <div className="mb-6 border p-4 rounded bg-gray-50 shadow">
                    <label className="block font-medium mb-1">Select Itinerary</label>
                    <select className="w-full border px-3 py-2 rounded" value={selectedItinerary} onChange={(e) => setSelectedItinerary(e.target.value)} disabled={createItinerary}>
                        <option value="">-- Select an existing itinerary --</option>
                        {itineraries.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name || item.id} 
                            </option>
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
                <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-2xl font-semibold">Room Availability</h2>
                </div>
                
                {availability.length === 0 ? (
                    <p className="text-gray-500">No availability data found.</p>
                ) : (
                    availability.map((entry, index) => (
                        <div
                            key={index}
                            className="mb-6 p-4 border rounded shadow-sm bg-white"
                        >
                            <h3 className="text-lg font-bold mb-2">{entry.type} Rooms</h3>
                            
                            {/* Conditionally render input or text */}
                            <div className="text-sm mb-2 flex items-center gap-2">
                                <span className="text-gray-700">Total:</span>
                                <span className="font-medium text-blue-900">
                                    {Math.min(...Object.entries(entry.availabilityByDate)
                                        .filter(([date]) => {
                                            const d = new Date(date);
                                            return d >= new Date(checkInDate) && d < new Date(checkOutDate);
                                        })
                                        .map(([, count]) => count))}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm text-gray-700">
                                {Object.entries(entry.availabilityByDate).map(([date, count]) => (
                                <div key={date}>
                                    {date}: <span className="font-medium">{count}</span>
                                </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Itinerary Selection */} {/* change: */}
            {/* {selectedRoom && (
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
            )} */}

            {
                showRoomForm &&
                <NewRoomForm
                    hid={hotel.hid}
                    existingRoomTypes={hotel.rooms.map(room => room.type)}
                    close={() => setShowRoomForm(false)}
                />
            }

        </div>
    );
}
