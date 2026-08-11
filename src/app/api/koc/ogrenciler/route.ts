import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Koçun öğrencilerini listele
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "COACH") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const kocId = (session.user as any).id;

  const iliskiler = await prisma.coachStudent.findMany({
    where: { coachId: kocId },
    include: {
      student: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const ogrenciler = iliskiler.map((i) => i.student);

  return NextResponse.json({ ogrenciler });
}
