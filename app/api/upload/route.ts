import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const dataFile = path.join(process.cwd(), "app", "data", "crackers.json");
const uploadDir = path.join(process.cwd(), "public");

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const file = formData.get("image") as File;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(uploadDir, file.name);
  await fs.writeFile(filePath, buffer);

  const crackers = (await fs.readJSON(dataFile).catch(() => [])) || [];
  crackers.push({ name, price, image: file.name });

  await fs.writeJSON(dataFile, crackers, { spaces: 2 });
  return NextResponse.json({ success: true });
}
