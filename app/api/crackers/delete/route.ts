import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "app/data/crackers.json");
const uploadDir = path.join(process.cwd(), "public/uploads");

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const crackers = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const cracker = crackers.find((c: any) => c.name === name);

  if (!cracker) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Remove from JSON
  const updated = crackers.filter((c: any) => c.name !== name);
  fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2));

  // Optional: delete image file from /public/uploads
  if (cracker.image) {
    const imgPath = path.join(uploadDir, path.basename(cracker.image));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  return NextResponse.json({ success: true });
}
