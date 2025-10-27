import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seedDatabase() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  try {
    console.log("🌱 Seeding Convex database...");
    const result = await convex.action(api.seed.seedDatabase);
    console.log("✅ Database seeded successfully!");
    console.log("📊 Seed results:", result);
    console.log("\n🔐 Login credentials:");
    console.log("Admin:", result.adminUser);
    if (result.sampleUsers) {
      result.sampleUsers.forEach((user: string) => {
        console.log("User:", user);
      });
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase();
