export default function NotificationPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <ul className="space-y-4">
                <li className="bg-white p-4 shadow rounded">📣 Booking confirmed for Amsterdam!</li>
                <li className="bg-white p-4 shadow rounded">🕒 Reminder: Check-in tomorrow</li>
                <li className="bg-white p-4 shadow rounded">💬 New message from your host</li>
            </ul>
        </div>
    );
}
