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
    }

    console.log("Seeding complete!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
