import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "COACH") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  const kocId = (session.user as any).id;
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "Öğrenci e-postası gereklidir." },
      { status: 400 }
    );
  }

  // Öğrenciyi e-posta ile bul
  const ogrenci = await prisma.user.findUnique({ where: { email } });

  if (!ogrenci) {
    return NextResponse.json(
      { error: "Bu e-posta ile kayıtlı öğrenci bulunamadı." },
      { status: 404 }
    );
  }

  if (ogrenci.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Bu kullanıcı öğrenci rolünde değil." },
      { status: 400 }
    );
  }

  // Zaten ekli mi?
  const mevcutIliski = await prisma.coachStudent.findUnique({
    where: { coachId_studentId: { coachId: kocId, studentId: ogrenci.id } },
  });

  if (mevcutIliski) {
    return NextResponse.json(
      { error: "Bu öğrenci zaten listenizde." },
      { status: 409 }
    );
  }

  await prisma.coachStudent.create({
    data: { coachId: kocId, studentId: ogrenci.id },
  });

  return NextResponse.json({
    message: `${ogrenci.name} başarıyla listenize eklendi.`,
    ogrenci: { id: ogrenci.id, name: ogrenci.name, email: ogrenci.email },
  });
}
