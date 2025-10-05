// app/api/crackers/route.ts

import { NextResponse } from "next/server";
import { readCrackersData, writeCrackersData } from "@/lib/data";

// 🟢 GET: Fetch all crackers
export async function GET() {
  const crackers = await readCrackersData();
  return NextResponse.json(crackers);
}

// 🟢 DELETE: Remove a cracker by ID
// 💡 NOTE: This route now handles the DELETE request from the Admin Panel.
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    let crackers = await readCrackersData();

    const initialLength = crackers.length;
    crackers = crackers.filter((c: any) => c.id !== id);

    if (crackers.length !== initialLength) {
      await writeCrackersData(crackers);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cracker:", error);
    return NextResponse.json({ success: false, message: "Failed to delete cracker" }, { status: 500 });
  }
}