// As a visitor, I want to search for hotels by check-in date, check-out
// date, and city. I also want to filter them by name, star-rating, and price
// range. Search results should display in a list that shows the hotel
// information, starting price, and a location pinpoint on a map. The results
// should only reflect available rooms.

import {PrismaClient} from "@prisma/client";
import {NextResponse} from "next/server";

const prisma = new PrismaClient();

export async function GET(req, res) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city");
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");
        const name = searchParams.get("name");
        const starRating = searchParams.get("starRating");
        const maxPrice = searchParams.get("maxPrice");
        const minPrice = searchParams.get("minPrice");

        if (!city || !checkIn || !checkOut) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const minPriceValue = minPrice ? parseFloat(minPrice) : undefined;
        const maxPriceValue = maxPrice ? parseFloat(maxPrice) : undefined;
        const starRatingValue = starRating ? parseInt(starRating) : undefined;

        const hotels = await prisma.hotel.findMany({
            where: {
                city,
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                starRating: starRatingValue ? starRatingValue : undefined,
            },
            include: {
                rooms: {
                    where: {
                        pricePerNight: {
                            gte: minPriceValue,
                            lte: maxPriceValue,
                        },
                        NOT: {
                            bookings: {
                                some: {
                                    OR: [
                                        { checkInDate: { lt: new Date(checkOut), gte: new Date(checkIn) } },
                                        { checkOutDate: { gt: new Date(checkIn), lte: new Date(checkOut) } }
                                    ]
                                }
                            }
                        }
                    },
                    orderBy: { pricePerNight: "asc" },
                }
            }
        });

        return NextResponse.json(hotels.map((hotel) => ({
            id: hotel.id,
            name: hotel.name,
            starRating: hotel.starRating,
            city: hotel.city,
            address: hotel.address,
            startingPrice: hotel.rooms[0]?.pricePerNight || 0,
        })));

    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



// curl "http://localhost:3000/api/hotel_search/search?city=Toronto&checkIn=2025-03-10&checkOut=2025-03-15"
