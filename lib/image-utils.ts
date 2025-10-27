import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface OptimizedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
  filename: string;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size too large. Maximum 10MB allowed.' };
  }

  return { valid: true };
}

export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'webp'
  } = options;

  let sharpInstance = sharp(buffer);

  // Get original metadata
  const originalMetadata = await sharpInstance.metadata();

  // Resize if necessary
  if (originalMetadata.width && originalMetadata.width > maxWidth ||
      originalMetadata.height && originalMetadata.height > maxHeight) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Convert format and set quality
  if (format === 'jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality });
  } else if (format === 'png') {
    sharpInstance = sharpInstance.png({ quality });
  } else {
    sharpInstance = sharpInstance.webp({ quality });
  }

  const optimizedBuffer = await sharpInstance.toBuffer();
  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  // Generate filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = format;
  const filename = `optimized-${timestamp}-${random}.${extension}`;

  return {
    buffer: optimizedBuffer,
    metadata: {
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      format: optimizedMetadata.format || format,
      size: optimizedBuffer.length
    },
    filename
  };
}

export async function saveImage(
  buffer: Buffer,
  filename: string,
  subfolder: string = 'images'
): Promise<{ path: string; url: string }> {
  await ensureUploadDir();

  const fullPath = path.join(UPLOAD_DIR, subfolder, filename);
  const fullDir = path.dirname(fullPath);

  // Ensure subfolder exists
  await fs.mkdir(fullDir, { recursive: true });

  await fs.writeFile(fullPath, buffer);

  // Generate public URL (assuming uploads are served from /uploads)
  const url = `/uploads/${subfolder}/${filename}`;

  return { path: fullPath, url };
}

export async function deleteImage(imagePath: string): Promise<void> {
  try {
    await fs.unlink(imagePath);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export function generateImageUrl(filename: string, subfolder: string = 'images'): string {
  return `/uploads/${subfolder}/${filename}`;
}
