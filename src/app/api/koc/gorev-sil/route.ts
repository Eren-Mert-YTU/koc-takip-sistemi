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
  const { gorevId } = await req.json();

  if (!gorevId) {
    return NextResponse.json({ error: "Görev ID gereklidir." }, { status: 400 });
  }

  const gorev = await prisma.task.findUnique({ where: { id: gorevId } });
  if (!gorev || gorev.coachId !== kocId) {
    return NextResponse.json({ error: "Görev bulunamadı." }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: gorevId } });
  return NextResponse.json({ message: "Görev silindi." });
}
