import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const { kocId } = await req.json();

  if (!kocId) {
    return NextResponse.json({ error: "Koç ID gereklidir." }, { status: 400 });
  }

  const koc = await prisma.user.findUnique({ where: { id: kocId } });

  if (!koc || koc.role !== "COACH") {
    return NextResponse.json({ error: "Koç bulunamadı." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: kocId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({
    message: `${koc.name} başvurusu reddedildi.`,
  });
}
