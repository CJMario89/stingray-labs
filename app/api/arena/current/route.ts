import { prisma } from "@/prisma";

export const revalidate = 0;

export async function GET() {
  const now = Date.now();
  const arenas = await prisma.arena.findMany({
    where: {
      start_time: {
        lte: now,
      },
      attend_end_time: {
        gte: now,
      },
    },
  });

  return Response.json(arenas);
}
