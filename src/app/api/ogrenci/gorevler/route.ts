import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekBounds } from "@/lib/week";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
  const ogrenciId = (session.user as any).id;

  const filtre = req.nextUrl.searchParams.get("filtre") || "tumu"; // "bu-hafta" | "tumu"

  const { monday, sunday } = getWeekBounds();

  const where: any = { studentId: ogrenciId };
  if (filtre === "bu-hafta") {
    where.deadline = { gte: monday, lte: sunday };
  }

  const gorevler = await prisma.task.findMany({
    where,
    orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }],
    include: {
      coach: { select: { id: true, name: true } },
    },
  });

  // Haftalık istatistik (her zaman hesaplanır)
  const buHaftaGorevler = await prisma.task.findMany({
    where: { studentId: ogrenciId, deadline: { gte: monday, lte: sunday } },
  });

  const istatistik = {
    buHafta: buHaftaGorevler.length,
    buHaftaTamamlanan: buHaftaGorevler.filter((g) => g.isCompleted).length,
    toplam: await prisma.task.count({ where: { studentId: ogrenciId } }),
    tamamlanan: await prisma.task.count({ where: { studentId: ogrenciId, isCompleted: true } }),
  };

  return NextResponse.json({ gorevler, istatistik });
}
