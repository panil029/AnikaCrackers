import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "app/data/crackers.json");

export async function GET() {
  const data = fs.readFileSync(dataFile, "utf-8");
  return NextResponse.json(JSON.parse(data || "[]"));
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const file = formData.get("image") as File;

  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadDir, file.name);
  fs.writeFileSync(filePath, bytes);

  const crackers = JSON.parse(fs.readFileSync(dataFile, "utf-8") || "[]");
  crackers.push({ name, price, image: `/uploads/${file.name}` });
  fs.writeFileSync(dataFile, JSON.stringify(crackers, null, 2));

  return NextResponse.json({ success: true });
}
