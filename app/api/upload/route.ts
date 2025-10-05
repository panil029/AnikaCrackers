// app/api/upload/route.ts

import { cloudinary } from "@/lib/cloudinary"; // 💡 FIX: Import configured instance
import { readCrackersData, writeCrackersData } from "@/lib/data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Check if Cloudinary object is ready (based on lib/cloudinary.ts check)
    if (!cloudinary.config().cloud_name) {
        return NextResponse.json(
            { error: "Server error: Cloudinary service not configured." }, 
            { status: 503 }
        );
    }

    try {
        const formData = await req.formData();
        // Keys must match the client-side formData.append calls
        const file = formData.get("image") as File | null; 
        const name = formData.get("name") as string;
        const price = formData.get("price") as string;

        if (!file || !name || !price) {
            return NextResponse.json(
                { error: "Image file, name, and price are required." }, 
                { status: 400 }
            );
        }

        // Convert File → Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "crackers" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(buffer);
        });

        // 💡 NEW: After successful Cloudinary upload, save data to crackers.json
        const crackers = await readCrackersData();

        const newCracker = {
            id: Date.now(),
            name,
            price,
            imageUrl: uploadResult.secure_url, // Use the public URL
        };

        crackers.push(newCracker);
        await writeCrackersData(crackers);

        return NextResponse.json(newCracker);

    } catch (err: any) {
        console.error("Upload and save cracker error:", err);
        return NextResponse.json(
            { error: "Failed to upload image or save cracker data", details: err.message },
            { status: 500 }
        );
    }
}