import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "COACH") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
  const kocId = (session.user as any).id;
  const { studentId, weekStart } = await req.json();

  if (!studentId || !weekStart) {
    return NextResponse.json({ error: "Öğrenci ID ve hafta başlangıcı gereklidir." }, { status: 400 });
  }

  const monday = new Date(weekStart);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const result = await prisma.task.deleteMany({
    where: {
      coachId: kocId,
      studentId,
      deadline: { gte: monday, lte: sunday },
    },
  });

  return NextResponse.json({
    message: `${result.count} görev başarıyla silindi.`,
    count: result.count,
  });
}
