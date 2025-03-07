const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // clear the room table
    await prisma.room.deleteMany({});

    // clear the hotel table
    await prisma.hotel.deleteMany({});

    // delete all existing notifications
    await prisma.notification.deleteMany({});

    // delete the bookings table
    await prisma.booking.deleteMany({});


    let owner = await prisma.user.findFirst({ where: { email: "owner@example.com" } });

    if (!owner) {
        owner = await prisma.user.create({
            data: {
                id: "owner_1",
                uid: "owner_1",
                firstName: "John",
                lastName: "Doe",
                email: "owner@example.com",
                password: "hashed_password",
                role: "ADMIN",
            },
        });
    }


    let notif = await prisma.notification.findFirst({ where: { userId: "owner_1" } });
    if (!notif) {
        notif = await prisma.notification.create({
            data: {
                id: "notif_1",
                userId: "owner_1",
                message: "New booking made for your hotel",
                isRead: false,
                type: "NEW_BOOKING",
            },
        });

        notif = await prisma.notification.create({
            data: {
                id: "notif_2",
                userId: "owner_1",
                message: "Booking cancelled by customer",
                isRead: false,
                type: "CANCELLED_BOOKING",
            },
        });
    }

    let customer = await prisma.user.findFirst({ where: { email: "customer@example.com" } });

    if (!customer) {
        customer = await prisma.user.create({
            data: {
                id: "customer_1",
                uid: "customer_1",
                firstName: "Jane",
                lastName: "Smith",
                email: "customer@example.com",
                password: "hashed_password",
                role: "CUSTOMER",
            },
        });
    }

    let notif2 = await prisma.notification.findFirst({ where: { userId: "customer_1" } });
    if (!notif2) {
        notif2 = await prisma.notification.create({
            data: {
                id: "notif_3",
                userId: "customer_1",
                message: "Booking confirmed for Grand Hotel",
                isRead: false,
                type: "CONFIRMED_BOOKING",
            },
        });

        notif2 = await prisma.notification.create({
            data: {
                id: "notif_4",
                userId: "customer_1",
                message: "Booking cancelled by hotel",
                isRead: false,
                type: "BOOKING_CANCELLED",
            },
        });
    }



    let visitor = await prisma.user.findFirst({ where: { email: "vistor@example.com" } });

    if (!visitor) {
        visitor = await prisma.user.create({
            data: {
                id: "visitor_1",
                uid: "visitor_1",
                firstName: "Alice",
                lastName: "Johnson",
                email: "vistor@example.com",
                password: "hashed_password",
                role: "VISITOR",
            },
        });
    }

    const existingHotels = await prisma.hotel.findMany();
    if (existingHotels.length === 0) {
        await prisma.hotel.create({
            data: {
                id: "hotel_1",
                hid: "hotel_1",
                name: "Grand Hotel",
                city: "Toronto",
                starRating: 5,
                ownerId: owner.id,
            },
        });

        await prisma.hotel.create({
            data: {
                id: "hotel_2",
                hid: "hotel_2",
                name: "SB Hotel",
                city: "New York",
                starRating: 4,
                ownerId: owner.id,
            },
        });
    }

    const existingRooms = await prisma.room.findMany();
    if (existingRooms.length === 0) {
        await prisma.room.create({
            data: {
                id: "room_1",
                hotelId: "hotel_1",
                name: "Deluxe Suite",
                type: "SINGLE",
                pricePerNight: 300,
                availability: 5,
                amenities: "Free Wi-Fi, Breakfast Included",
            },
        });

        await prisma.room.create({
            data: {
                id: "room_2",
                hotelId: "hotel_1",
                type: "DOUBLE",
                name: "Standard Room",
                pricePerNight: 150,
                availability: 1,
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

    // create a booking to hotel_1
    await prisma.booking.create({
        data: {
            id: "booking_1",
            hotelId: "hotel_1",
            roomId: "room_2",
            userId: customer.id,
            checkInDate: new Date("2025-03-09"),
            checkOutDate: new Date("2025-03-12"),
            status: "CONFIRMED",
        },
    });

    console.log("Seeding complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
