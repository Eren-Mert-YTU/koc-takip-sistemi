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
  const { ogrenciId } = await req.json();

  if (!ogrenciId) {
    return NextResponse.json(
      { error: "Öğrenci ID gereklidir." },
      { status: 400 }
    );
  }

  const iliski = await prisma.coachStudent.findUnique({
    where: { coachId_studentId: { coachId: kocId, studentId: ogrenciId } },
  });

  if (!iliski) {
    return NextResponse.json(
      { error: "Bu öğrenci listenizde bulunamadı." },
      { status: 404 }
    );
  }

  await prisma.coachStudent.delete({
    where: { coachId_studentId: { coachId: kocId, studentId: ogrenciId } },
  });

  return NextResponse.json({ message: "Öğrenci listeden kaldırıldı." });
}
