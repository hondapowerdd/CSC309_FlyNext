import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { validateCardNumber, validateExpiryDate, validateCVV } from "../validate_card/validate_card";
import { resolveTokens, updateTokens } from "@/auth/token";

export const POST = async (req) => {
    try {
        const resolvedToken = await resolveTokens(req);
        const tokenType = resolvedToken["tokenType"];
        const tokenUid = resolvedToken["uid"];

        const { userId, cardNumber, expiryDate, cvv, totalAmount, itineraryId, bookingIds } = await req.json();

        if (!userId || !cardNumber || !expiryDate || !cvv || !totalAmount || !itineraryId || !bookingIds || !Array.isArray(bookingIds)) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        if (!validateCardNumber(cardNumber)) {
            return new Response(JSON.stringify({ error: "Invalid card number" }), { status: 400 });
        }

        if (!validateExpiryDate(expiryDate)) {
            return new Response(JSON.stringify({ error: "Expired card" }), { status: 400 });
        }

        if (!validateCVV(cvv)) {
            return new Response(JSON.stringify({ error: "Invalid CVV" }), { status: 400 });
        }

        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const itineraryExists = await prisma.itinerary.findUnique({ where: { id: itineraryId } });
        if (!itineraryExists) {
            return new Response(JSON.stringify({ error: "Itinerary not found" }), { status: 404 });
        }

        const bookingsToPay = await prisma.booking.findMany({
            where: {
                id: { in: bookingIds }
            }
        });

        if (bookingsToPay.length !== bookingIds.length) {
            return new Response(JSON.stringify({ error: "Some bookings not found" }), { status: 400 });
        }

        for (const booking of bookingsToPay) {
            if (booking.status === "CANCELLED") {
                return new Response(JSON.stringify({
                    error: "One or more bookings have been cancelled. Please contact support"
                }), { status: 400 });
            }

            if (booking.status === "COMPLETED") {
                return new Response(JSON.stringify({
                    error: "One or more bookings have already been paid"
                }), { status: 400 });
            }
        }

        const payment = await prisma.payment.create({
            data: {
                amount: totalAmount,
                status: "COMPLETED",
                userId: userId,
                itineraryId: itineraryId
            }
        });

        for (const booking of bookingsToPay) {
            if (booking.status === "PENDING") {
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { status: "COMPLETED" }
                });
            }
        }

        return new Response(JSON.stringify({
            message: "Booking confirmed",
            paymentId: payment.id,
            tokenUpdates: tokenType === "refresh" ? updateTokens(tokenUid) : null
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error during checkout:", error);
        return new Response(JSON.stringify({ error: "Checkout failed", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
