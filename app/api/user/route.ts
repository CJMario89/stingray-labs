import { prisma } from "@/prisma";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address) {
    return Response.json("Address not found", { status: 401 });
  }
  const user = await prisma.user.findFirst({
    where: {
      address: address,
    },
  });
  if (!user) {
    return Response.json({});
  }

  const image = user.image
    ? Buffer.from(user.image).toString("base64")
    : undefined;

  return Response.json({
    address: user.address,
    name: user.name,
    image: `data:image/png;base64,${image}`,
  });
}
