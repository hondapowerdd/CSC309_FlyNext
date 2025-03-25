import { PrismaClient } from "@prisma/client";
import encryption from "../src/auth/encryption.js";
const { encrypt } = encryption;

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // // delete the users table
    // await prisma.user.deleteMany({});
    //
    // // delete the hotel images table
    // await prisma.hotelImage.deleteMany({});
    //
    // // clear the room table
    // await prisma.room.deleteMany({});
    //
    // // clear the hotel table
    // await prisma.hotel.deleteMany({});
    //
    // // delete all existing notifications
    // await prisma.notification.deleteMany({});
    //
    // // delete the bookings table
    // await prisma.booking.deleteMany({});

    // run npx prisma migrate reset to reset the database


    // create users -----------------------------------------------------------------------------
    let owner = await prisma.user.findFirst({ where: { email: "owner@example.com" } });
    if (!owner) {
        owner = await prisma.user.create({
            data: {
                id: "owner_1",
                uid: "owner_1",
                firstName: "John",
                lastName: "Doe",
                email: "owner@example.com",
                password: encrypt("123456"),
                role: "ADMIN",
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
                password: encrypt("123456"),
                role: "CUSTOMER",
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
                password: encrypt("123456"),
                role: "VISITOR",
            },
        });
    }
    // ------------------------------------------------------------------------------------------



    // create notifications -----------------------------------------------------------------------------
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
    // ------------------------------------------------------------------------------------------



    // create a hotel -----------------------------------------------------------------------------
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
    // ------------------------------------------------------------------------------------------



    // create hotel images -----------------------------------------------------------------------------
    const existingImages = await prisma.hotelImage.findMany();
    if (existingImages.length === 0) {
        await prisma.hotelImage.create({
            data: {
                id: "image_1",
                hotelId: "hotel_1",
                imageUrl: "https://example.com/hotel_1.jpg",
            },
        });

        await prisma.hotelImage.create({
            data: {
                id: "image_2",
                hotelId: "hotel_2",
                imageUrl: "https://example.com/hotel_2.jpg",
            },
        });
    }
    // ------------------------------------------------------------------------------------------



    // create rooms -----------------------------------------------------------------------------
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
                type: "SINGLE",
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
                type: "DOUBLE",
                name: "Standard Room",
                pricePerNight: 100,
                availability: 2,
                amenities: "Free Wi-Fi",
            },
        });
    }
    // ------------------------------------------------------------------------------------------


    // create room images -----------------------------------------------------------------------------
    await prisma.roomImage.create({
        data: {
            id: "image_1",
            roomId: "room_1",
            imageUrl: "https://example.com/room_1.jpg",
        },
    });

    await prisma.roomImage.create({
        data: {
            id: "image_2",
            roomId: "room_2",
            imageUrl: "https://example.com/room_2.jpg",
        },
    });

    await prisma.roomImage.create({
        data: {
            id: "image_3",
            roomId: "room_3",
            imageUrl: "https://example.com/room_3.jpg",
        },
    });

    await prisma.roomImage.create({
        data: {
            id: "image_4",
            roomId: "room_4",
            imageUrl: "https://example.com/room_4.jpg",
        },
    });
    // ------------------------------------------------------------------------------------------


    // create room availability -----------------------------------------------------------------------------
    await prisma.roomAvailability.create({
        data: {
            roomId: "room_1",
            date: new Date("2025-03-09"),
            availability: 5,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_1",
            date: new Date("2025-03-10"),
            availability: 5,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_1",
            date: new Date("2025-03-11"),
            availability: 5,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_1",
            date: new Date("2025-03-12"),
            availability: 5,
        },
    });





    await prisma.roomAvailability.create({
        data: {
            roomId: "room_2",
            date: new Date("2025-03-09"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_2",
            date: new Date("2025-03-10"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_2",
            date: new Date("2025-03-11"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_2",
            date: new Date("2025-03-12"),
            availability: 2,
        },
    });




    await prisma.roomAvailability.create({
        data: {
            roomId: "room_3",
            date: new Date("2025-03-09"),
            availability: 3,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_3",
            date: new Date("2025-03-10"),
            availability: 3,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_3",
            date: new Date("2025-03-11"),
            availability: 3,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_3",
            date: new Date("2025-03-12"),
            availability: 3,
        },
    });



    await prisma.roomAvailability.create({
        data: {
            roomId: "room_4",
            date: new Date("2025-03-09"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_4",
            date: new Date("2025-03-10"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_4",
            date: new Date("2025-03-11"),
            availability: 2,
        },
    });

    await prisma.roomAvailability.create({
        data: {
            roomId: "room_4",
            date: new Date("2025-03-12"),
            availability: 2,
        },
    });


    // create bookings -----------------------------------------------------------------------------
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

    await prisma.booking.create({
        data: {
            id: "booking_2",
            hotelId: "hotel_1",
            roomId: "room_1",
            userId: customer.id,
            checkInDate: new Date("2025-03-13"),
            checkOutDate: new Date("2025-03-18"),
            status: "CONFIRMED",
        },
    });
    // ------------------------------------------------------------------------------------------



    // create payments -----------------------------------------------------------------------------
    await prisma.payment.create({
        data: {
            id: "payment_1",
            userId: customer.id,
            amount: 450.0,
            status: "PAID",
        }
    });

    await prisma.payment.create({
        data: {
            id: "payment_2",
            userId: customer.id,
            amount: 750.0,
            status: "PAID",
        }
    });
    // ------------------------------------------------------------------------------------------



    // create invoices -----------------------------------------------------------------------------
    let invoice = await prisma.invoice.findFirst({ where: { userId: "customer_1" } });
    if (!invoice) {
        invoice = await prisma.invoice.create({
            data: {
                id: "invoice_1",
                userId: "customer_1",
                amount: 450.0,
                pdfUrl: "https://example.com/invoice_1.pdf",
            },
        });

        invoice = await prisma.invoice.create({
            data: {
                id: "invoice_2",
                userId: "customer_1",
                amount: 750.0,
                pdfUrl: "https://example.com/invoice_2.pdf",
            },
        });
    }
    // ------------------------------------------------------------------------------------------



    // create itineraries -----------------------------------------------------------------------------
    let itinerary = await prisma.itinerary.findFirst({ where: { userId: "customer_1" } });
    if (!itinerary) {
        itinerary = await prisma.itinerary.create({
            data: {
                id: "itinerary_1",
                userId: "customer_1",

                bookings: {
                    connect :[
                        { id: "booking_1" },
                        { id: "booking_2" },
                    ]
                },
                payments: {
                    connect :[
                        { id: "payment_1" },
                        { id: "payment_2" },
                    ]
                },
                invoices: {
                    connect: [
                        { id: "invoice_1" },
                        { id: "invoice_2" },
                    ]
                }
            },
        });

        itinerary = await prisma.itinerary.create({
            data: {
                id: "itinerary_2",
                userId: "customer_1",

                bookings: {
                    connect :[
                        { id: "booking_1" },
                    ]
                },
                payments: {
                    connect :[
                        { id: "payment_1" },
                    ]
                },
                invoices: {
                    connect: [
                        { id: "invoice_1" },
                    ]
                }
            },
        });
    }
    // ------------------------------------------------------------------------------------------


    // create user preferences -----------------------------------------------------------------------------
    await prisma.userPreferences.create({
        data: {
            id: "preference_1",
            userId: customer.id,

            theme: "DARK",
            language: "en",
        },
    });

    await prisma.userPreferences.create({
        data: {
            id: "preference_2",
            userId: owner.id,

            theme: "LIGHT",
            language: "fr",
        }
    });

    await prisma.userPreferences.create({
        data: {
            id: "preference_3",
            userId: visitor.id,

            theme: "LIGHT",
            language: "en",
        }
    });
    // ------------------------------------------------------------------------------------------

    console.log("Seeding complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
