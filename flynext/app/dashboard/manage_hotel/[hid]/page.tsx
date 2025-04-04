// "use client";
//
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import NewRoomForm from "app/components/hotel-management/NewRoomForm";
//
// interface Room {
//     id: string;
//     name: string;
//     type: string;
//     pricePerNight: number;
//     amenities: string;
// }
//
// export default function ManageSingleHotelPage() {
//     const { hid } = useParams();
//     const [rooms, setRooms] = useState<Room[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//
//     useEffect(() => {
//         if (!hid) return;
//         fetch(`/api/hotel/${hid}/room`)
//             .then((res) => res.json())
//             .then((data) => setRooms(data.rooms || []))
//             .catch((err) => console.error("Failed to fetch rooms:", err))
//             .finally(() => setLoading(false));
//     }, [hid, showForm]); // re-fetch when modal closes
//
//     const existingRoomTypes = rooms.map((room) => room.type);
//
//     return (
//         <div className="p-6 min-h-screen bg-gray-100">
//             <h1 className="text-2xl font-bold mb-4 text-blue-900">Manage Hotel: {hid}</h1>
//
//             <button
//                 onClick={() => setShowForm(true)}
//                 className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//                 + Add New Room
//             </button>
//
//             {loading ? (
//                 <p>Loading rooms...</p>
//             ) : rooms.length === 0 ? (
//                 <p className="text-gray-500">No rooms added yet.</p>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {rooms.map((room) => (
//                         <div key={room.id} className="bg-white p-4 shadow rounded">
//                             <h2 className="text-lg font-semibold">{room.name}</h2>
//                             <p className="text-sm text-gray-600">Type: {room.type}</p>
//                             <p className="text-sm text-gray-600">Amenities: {room.amenities}</p>
//                             <p className="text-blue-600 font-semibold">${room.pricePerNight} / night</p>
//                         </div>
//                     ))}
//                 </div>
//             )}
//
//             {showForm && (
//                 <NewRoomForm
//                     hid={hid as string}
//                     existingRoomTypes={existingRoomTypes}
//                     close={() => setShowForm(false)}
//                 />
//             )}
//         </div>
//     );
// }


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
    availability: number;
}

export default function ManageSingleHotelPage() {
    const { hid } = useParams();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [availabilityUpdates, setAvailabilityUpdates] = useState<{ [roomId: string]: number }>({});

    useEffect(() => {
        if (!hid) return;
        fetch(`/api/hotel/${hid}/room`)
            .then((res) => res.json())
            .then((data) => {
                setRooms(data.rooms || []);
                const availabilityMap: { [key: string]: number } = {};
                data.rooms?.forEach((room: Room) => {
                    availabilityMap[room.id] = room.availability;
                });
                setAvailabilityUpdates(availabilityMap);
            })
            .catch((err) => console.error("Failed to fetch rooms:", err))
            .finally(() => setLoading(false));
    }, [hid, showForm]); // re-fetch when modal closes

    const handleAvailabilityChange = (roomId: string, value: string) => {
        const intVal = parseInt(value);
        if (!isNaN(intVal)) {
            setAvailabilityUpdates((prev) => ({
                ...prev,
                [roomId]: intVal,
            }));
        }
    };

    const handleSave = async (roomId: string, name: string, type: string) => {
        const newAvailability = availabilityUpdates[roomId];

        try {
            const res = await fetch(`/api/hotel/${hid}/room`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    availabilityUpdate: {
                        room: {
                            name: name,
                            type: type,
                        },
                        availability: newAvailability,
                    },
                }),
            });

            if (!res.ok) {
                console.error("Failed to update availability");
                return;
            }

            // Optionally: update state or show success message
            setRooms((prev) =>
                prev.map((room) =>
                    room.id === roomId ? { ...room, availability: newAvailability } : room
                )
            );
        } catch (err) {
            console.error("Update failed:", err);
        }
    };


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
                        <div key={room.id} className="bg-white p-4 shadow rounded space-y-2">
                            <h2 className="text-lg font-semibold">{room.name}</h2>
                            <p className="text-sm text-gray-600">Type: {room.type}</p>
                            <p className="text-sm text-gray-600">Amenities: {room.amenities}</p>
                            <p className="text-blue-600 font-semibold">${room.pricePerNight} / night</p>

                            <div className="mt-2">
                                <label className="text-sm font-medium">Available Rooms:</label>
                                <input
                                    type="number"
                                    value={availabilityUpdates[room.id] ?? room.availability}
                                    onChange={(e) => handleAvailabilityChange(room.id, e.target.value)}
                                    className="ml-2 p-1 border rounded w-20"
                                    min={0}
                                />
                                <button
                                    onClick={() => handleSave(room.id, room.name, room.type)}
                                    className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Save
                                </button>
                            </div>
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
