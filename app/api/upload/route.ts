import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs-extra";
import path from "path";
import multer from "multer";

const dataFile = path.join(process.cwd(), "data/crackers.json");
await fs.ensureFile(dataFile);
if (!(await fs.readFile(dataFile, "utf-8"))) {
  await fs.writeFile(dataFile, "[]");
}

// Cloudinary config
cloudinary.config({
  cloud_name: "dqxkd1di3",
  api_key: "537647515185984",
  api_secret: "lqIRQye6Ajz39sEBX0mmAfACEy0",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Convert file to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "crackers-store" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Add cracker to data file
    const crackers = JSON.parse((await fs.readFile(dataFile, "utf-8")) || "[]");
    const newCracker = {
      id: Date.now(),
      name,
      price,
      image: (uploadResult as any).secure_url, // Cloudinary public URL
    };

    crackers.push(newCracker);
    await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));

    return NextResponse.json(newCracker);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
