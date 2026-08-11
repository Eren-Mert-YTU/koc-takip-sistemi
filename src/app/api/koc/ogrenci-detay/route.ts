import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekBounds } from "@/lib/week";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "COACH") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const kocId = (session.user as any).id;
  const ogrenciId = req.nextUrl.searchParams.get("ogrenciId");

  if (!ogrenciId) {
    return NextResponse.json({ error: "Öğrenci ID gerekli." }, { status: 400 });
  }

  // Koçun bu öğrenciye erişimi var mı?
  const iliski = await prisma.coachStudent.findUnique({
    where: { coachId_studentId: { coachId: kocId, studentId: ogrenciId } },
  });
  if (!iliski) {
    return NextResponse.json({ error: "Bu öğrenciye erişiminiz yok." }, { status: 403 });
  }

  const [ogrenci, gorevler] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ogrenciId },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.task.findMany({
      where: { coachId: kocId, studentId: ogrenciId },
      orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }],
    }),
  ]);

  if (!ogrenci) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const { monday, sunday } = getWeekBounds();
  const buHaftaGorevler = gorevler.filter(
    (g) => new Date(g.deadline) >= monday && new Date(g.deadline) <= sunday
  );

  const istatistik = {
    toplam: gorevler.length,
    tamamlanan: gorevler.filter((g) => g.isCompleted).length,
    buHafta: buHaftaGorevler.length,
    buHaftaTamamlanan: buHaftaGorevler.filter((g) => g.isCompleted).length,
  };

  return NextResponse.json({ ogrenci, gorevler, istatistik });
}
