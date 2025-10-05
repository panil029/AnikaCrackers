import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const uploadDir = path.join(process.cwd(), "public/uploads");
await fs.ensureDir(uploadDir);

const dataFile = path.join(process.cwd(), "data/crackers.json");
await fs.ensureFile(dataFile);
if (!(await fs.readFile(dataFile, "utf-8"))) {
  await fs.writeFile(dataFile, "[]");
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  const crackers = JSON.parse(await fs.readFile(dataFile, "utf-8") || "[]");
  const newCracker = { id: Date.now(), name, price, image: `/uploads/${filename}` };
  crackers.push(newCracker);
  await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));

  return NextResponse.json(newCracker);
}
