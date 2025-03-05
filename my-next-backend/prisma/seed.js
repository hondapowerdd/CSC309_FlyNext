const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    let owner = await prisma.user.findFirst({ where: { email: "owner@example.com" } });

    if (!owner) {
        owner = await prisma.user.create({
            data: {
                id: "owner_1",
                firstName: "John",
                lastName: "Doe",
                email: "owner@example.com",
                password: "hashed_password",
                role: "ADMIN",
            },
        });
    }

    let customer = await prisma.user.findFirst({ where: { email: "customer@example.com" } });

    if (!customer) {
        customer = await prisma.user.create({
            data: {
                id: "customer_1",
                firstName: "Jane",
                lastName: "Smith",
                email: "customer@example.com",
                password: "hashed_password",
                role: "CUSTOMER",
            },
        });
    }

    let visitor = await prisma.user.findFirst({ where: { email: "vistor@example.com" } });

    if (!visitor) {
        visitor = await prisma.user.create({
            data: {
                id: "visitor_1",
                firstName: "Alice",
                lastName: "Johnson",
                email: "vistor@example.com",
                password: "hashed_password",
                role: "VISITOR",
            },
        });
    }

    // clear the hotel table
    await prisma.hotel.deleteMany({});

    const existingHotels = await prisma.hotel.findMany();
    if (existingHotels.length === 0) {
        await prisma.hotel.create({
            data: {
                id: "hotel_1",
                name: "Grand Hotel",
                city: "Toronto",
                starRating: 5,
                ownerId: owner.id,
            },
        });

        await prisma.hotel.create({
            data: {
                id: "hotel_2",
                name: "SB Hotel",
                city: "New York",
                starRating: 4,
                ownerId: owner.id,
            },
        });
    }

    // clear the room table
    await prisma.room.deleteMany({});

    const existingRooms = await prisma.room.findMany();
    if (existingRooms.length === 0) {
        await prisma.room.create({
            data: {
                id: "room_1",
                hotelId: "hotel_1",
                name: "Deluxe Suite",
                pricePerNight: 300,
                availability: 5,
                amenities: "Free Wi-Fi, Breakfast Included",
            },
        });

        await prisma.room.create({
            data: {
                id: "room_2",
                hotelId: "hotel_1",
                name: "Standard Room",
                pricePerNight: 150,
                availability: 0,
                amenities: "Free Wi-Fi",
            },
        });

        await prisma.room.create({
            data: {
                id: "room_3",
                hotelId: "hotel_2",
                name: "Executive Suite",
                pricePerNight: 250,
                availability: 3,
                amenities: "Free Wi-Fi, Breakfast Included",
            },
        });

        await prisma.room.create({
            data: {
                id: "room_4",
                hotelId: "hotel_2",
                name: "Standard Room",
                pricePerNight: 100,
                availability: 2,
                amenities: "Free Wi-Fi",
            },
        });
    }

    console.log("Seeding complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
