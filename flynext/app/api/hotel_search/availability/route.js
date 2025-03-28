// As a visitor, I want to view the availability and details of
// different room types for my selected dates in a selected hotel.

import prisma from "@/db/database";

export async function GET(req, res) {
    try {
        const { searchParams } = new URL(req.url);
        const hotelId = searchParams.get("hotelId");
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");

        if (!hotelId || !checkInDate || !checkOutDate) {
            return new Response(
                JSON.stringify({ error: "hotelId, checkInDate, and checkOutDate are required" }),
                { status: 400 }
            );
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            return new Response(JSON.stringify({ error: "Invalid date format" }), { status: 400 });
        }

        // get all rooms that the current hotel has
        const rooms = await prisma.room.findMany({
            where: {
                hotelId: hotelId,
            },
            select: {
                id: true,
                name: true,
                type: true,
                pricePerNight: true,
                availability: true,
                amenities: true,
            },
        });

        if (rooms.length === 0) {
            return new Response(
                JSON.stringify({ message: "There is no room in this hotel" }),
                { status: 200 }
            );
        }

        // Group rooms by type
        const roomTypes = {};
        rooms.forEach(room => {
            if (!roomTypes[room.type]) {
                roomTypes[room.type] = {
                    type: room.type,
                    totalRooms: 0,
                    availabilityByDate: {}
                };
            }
            roomTypes[room.type].totalRooms += room.availability;
        });

        // Initialize availability per room type for each day
        const dateRange = getDateRange(checkIn, checkOut);
        dateRange.forEach(date => {
            Object.values(roomTypes).forEach(roomType => {
                roomType.availabilityByDate[date] = roomType.totalRooms;
            });
        });


        // log the rooms that are available for the selected dates
        console.log("Available rooms for the selected dates:");
        rooms.forEach((room) => {
            console.log(`Room ID: ${room.id}`);
            console.log(`Room Name: ${room.name}`);
            console.log(`Room Type: ${room.type}`);
            console.log(`Price Per Night: ${room.pricePerNight}`);
            console.log(`Availability: ${room.availability}`);
            console.log(`Amenities: ${room.amenities}`);
            console.log("----------------------------------------------------");
        });


        // Get all bookings that overlap with the requested dates
        const bookings = await prisma.booking.findMany({
            where: {
                hotelId,
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

        // log the bookings that overlap with the requested dates
        console.log("Bookings that overlap with the requested dates:");
        bookings.forEach((booking) => {
            console.log(`Room ID: ${booking.roomId}`);
            console.log(`Check In Date: ${booking.checkInDate}`);
            console.log(`Check Out Date: ${booking.checkOutDate}`);
            console.log("----------------------------------------------------");
        });


        // Process bookings and reduce availability
        bookings.forEach(booking => {
            const bookedCheckIn = new Date(booking.checkInDate);
            const bookedCheckOut = new Date(booking.checkOutDate);
            const bookedRoom = rooms.find(r => r.id === booking.roomId);

            if (bookedRoom) {
                dateRange.forEach(date => {
                    const currentDate = new Date(date);
                    if (currentDate >= bookedCheckIn && currentDate < bookedCheckOut) {
                        roomTypes[bookedRoom.type].availabilityByDate[date] -= 1;
                    }
                });
            }
        });

        // return NextResponse.json({ availabilityByRoomType: Object.values(roomTypes) }, { status: 200 });
        return new Response(JSON.stringify({ availabilityByRoomType: Object.values(roomTypes) }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

        // return new Response(JSON.stringify({ availableRooms: rooms }), {
        //     status: 200,
        //     headers: { "Content-Type": "application/json" },
        // });

    } catch (error) {
        // log the error
        console.error("Error fetching rooms:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}


// Use this function to get all the dates between the start and end date
function getDateRange(startDate, endDate) {
    let dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split("T")[0]); // Keep only the date part (YYYY-MM-DD)
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}



// ------------------------------------------------------------------------------------------
// query example:
// curl -X GET "http://localhost:3002/api/hotel_search/availability?hotelId=hotel_1&checkInDate=2025-03-10&checkOutDate=2025-03-15"