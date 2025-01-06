import { prisma } from "@/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const name = body.name;
  const image = body.image;
  const cookieStore = cookies();
  const cookieName = `signature-${body.address}`;
  if (!cookieStore.has(cookieName)) {
    return Response.json("Unauthorized", { status: 401 });
  }
  const signature = cookieStore.get(cookieName);

  if (!signature?.value) {
    return Response.json("Unauthorized", { status: 401 });
  }
  const user = await prisma.user.findFirst({
    where: {
      signature: signature.value,
    },
  });

  if (!user) {
    //cookie expired
    //remove cookie
    cookieStore.delete(cookieName);
    return Response.json("Unauthorized", { status: 401 });
  }
  console.log(user, "user");
  if (name?.length > 12) {
    return Response.json("Name too long", { status: 401 });
  }
  await prisma.user.update({
    where: {
      address: user.address,
    },
    data: {
      name,
      ...(image
        ? {
            image: Buffer.from(
              image.replace(/data:image\/.*;base64,/, ""),
              "base64",
            ),
          }
        : {}),
    },
  });
  return Response.json("Success");
}
