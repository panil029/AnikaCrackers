import { NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

export const runtime = "nodejs";

const imagesDir = path.join(process.cwd(), "public", "images");
const dataFile = path.join(process.cwd(), "data", "crackers.json");

fs.ensureDirSync(imagesDir);
fs.ensureFileSync(dataFile);
if (!fs.readFileSync(dataFile, "utf8")) fs.writeFileSync(dataFile, "[]");

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = form.get("name") as string;
    const priceRaw = form.get("price") as string;
    const price = parseFloat(priceRaw || "0");
    // file is a Web File
    const file = form.get("image") as File | null;

    // If editing an existing item, admin may send 'filenameToKeep' to not replace image
    const existingFilename = form.get("existingFilename") as string | null;

    let filename = existingFilename || null;

    if (file && file.size > 0) {
      // write file to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // create safe filename
      const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      filename = safeName;
      const dest = path.join(imagesDir, safeName);
      await fs.writeFile(dest, buffer);
    }

    // read crackers
    const raw = await fs.readFile(dataFile, "utf8");
    const crackers = JSON.parse(raw || "[]");

    // if existingFilename provided + an index (edit scenario) — find by existingFilename and update
    const editId = form.get("editId") as string | null;
    if (editId) {
      const idx = crackers.findIndex((c: any) => String(c.id) === String(editId));
      if (idx !== -1) {
        // if filename changed (new upload), delete old file
        if (filename && crackers[idx].imageFilename && crackers[idx].imageFilename !== filename) {
          const oldPath = path.join(imagesDir, crackers[idx].imageFilename);
          if (await fs.pathExists(oldPath)) await fs.remove(oldPath);
        }
        crackers[idx].name = name || crackers[idx].name;
        crackers[idx].price = isNaN(price) ? crackers[idx].price : price;
        crackers[idx].image = filename ? `/images/${filename}` : crackers[idx].image;
        crackers[idx].imageFilename = filename || crackers[idx].imageFilename;
        await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));
        return NextResponse.json(crackers[idx]);
      } else {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    // create new cracker
    if (!filename) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }
    const newCracker = {
      id: Date.now(),
      name: name || "Untitled",
      price: isNaN(price) ? 0 : price,
      image: `/images/${filename}`,
      imageFilename: filename
    };
    crackers.push(newCracker);
    await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));
    return NextResponse.json(newCracker);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
