"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Hotel {
    id: string;
    name: string;
    city: string;
    starRating?: number;
    price?: number;
}

export default function ManageHotelPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, cookie) => {
            const [key, ...val] = cookie.trim().split("=");
            acc[key] = val.join("=");
            return acc;
        }, {} as Record<string, string>);

        const uid = cookies["uid"];

        if (!uid) return;

        fetch(`/api/hotel_search/GetUserHotel?uid=${uid}`)
            .then((res) => res.json())
            .then((data) => {
                setHotels(data.hotels || []);
            })
            .catch((err) => {
                console.error("Failed to fetch hotels:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-blue-900">Manage Your Hotels</h1>

            {loading ? (
                <p>Loading hotels...</p>
            ) : hotels.length === 0 ? (
                <p className="text-gray-500">You don’t own any hotels yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <div
                            key={hotel.id}
                            onClick={() => router.push(`/hotel/manage_hotel/${hotel.id}`)}
                            className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition cursor-pointer"
                        >
                            <h2 className="text-lg font-semibold">{hotel.name}</h2>
                            <p className="text-sm text-gray-600 mb-1">City: {hotel.city}</p>
                            {hotel.starRating && <p className="text-sm">⭐ {hotel.starRating} Stars</p>}
                            {hotel.price && <p className="text-sm text-blue-600 font-semibold">${hotel.price} / night</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
