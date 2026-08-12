import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  studentId:   z.string().min(1),
  lessonName:  z.string().min(1, "Ders adı gereklidir."),
  sourceName:  z.string().min(1, "Kaynak adı gereklidir."),
  description: z.string().min(1, "Hedef/Açıklama gereklidir."),
  deadline:    z.string().min(1, "Son teslim tarihi gereklidir."),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "COACH") {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }
  const kocId = (session.user as any).id;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { studentId, lessonName, sourceName, description, deadline } = parsed.data;

  // Koçun bu öğrenciye erişimi var mı?
  const iliski = await prisma.coachStudent.findUnique({
    where: { coachId_studentId: { coachId: kocId, studentId } },
  });
  if (!iliski) {
    return NextResponse.json({ error: "Bu öğrenciye erişiminiz yok." }, { status: 403 });
  }

  const gorev = await prisma.task.create({
    data: {
      coachId: kocId,
      studentId,
      lessonName: lessonName.trim(),
      sourceName: sourceName.trim(),
      description: description.trim(),
      deadline: new Date(deadline),
    },
  });

  return NextResponse.json({ message: "Görev başarıyla eklendi.", gorev }, { status: 201 });
}
