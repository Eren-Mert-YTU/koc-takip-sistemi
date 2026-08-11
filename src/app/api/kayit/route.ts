import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const kayitSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır."),
  role: z.enum(["COACH", "STUDENT"], {
    errorMap: () => ({ message: "Geçerli bir rol seçiniz." }),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = kayitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    // E-posta kontrolü
    const mevcutKullanici = await prisma.user.findUnique({
      where: { email },
    });

    if (mevcutKullanici) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanımda." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Koçlar onay bekler, öğrenciler direkt aktif
    const status = role === "COACH" ? "PENDING" : "ACTIVE";

    const kullanici = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
      },
    });

    return NextResponse.json(
      {
        message:
          role === "COACH"
            ? "Koç başvurunuz alındı. Yönetici onayından sonra giriş yapabilirsiniz."
            : "Kayıt başarılı! Giriş yapabilirsiniz.",
        userId: kullanici.id,
        status: kullanici.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
