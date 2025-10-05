import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "crackers.json");
await fs.ensureFile(dataFile);
if (!(await fs.readFile(dataFile, "utf-8"))) {
  await fs.writeFile(dataFile, "[]");
}

export async function GET() {
  const crackers = JSON.parse(await fs.readFile(dataFile, "utf-8") || "[]");
  return NextResponse.json(crackers);
}
