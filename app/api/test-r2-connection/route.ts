import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG } from '../../../lib/r2';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Testing R2 Connection ===');
    console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT);
    console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
    console.log('R2_ACCESS_KEY_ID exists:', !!process.env.R2_ACCESS_KEY_ID);

    // Try to list objects (requires read permission)
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucket,
      MaxKeys: 1
    });

    const response = await r2Client.send(listCommand);
    
    return NextResponse.json({
      success: true,
      message: 'R2 connection successful',
      bucketName: R2_CONFIG.bucket,
      objectCount: response.KeyCount || 0,
      canRead: true
    });

  } catch (error) {
    console.error('R2 connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        code: (error as any).Code || 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error',
        canRead: false
      }
    }, { status: 500 });
  }
}