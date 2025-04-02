import { resolveTokens } from "@/auth/token";
import prisma from "@/db/database";

export const GET = async (req: Request) => {
    try {
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({
            where: { uid },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                passportNumber: true,
                phoneNumber: true,
                profilePic: true,
            }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Failed to resolve user from token", err);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
};
