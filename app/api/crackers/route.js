import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'crackers.json');

const readData = async () => {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeData = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

// GET: To fetch all crackers
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

// DELETE: To delete a cracker
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: 'Cracker ID is required.' }, { status: 400 });
  }

  let data = await readData();
  const crackerToDelete = data.find((c) => c.id == id);
  if (!crackerToDelete) {
      return NextResponse.json({ message: 'Cracker not found.' }, { status: 404 });
  }

  if (crackerToDelete.imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', crackerToDelete.imageUrl);
      try { await fs.unlink(imagePath); } catch (error) { console.error("Failed to delete image file:", error.message); }
  }

  const updatedData = data.filter((cracker) => cracker.id != id);
  await writeData(updatedData);

  return NextResponse.json({ message: 'Cracker deleted successfully.' });
}

// POST: To add or update a cracker
export async function POST(request) {
  const formData = await request.formData();
  const name = formData.get('name');
  const price = formData.get('price');
  const image = formData.get('image');
  const isUpdate = formData.get('isUpdate') === 'true';
  const id = formData.get('id');

  const data = await readData();

  if (isUpdate) {
    const crackerIndex = data.findIndex((c) => c.id == id);
    if (crackerIndex === -1) {
      return NextResponse.json({ message: 'Cracker not found.' }, { status: 404 });
    }
    
    data[crackerIndex].name = name;
    data[crackerIndex].price = price;

    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const imagePath = path.join(process.cwd(), 'public/uploads/images', filename);
      await fs.writeFile(imagePath, buffer);
      data[crackerIndex].imageUrl = `/uploads/images/${filename}`;
    }
    
    await writeData(data);
    return NextResponse.json(data[crackerIndex]);

  } else {
    if (!image || image.size === 0) {
      return NextResponse.json({ error: 'Image is required.' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
    const imagePath = path.join(process.cwd(), 'public/uploads/images', filename);
    await fs.writeFile(imagePath, buffer);

    const newCracker = {
      id: Date.now(),
      name: name,
      price: price,
      imageUrl: `/uploads/images/${filename}`,
    };
    
    data.push(newCracker);
    await writeData(data);
    return NextResponse.json(newCracker, { status: 201 });
  }
}