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

  const info = await req.json();
  if (info?.name?.length > 10) {
    return Response.json("Name too long", { status: 401 });
  }
  console.log(info, "info");
  console.log(user, "user");
  await prisma.user.update({
    where: {
      address: user.address,
    },
    data: {
      name: info.name,
    },
  });
  return Response.json({});
}
