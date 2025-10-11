import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export const runtime = "nodejs";

const imagesDir = path.join(process.cwd(), "public", "images");
const dataFile = path.join(process.cwd(), "data", "crackers.json");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filename = body?.filename;
    if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

    const dataRaw = await fs.readFile(dataFile, "utf8");
    const crackers = JSON.parse(dataRaw || "[]");

    // filter out all crackers that match this filename
    const remaining = crackers.filter((c: any) => c.imageFilename !== filename);
    const removed = crackers.filter((c: any) => c.imageFilename === filename);

    // delete physical file if exists
    const filePath = path.join(imagesDir, filename);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }

    await fs.writeFile(dataFile, JSON.stringify(remaining, null, 2));
    return NextResponse.json({ success: true, removed });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
