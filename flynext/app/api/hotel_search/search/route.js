// As a visitor, I want to search for hotels by check-in date, check-out
// date, and city. I also want to filter them by name, star-rating, and price
// range. Search results should display in a list that shows the hotel
// information, starting price, and a location pinpoint on a map. The results
// should only reflect available rooms.

import { NextResponse } from "next/server";

import prisma from "@/db/database";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        // phase the search parameters
        const city = searchParams.get("city");
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");

        // search parameters are must
        if (!city || !checkInDate || !checkOutDate) {
            return NextResponse.json({ error: "city, checkInDate, and checkOutDate are required" }, { status: 400 });
        }

        // phase the filter parameters
        const name = searchParams.get("name");
        const starRating = searchParams.get("starRating");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        // check if the date is valid
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn) || isNaN(checkOut)) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        // Search hotels by city
        let hotels = await prisma.hotel.findMany({
            where: { city },
            include: { rooms: true } // Get all rooms for each hotel
        });

        // Filter hotels based on room availability
        hotels = await Promise.all(hotels.map(async (hotel) => {
            const rooms = hotel.rooms;
            if (rooms.length === 0) return null; // Skip hotels with no rooms

            // Get all bookings for this hotel that overlap with the requested dates
            const bookings = await prisma.booking.findMany({
                where: {
                    hotelId: hotel.id,
                    OR: [
                        { checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } },
                    ],
                },
                select: {
                    roomId: true,
                    checkInDate: true,
                    checkOutDate: true,
                },
            });

            // Group rooms by type
            const roomTypes = {};
            rooms.forEach(room => {
                if (!roomTypes[room.type]) {
                    roomTypes[room.type] = {
                        type: room.type,
                        totalRooms: room.availability,
                        availableRooms: room.availability
                    };
                }
            });

            // Process bookings and reduce availability
            bookings.forEach(booking => {
                const bookedRoom = rooms.find(r => r.id === booking.roomId);
                if (bookedRoom && roomTypes[bookedRoom.type]) {
                    roomTypes[bookedRoom.type].availableRooms -= 1;
                }
            });

            // If all room types are fully booked, exclude this hotel
            if (Object.values(roomTypes).every(roomType => roomType.availableRooms <= 0)){
                return null;
            }

            // Add cheapest available room price
            const availableRooms = rooms.filter(room => roomTypes[room.type].availableRooms > 0);
            const startingPrice = availableRooms.length ? Math.min(...availableRooms.map(room => room.pricePerNight)) : null;

            return {
                id: hotel.id,
                name: hotel.name,
                starRating: hotel.starRating,
                city: hotel.city,
                address: hotel.address,
                startingPrice,
            };
        }));
        hotels = hotels.filter(hotel => hotel !== null);

        // Apply the filters parameters
        hotels = hotels.filter(hotel => {
            if (name && !hotel.name.toLowerCase().includes(name.toLowerCase())) return false;
            if (starRating && hotel.starRating !== parseInt(starRating)) return false;
            if (minPrice && hotel.startingPrice < parseFloat(minPrice)) return false;
            if (maxPrice && hotel.startingPrice > parseFloat(maxPrice)) return false;
            return true;
        });

        return NextResponse.json(hotels, { status: 200 });
    } catch (error) {
        console.error("Error searching hotels:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



// ------------------------------------------------------------------------------------------
// query example
// without filter:
// curl -X GET "http://localhost:3006/api/hotel_search/search?city=New%20York&checkInDate=2025-03-10&checkOutDate=2025-03-15"
// curl -X GET "http://localhost:3006/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15"

// with filter:

// (both should give the result Grand Hotel)
// curl -X GET "http://localhost:3002/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15&name=Grand"
// curl -X GET "http://localhost:3002/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15&name=Grand%20Hotel"

// curl -X GET "http://localhost:3002/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15&starRating=5"
// curl -X GET "http://localhost:3002/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15&minPrice=100&maxPrice=250"

// mutiple filters:
// curl -X GET "http://localhost:3002/api/hotel_search/search?city=Toronto&checkInDate=2025-03-10&checkOutDate=2025-03-15&name=Grand&starRating=5&minPrice=100&maxPrice=200"
