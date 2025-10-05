import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "crackers.json");
const uploadDir = path.join(process.cwd(), "public/uploads");

export async function POST(req: Request) {
  const { id } = await req.json();
  const crackers = JSON.parse(await fs.readFile(dataFile, "utf-8") || "[]");
  const cracker = crackers.find((c: any) => c.id === id);

  if (cracker && cracker.image) {
    const imgPath = path.join(process.cwd(), "public", cracker.image);
    if (await fs.pathExists(imgPath)) {
      await fs.remove(imgPath);
    }
  }

  const updated = crackers.filter((c: any) => c.id !== id);
  await fs.writeFile(dataFile, JSON.stringify(updated, null, 2));
  return NextResponse.json({ success: true });
}
