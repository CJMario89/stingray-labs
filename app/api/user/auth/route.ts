import { prisma } from "@/prisma";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const data = await req.json();
  const message = data.message;
  const bytes = Buffer.from(message, "utf-8");
  const signature = data.signature;

  try {
    const result = await verifyPersonalMessageSignature(bytes, signature);
    //return cookie
    await prisma.user.upsert({
      where: {
        address: result.toSuiAddress(),
      },
      update: {
        signature,
      },
      create: {
        address: result.toSuiAddress(),
        signature,
      },
    });
    const cookieStore = cookies();
    cookieStore.set("signature", signature);
    console.log(result.toSuiAddress(), "result");
  } catch (e) {
    console.log(e);
  }

  return Response.json({});
}
