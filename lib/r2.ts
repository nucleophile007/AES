import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 configuration
// R2 uses S3-compatible API, so we use the AWS SDK with R2 endpoints
export const r2Client = new S3Client({
  region: "auto", // R2 uses "auto" as the region
  endpoint: process.env.R2_ENDPOINT, // Your R2 endpoint URL
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // Important: Force path-style URLs for R2 compatibility
  forcePathStyle: false,
  // Additional R2-specific configuration
  signingRegion: "auto",
});

// R2 bucket configuration
export const R2_CONFIG = {
  bucket: process.env.R2_BUCKET_NAME!,
  region: "auto",
  // R2 public URL format: https://pub-{bucket-id}.r2.dev/{object-key}
  // Or custom domain: https://your-domain.com/{object-key}
  publicUrl: process.env.R2_PUBLIC_URL!, // e.g., "https://pub-abc123.r2.dev" or your custom domain
} as const;

// Utility function to get the public URL for an uploaded file
export function getR2PublicUrl(key: string): string {
  return `${R2_CONFIG.publicUrl}/${key}`;
}

// Utility function to generate a unique file key with better organization
export function generateFileKey(studentId: number, assignmentId: number, originalFileName: string, submissionNumber: number = 1): string {
  const timestamp = Date.now();
  const fileExtension = originalFileName.split('.').pop() || '';
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Organized structure: submissions/studentId/assignmentId/submissionNumber_timestamp_filename
  return `submissions/${studentId}/${assignmentId}/${submissionNumber}_${timestamp}_${sanitizedFileName}`;
}

// Utility function to generate resource file key
export function generateResourceKey(teacherId: number, resourceType: string, originalFileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Organized structure: resources/teacherId/type/timestamp_filename
  return `resources/${teacherId}/${resourceType}/${timestamp}_${sanitizedFileName}`;
}

// Utility function to delete old file when replacing
export async function deleteR2File(fileKey: string): Promise<boolean> {
  try {
    const deleteCommand = {
      Bucket: R2_CONFIG.bucket,
      Key: fileKey,
    };
    
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    await r2Client.send(new DeleteObjectCommand(deleteCommand));
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
}

// Utility function to extract file key from URL
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    const publicUrlParts = R2_CONFIG.publicUrl.split('/');
    
    // Find where the public URL ends and the file key begins
    const startIndex = publicUrlParts.length - 1;
    return urlParts.slice(startIndex + 1).join('/');
  } catch (error) {
    console.error('Error extracting file key from URL:', error);
    return null;
  }
}

// File type validation
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File) {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    throw new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size is 10MB');
  }

  return true;
}