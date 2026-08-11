import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Admin hesabı
  const adminPassword = await bcrypt.hash("Eren123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "emert361@gmail.com" },
    update: {},
    create: {
      name: "Eren Mert (Admin)",
      email: "emert361@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Admin oluşturuldu: ${admin.email}`);

  // Demo koç (onaylanmış)
  const coachPassword = await bcrypt.hash("Koc@2026", 12);
  const coach = await prisma.user.upsert({
    where: { email: "koc@demo.com" },
    update: {},
    create: {
      name: "Ahmet Yılmaz",
      email: "koc@demo.com",
      password: coachPassword,
      role: "COACH",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Demo koç oluşturuldu: ${coach.email}`);

  // Demo koç 2 (beklemede — admin onayı için örnek)
  const coach2Password = await bcrypt.hash("Koc@2026", 12);
  await prisma.user.upsert({
    where: { email: "koc2@demo.com" },
    update: {},
    create: {
      name: "Fatma Çelik",
      email: "koc2@demo.com",
      password: coach2Password,
      role: "COACH",
      status: "PENDING",
    },
  });
  console.log("✅ Demo bekleyen koç oluşturuldu: koc2@demo.com");

  // Demo öğrenciler
  const studentPassword = await bcrypt.hash("Ogrenci@2026", 12);
  const studentData = [
    { name: "Zeynep Kaya", email: "ogrenci1@demo.com" },
    { name: "Mehmet Demir", email: "ogrenci2@demo.com" },
    { name: "Elif Şahin", email: "ogrenci3@demo.com" },
    { name: "Can Öztürk", email: "ogrenci4@demo.com" },
  ];

  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          name: s.name,
          email: s.email,
          password: studentPassword,
          role: "STUDENT",
          status: "ACTIVE",
        },
      })
    )
  );
  console.log(`✅ ${students.length} öğrenci oluşturuldu`);

  // İlk 3 öğrenciyi demo koça ata
  for (const student of students.slice(0, 3)) {
    await prisma.coachStudent.upsert({
      where: { coachId_studentId: { coachId: coach.id, studentId: student.id } },
      update: {},
      create: { coachId: coach.id, studentId: student.id },
    });
  }
  console.log("✅ Koç-öğrenci ilişkileri kuruldu");

  console.log("\n🎉 Seed tamamlandı!");
  console.log("─────────────────────────────────");
  console.log("👤 Admin    : emert361@gmail.com  / Eren123!");
  console.log("🏫 Koç      : koc@demo.com        / Koc@2026");
  console.log("⏳ Bekleyen : koc2@demo.com       / Koc@2026");
  console.log("📚 Öğrenci  : ogrenci1@demo.com   / Ogrenci@2026");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
