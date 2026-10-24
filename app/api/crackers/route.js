import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const dataFilePath = path.join(
  process.cwd(),
  'app',
  'data',
  'crackers.json'
);

const imageDirectory = path.join(
  process.cwd(),
  'public',
  'uploads',
  'images'
);

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
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

const saveImage = async (image) => {
  await fs.mkdir(imageDirectory, { recursive: true });

  const originalName = image.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${originalName}`;
  const imagePath = path.join(imageDirectory, filename);

  const buffer = Buffer.from(await image.arrayBuffer());
  await fs.writeFile(imagePath, buffer);

  return `/uploads/images/${filename}`;
};

// GET: Fetch all crackers
export async function GET() {
  try {
    const data = await readData();

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Failed to read crackers:', error);
    return NextResponse.json(
      { message: 'Failed to load crackers.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a cracker
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Cracker ID is required.' },
        { status: 400 }
      );
    }

    const data = await readData();
    const crackerToDelete = data.find((c) => String(c.id) === String(id));

    if (!crackerToDelete) {
      return NextResponse.json(
        { message: 'Cracker not found.' },
        { status: 404 }
      );
    }

    const updatedData = data.filter(
      (c) => String(c.id) !== String(id)
    );

    await writeData(updatedData);

    // Remove the image only if it is inside the uploads directory.
    if (crackerToDelete.imageUrl?.startsWith('/uploads/images/')) {
      const filename = path.basename(crackerToDelete.imageUrl);
      try {
        await fs.unlink(path.join(imageDirectory, filename));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Failed to delete image:', error);
        }
      }
    }

    return NextResponse.json({
      message: 'Cracker deleted successfully.'
    });
  } catch (error) {
    console.error('Failed to delete cracker:', error);
    return NextResponse.json(
      { message: 'Failed to delete cracker.' },
      { status: 500 }
    );
  }
}

// POST: Add or update a cracker
export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') || '').trim();
    const price = String(formData.get('price') || '').trim();
    const videoUrl = String(formData.get('videoUrl') || '').trim();
    const image = formData.get('image');
    const isUpdate = formData.get('isUpdate') === 'true';
    const id = formData.get('id');

    if (!name || !price || !Number.isFinite(Number(price)) ||
        Number(price) < 0) {
      return NextResponse.json(
        { message: 'A valid name and price are required.' },
        { status: 400 }
      );
    }

    if (videoUrl) {
      try {
        const parsedUrl = new URL(videoUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        return NextResponse.json(
          { message: 'Enter a valid HTTP or HTTPS video URL.' },
          { status: 400 }
        );
      }
    }

    const data = await readData();

    if (isUpdate) {
      const crackerIndex = data.findIndex(
        (c) => String(c.id) === String(id)
      );

      if (crackerIndex === -1) {
        return NextResponse.json(
          { message: 'Cracker not found.' },
          { status: 404 }
        );
      }

      const updatedCracker = {
        ...data[crackerIndex],
        name,
        price,
        videoUrl
      };

      if (image && typeof image.arrayBuffer === 'function' &&
          image.size > 0) {
        updatedCracker.imageUrl = await saveImage(image);
      }

      data[crackerIndex] = updatedCracker;
      await writeData(data);

      return NextResponse.json(updatedCracker);
    }

    if (!image || typeof image.arrayBuffer !== 'function' ||
        image.size === 0) {
      return NextResponse.json(
        { message: 'Image is required for a new cracker.' },
        { status: 400 }
      );
    }

    const imageUrl = await saveImage(image);

    const newCracker = {
      id: Date.now(),
      name,
      price,
      imageUrl,
      videoUrl
    };

    data.push(newCracker);
    await writeData(data);

    return NextResponse.json(newCracker, { status: 201 });
  } catch (error) {
    console.error('Failed to save cracker:', error);
    return NextResponse.json(
      { message: 'Failed to save cracker.' },
      { status: 500 }
    );
  }
}
