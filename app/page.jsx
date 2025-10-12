import fs from 'fs/promises';
import path from 'path';
import CrackerShop from './components/CrackerShop';

async function getCrackers() {
  const filePath = path.join(process.cwd(), 'app', 'data', 'crackers.json');
  try {
    const jsonData = await fs.readFile(filePath);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Could not read crackers.json", error);
    return [];
  }
}

export default async function HomePage() {
  const crackers = await getCrackers();
  return <CrackerShop crackers={crackers} />;
}