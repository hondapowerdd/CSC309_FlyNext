// As a user, I want to see hotel suggestions for the city if I am flying to.
// I also want to see flight suggestions if I am about to book a hotel stay.
// Both suggestions must have a link to take me to the main hotel / flight
// search page with pre - filled inputs, while preserving my current, in progress order.

export const POST = async (req) => {
    try {
        // Extract required parameters from the request body
        const { city, checkIn, checkOut } = await req.json();

        // Validate required parameters
        if (!city || !checkIn || !checkOut) {
            return new Response(JSON.stringify({
                error: "Missing required fields: city, checkIn, or checkOut"
            }), { status: 400 });
        }

        // Construct the hotel search link with pre-filled inputs
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Construct the hotel search link with pre-filled inputs
        const link = `${baseUrl}/api/hotel_search/search?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}`;

        return new Response(JSON.stringify({ link }), { status: 200 });

    } catch (error) {
        console.error("Hotel suggestion error:", error);
        return new Response(JSON.stringify({
            error: "Failed to generate hotel search suggestion",
            details: error.message
        }), { status: 500 });
    }
};
