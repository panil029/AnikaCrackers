import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "crackers.json");
await fs.ensureFile(dataFile);
if (!(await fs.readFile(dataFile, "utf-8"))) {
  await fs.writeFile(dataFile, "[]");
}

// 🟢 GET: Fetch all crackers
export async function GET() {
  const crackers = JSON.parse((await fs.readFile(dataFile, "utf-8")) || "[]");
  return NextResponse.json(crackers);
}

// 🟢 POST: Add a new cracker
export async function POST(req: Request) {
  try {
    const { name, price, imageUrl } = await req.json();
    const crackers = JSON.parse((await fs.readFile(dataFile, "utf-8")) || "[]");

    const newCracker = {
      id: Date.now(),
      name,
      price,
      imageUrl, // from Cloudinary
    };

    crackers.push(newCracker);
    await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));

    return NextResponse.json({ success: true, cracker: newCracker });
  } catch (error) {
    console.error("Error adding cracker:", error);
    return NextResponse.json({ success: false, message: "Failed to add cracker" }, { status: 500 });
  }
}

// 🟢 DELETE: Remove a cracker by ID
export async function DELETE(req: Request) {
  const { id } = await req.json();
  let crackers = JSON.parse((await fs.readFile(dataFile, "utf-8")) || "[]");
  crackers = crackers.filter((c: any) => c.id !== id);
  await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));
  return NextResponse.json({ success: true });
}
