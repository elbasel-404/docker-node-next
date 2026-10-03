import { prisma } from "./client";

async function main() {
  console.log("Clearing database...");

  await prisma.imagingStudy.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
}

main()
  .catch((error) => {
    console.error("❌ Clear failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("✅ Clear completed");
    await prisma.$disconnect();
  });
