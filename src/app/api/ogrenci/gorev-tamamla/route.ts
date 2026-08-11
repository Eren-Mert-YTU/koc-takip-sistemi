import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
  const ogrenciId = (session.user as any).id;
  const { gorevId, tamamlandi } = await req.json();

  if (!gorevId) {
    return NextResponse.json({ error: "Görev ID gereklidir." }, { status: 400 });
  }

  const gorev = await prisma.task.findUnique({ where: { id: gorevId } });
  if (!gorev || gorev.studentId !== ogrenciId) {
    return NextResponse.json({ error: "Görev bulunamadı." }, { status: 404 });
  }

  const guncellenmis = await prisma.task.update({
    where: { id: gorevId },
    data: {
      isCompleted: tamamlandi,
      completedAt: tamamlandi ? new Date() : null,
    },
  });

  return NextResponse.json({
    message: tamamlandi ? "Görev tamamlandı olarak işaretlendi." : "Görev açık olarak işaretlendi.",
    gorev: guncellenmis,
  });
}
