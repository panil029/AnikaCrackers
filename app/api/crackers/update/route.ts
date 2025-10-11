import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "app/data/crackers.json");

export async function POST(req: Request) {
  const { name, price } = await req.json();

  if (!name || price == null) {
    return NextResponse.json({ error: "Missing name or price" }, { status: 400 });
  }

  const crackers = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  const index = crackers.findIndex((c: any) => c.name === name);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  crackers[index].price = parseFloat(price);
  fs.writeFileSync(dataFile, JSON.stringify(crackers, null, 2));

  return NextResponse.json({ success: true });
}
