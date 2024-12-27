import { prisma } from "@/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  if (!cookieStore.has("signature")) {
    return Response.json("Unauthorized", { status: 401 });
  }
  const signature = cookieStore.get("signature");
  if (!signature?.value) {
    return Response.json("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findFirst({
    where: {
      signature: signature.value,
    },
  });

  if (!user) {
    return Response.json("Unauthorized", { status: 401 });
  }

  const blob = await req.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  prisma.user.update({
    where: {
      address: user.address,
    },
    data: {
      image: buffer,
    },
  });
  return Response.json({});
}
