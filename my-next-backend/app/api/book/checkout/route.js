// api/book/checkout.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { validateCardNumber, validateExpiryDate, validateCVV } from "../validate_card/validate_card";

export const POST = async (req) => {
    try {
        const { userId, itineraryId, cardNumber, expiryDate, cvv } = await req.json();

        if (!userId || !itineraryId || !cardNumber || !expiryDate || !cvv) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // validate card
        if (!validateCardNumber(cardNumber)) {
            return new Response(JSON.stringify({ error: "Invalid card number" }), { status: 400 });
        }

        if (!validateExpiryDate(expiryDate)) {
            return new Response(JSON.stringify({ error: "Expired card" }), { status: 400 });
        }

        if (!validateCVV(cvv)) {
            return new Response(JSON.stringify({ error: "Invalid CVV" }), { status: 400 });
        }

        // check price
        const itinerary = await prisma.itinerary.findUnique({
            where: { id: itineraryId },
            include: { bookings: { include: { hotel: true, room: true } } }
        });

        if (!itinerary) {
            return new Response(JSON.stringify({ error: "Itinerary not found" }), { status: 404 });
        }

        let totalAmount = 0;
        itinerary.bookings.forEach(booking => {
            if (booking.hotel && booking.room) {
                const nights = (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24);
                totalAmount += booking.room.pricePerNight * nights;
            }
        });

        // create record
        const payment = await prisma.payment.create({
            data: {
                amount: totalAmount,
                status: "COMPLETED",
                userId,
                itineraryId
            }
        });

        return new Response(JSON.stringify({
            message: "Booking confirmed",
            paymentId: payment.id
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Checkout failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
