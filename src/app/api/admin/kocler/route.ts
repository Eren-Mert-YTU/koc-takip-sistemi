import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const [bekleyenler, onaylananlar] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COACH", status: "PENDING" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "COACH", status: "ACTIVE" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ bekleyenler, onaylananlar });
}
