// lib/data.ts

import fs from "fs-extra";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "crackers.json");

interface Cracker {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
}

// Helper function to read/initialize crackers data
export async function readCrackersData(): Promise<Cracker[]> {
  try {
    // 💡 FIX: Ensure directory and file exist before reading
    await fs.ensureFile(dataFile);
    
    let content = await fs.readFile(dataFile, "utf-8");
    
    // If the file is empty, initialize it with "[]"
    if (!content.trim()) {
      await fs.writeFile(dataFile, "[]", "utf-8");
      content = "[]";
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error accessing data file:", error);
    return []; 
  }
}

// Helper function to write crackers data
export async function writeCrackersData(crackers: Cracker[]) {
    await fs.writeFile(dataFile, JSON.stringify(crackers, null, 2));
}