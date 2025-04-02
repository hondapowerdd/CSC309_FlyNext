"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

export default function HotelDetailPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const checkInDate = searchParams.get("checkInDate") || "";
    const checkOutDate = searchParams.get("checkOutDate") || "";
    const hotelId = params.id;

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotelData = async () => {
            try {
                const infoRes = await fetch(
                    `api/hotel_search/information?hotelId=${hotelId}`
                );
                const hotelData = await infoRes.json();
                setHotel(hotelData);

                const availabilityRes = await fetch(
                    `api/hotel_search/availability?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
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
                        <div key={room.id} className="border rounded p-4 shadow-sm bg-white">
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
        </div>
    );
}
