import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Clears the signed-in user's seen history so every active question becomes
// available to them again.
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in to refresh your pool." },
      { status: 401 }
    );
  }

  const { count } = await prisma.seenQuestion.deleteMany({
    where: { userId }
  });

  return NextResponse.json({ cleared: count });
}
