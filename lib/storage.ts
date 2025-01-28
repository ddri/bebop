// /lib/storage.ts
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function uploadFileToStorage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  await writeFile(filepath, Buffer.from(buffer));
  return `/uploads/${filename}`;
}

export async function deleteFileFromStorage(url: string): Promise<void> {
  const filename = url.split('/').pop()!;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  await unlink(filepath);
}