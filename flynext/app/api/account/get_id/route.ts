import { resolveTokens } from "@/auth/token";
import prisma from "@/db/database";

export const GET = async (req: Request) => {
    try {
        const { uid } = await resolveTokens(req);

        const user = await prisma.user.findUnique({
            where: { uid },
            select: {
                id: true,
            },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ id: user.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Failed to resolve user ID from token", err);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
};
