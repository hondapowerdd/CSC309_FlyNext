"use client";

import { useEffect, useState } from "react";

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

    console.log("Rendering NotificationPage");

    useEffect(() => {
        console.log("useEffect triggered");

        const fetchNotifications = async () => {
            console.log(">>> INSIDE fetchNotifications");

            try {
                const res = await fetch("/api/notifications?unreadOnly=false");
                const data = await res.json();
                console.log(">>> Fetched data:", data);
                setNotifications(data.notifications || []);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications()
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">All Notifications</h1>

            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <p className="text-gray-500">You have no notifications.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((n) => (
                        <li key={n.id} className="bg-white p-4 shadow rounded">
                            🔔 {n.message}
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
