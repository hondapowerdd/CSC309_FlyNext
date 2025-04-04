"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import NewRoomForm from "app/components/hotel-management/NewRoomForm";

interface Room {
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    amenities: string;
}

export default function ManageSingleHotelPage() {
    const { hid } = useParams();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!hid) return;
        fetch(`/api/hotel/${hid}/room`)
            .then((res) => res.json())
            .then((data) => setRooms(data.rooms || []))
            .catch((err) => console.error("Failed to fetch rooms:", err))
            .finally(() => setLoading(false));
    }, [hid, showForm]); // re-fetch when modal closes

    const existingRoomTypes = rooms.map((room) => room.type);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-blue-900">Manage Hotel: {hid}</h1>

            <button
                onClick={() => setShowForm(true)}
                className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                + Add New Room
            </button>

            {loading ? (
                <p>Loading rooms...</p>
            ) : rooms.length === 0 ? (
                <p className="text-gray-500">No rooms added yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white p-4 shadow rounded">
                            <h2 className="text-lg font-semibold">{room.name}</h2>
                            <p className="text-sm text-gray-600">Type: {room.type}</p>
                            <p className="text-sm text-gray-600">Amenities: {room.amenities}</p>
                            <p className="text-blue-600 font-semibold">${room.pricePerNight} / night</p>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <NewRoomForm
                    hid={hid as string}
                    existingRoomTypes={existingRoomTypes}
                    close={() => setShowForm(false)}
                />
            )}
        </div>
    );
}
