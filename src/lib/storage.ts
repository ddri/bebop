import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3';

export async function uploadFileToStorage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const key = `uploads/${Date.now()}-${file.name}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
  }));

  // Return the URL that will be stored in the database
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFileFromStorage(url: string): Promise<void> {
  // Extract the key from the full URL
  const key = url.split('.amazonaws.com/')[1];
  
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }));
}