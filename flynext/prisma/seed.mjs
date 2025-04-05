import { PrismaClient } from "@prisma/client";
import encryption from "../src/auth/encryption.js";
const { encrypt } = encryption;

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // npx prisma migrate reset to reset the database


    // create users -----------------------------------------------------------------------------
    let owner = await prisma.user.findFirst({ where: { email: "owner@example.com" } });
    if (!owner) {
        owner = await prisma.user.create({
            data: {
                id: "admin",
                uid: "admin",
                firstName: "John",
                lastName: "Doe",
                email: "owner@example.com",
                password: encrypt("123456"),
                role: "ADMIN",
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
                userId: "admin",
                message: "New booking made for your hotel",
                isRead: false,
                type: "NEW_BOOKING",
            },
        });

        notif = await prisma.notification.create({
            data: {
                id: "notif_2",
                userId: "admin",
                message: "Booking cancelled by customer",
                isRead: false,
                type: "CANCELLED_BOOKING",
            },
        });
    }

    // ------------------------------------------------------------------------------------------



    // create 50 hotels -----------------------------------------------------------------------------
    const existingHotels = await prisma.hotel.findMany();

    if (existingHotels.length === 0) {
        const cities = [
            "Toronto", "New York", "Paris", "Tokyo", "London",
            "Rome", "Dubai", "Shanghai", "Singapore", "Los Angeles"
        ];

        for (let i = 1; i <= 50; i++) {
            console.log(`Creating hotel ${i}...`);
            const city = cities[i % cities.length];

            const hotel = await prisma.hotel.create({
                data: {
                    id: `hotel_${i}`,
                    hid: `hotel_${i}`,
                    name: `Hotel ${i}`,
                    city,
                    starRating: (i % 5) + 1,
                    ownerId: owner.id,
                },
            });

            await prisma.hotelImage.create({
                data: {
                    id: `hotel_img_${i}`,
                    hotelId: hotel.id,
                    imageUrl: `https://source.unsplash.com/random/800x600?sig=${i}&hotel`,
                },
            });

            const roomTypes = ["SINGLE", "DOUBLE", "DELUXE"];
            for (let j = 0; j < roomTypes.length; j++) {
                const type = roomTypes[j];
                const roomName = `${type} Room ${i}-${j + 1}`;
                const price = 80 + i * 2 + j * 15;

                const room = await prisma.room.create({
                    data: {
                        id: `room_${i}_${j + 1}`,
                        hotelId: hotel.id,
                        name: roomName,
                        type,
                        pricePerNight: price,
                        availability: 5,
                        amenities: "Free Wi-Fi, Air Conditioning",
                    },
                });

                await prisma.roomImage.create({
                    data: {
                        id: `room_img_${i}_${j + 1}`,
                        roomId: room.id,
                        imageUrl: `https://source.unsplash.com/random/800x600?sig=${i}_${j}&room`,
                    },
                });

            }
        }
    }

    


    // create bookings -----------------------------------------------------------------------------
    // await prisma.booking.create({
    //     data: {
    //         id: "booking_1",
    //         hotelId: "hotel_1",
    //         roomId: "room_2",
    //         userId: customer.id,
    //         checkInDate: new Date("2025-03-09"),
    //         checkOutDate: new Date("2025-03-12"),
    //         status: "CONFIRMED",
    //     },
    // });
    //
    // await prisma.booking.create({
    //     data: {
    //         id: "booking_2",
    //         hotelId: "hotel_1",
    //         roomId: "room_1",
    //         userId: customer.id,
    //         checkInDate: new Date("2025-03-13"),
    //         checkOutDate: new Date("2025-03-18"),
    //         status: "CONFIRMED",
    //     },
    // });
    // ------------------------------------------------------------------------------------------



    // create payments -----------------------------------------------------------------------------
    // await prisma.payment.create({
    //     data: {
    //         id: "payment_1",
    //         userId: customer.id,
    //         amount: 450.0,
    //         status: "PAID",
    //     }
    // });
    //
    // await prisma.payment.create({
    //     data: {
    //         id: "payment_2",
    //         userId: customer.id,
    //         amount: 750.0,
    //         status: "PAID",
    //     }
    // });
    // ------------------------------------------------------------------------------------------



    // create invoices -----------------------------------------------------------------------------
    // let invoice = await prisma.invoice.findFirst({ where: { userId: "customer_1" } });
    // if (!invoice) {
    //     invoice = await prisma.invoice.create({
    //         data: {
    //             id: "invoice_1",
    //             userId: "customer_1",
    //             amount: 450.0,
    //             pdfUrl: "https://example.com/invoice_1.pdf",
    //         },
    //     });
    //
    //     invoice = await prisma.invoice.create({
    //         data: {
    //             id: "invoice_2",
    //             userId: "customer_1",
    //             amount: 750.0,
    //             pdfUrl: "https://example.com/invoice_2.pdf",
    //         },
    //     });
    // }
    // ------------------------------------------------------------------------------------------



    // create itineraries -----------------------------------------------------------------------------
    // let itinerary = await prisma.itinerary.findFirst({ where: { userId: "customer_1" } });
    // if (!itinerary) {
    //     itinerary = await prisma.itinerary.create({
    //         data: {
    //             id: "itinerary_1",
    //             userId: "customer_1",
    //
    //             bookings: {
    //                 connect :[
    //                     { id: "booking_1" },
    //                     { id: "booking_2" },
    //                 ]
    //             },
    //             payments: {
    //                 connect :[
    //                     { id: "payment_1" },
    //                     { id: "payment_2" },
    //                 ]
    //             },
    //             invoices: {
    //                 connect: [
    //                     { id: "invoice_1" },
    //                     { id: "invoice_2" },
    //                 ]
    //             }
    //         },
    //     });
    //
    //     itinerary = await prisma.itinerary.create({
    //         data: {
    //             id: "itinerary_2",
    //             userId: "customer_1",
    //
    //             bookings: {
    //                 connect :[
    //                     { id: "booking_1" },
    //                 ]
    //             },
    //             payments: {
    //                 connect :[
    //                     { id: "payment_1" },
    //                 ]
    //             },
    //             invoices: {
    //                 connect: [
    //                     { id: "invoice_1" },
    //                 ]
    //             }
    //         },
    //     });
    // }
    // ------------------------------------------------------------------------------------------


    // create user preferences -----------------------------------------------------------------------------
    await prisma.userPreferences.create({
        data: {
            id: "preference_1",
            userId: owner.id,

            theme: "DARK",
            language: "en",
        },
    });

    // ------------------------------------------------------------------------------------------

    console.log("Seeding complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
