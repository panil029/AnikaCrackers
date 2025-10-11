import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "crackers.json");

export async function GET() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
  }
  const raw = fs.readFileSync(dataFile, "utf8") || "[]";
  const data = JSON.parse(raw);
  return NextResponse.json(data);
}
