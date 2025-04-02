// "use client";
//
// import { useEffect, useState } from "react";
//
// interface Notification {
//     id: string;
//     message: string;
//     type: string;
//     isRead: boolean;
//     createdAt: string;
//     userId: string;
// }
//
// export default function NotificationPage() {
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [loading, setLoading] = useState(true);
//
//     console.log("Rendering NotificationPage");
//
//     useEffect(() => {
//         console.log("useEffect triggered");
//
//         const fetchNotifications = async () => {
//             console.log(">>> INSIDE fetchNotifications");
//
//             try {
//                 const res = await fetch("/api/notifications?unreadOnly=false");
//                 const data = await res.json();
//                 console.log(">>> Fetched data:", data);
//                 setNotifications(data.notifications || []);
//             } catch (err) {
//                 console.error("Failed to fetch notifications:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchNotifications()
//     }, []);
//
//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
//
//             {loading ? (
//                 <p>Loading notifications...</p>
//             ) : notifications.length === 0 ? (
//                 <p className="text-gray-500">You have no notifications.</p>
//             ) : (
//                 <ul className="space-y-4">
//                     {notifications.map((n) => (
//                         <li key={n.id} className="bg-white p-4 shadow rounded">
//                             🔔 {n.message}
//                             <p className="text-sm text-gray-500 mt-1">
//                                 {new Date(n.createdAt).toLocaleString()}
//                             </p>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }






"use client";

import { useEffect, useState } from "react";

import { useContext } from "react";
import { AuthContext } from "@/frontend/contexts/auth";

interface Notification {
    id: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    userId: string;
}

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const fetchNotifications = async (unreadOnly: boolean) => {
        setLoading(true);
        try {
            console.log("showAll:", showAll);
            const res = await fetch(`/api/notifications?unreadOnly=${!showAll}`);
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(!showAll);
    }, [showAll]);

    const { accessToken } = useContext(AuthContext);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch("/api/notifications/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ notificationId }),
            });
            fetchNotifications(!showAll); // refresh notifications
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                    {showAll ? "Show Unread Only" : "Show All Notifications"}
                </button>
            </div>

            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <p className="text-gray-500">You have no notifications.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`bg-white p-4 shadow rounded ${
                                n.isRead ? "opacity-60" : ""
                            }`}
                        >
                            🔔 {n.message}
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                            </p>
                            {!n.isRead && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="mt-2 inline-block bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                                >
                                    Mark as Read
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
