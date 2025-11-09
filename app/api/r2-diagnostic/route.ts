import { NextRequest, NextResponse } from 'next/server';
import { r2Client, R2_CONFIG } from '../../../lib/r2';

export async function GET(request: NextRequest) {
  try {
    // Diagnostic information
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Environment variables (check if they exist, don't expose values)
      envVars: {
        R2_ENDPOINT: process.env.R2_ENDPOINT ? '✅ SET' : '❌ NOT SET',
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? '✅ SET' : '❌ NOT SET',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET',
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET',
        R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ? '✅ SET' : '❌ NOT SET',
      },
      
      // Show actual values (first/last 10 chars only for security)
      envVarValues: {
        R2_ENDPOINT: process.env.R2_ENDPOINT 
          ? `${process.env.R2_ENDPOINT.substring(0, 30)}...${process.env.R2_ENDPOINT.substring(process.env.R2_ENDPOINT.length - 10)}`
          : 'NOT SET',
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'NOT SET',
      },
      
      // R2 Client config
      r2ClientConfig: {
        region: R2_CONFIG.region,
        bucket: R2_CONFIG.bucket,
        publicUrl: R2_CONFIG.publicUrl ? `${R2_CONFIG.publicUrl.substring(0, 30)}...` : 'NOT SET',
      },
      
      // Git info
      vercelGitInfo: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'Not in Vercel',
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'Not in Vercel',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'Not in Vercel',
      }
    };
    
    return NextResponse.json({
      success: true,
      message: 'R2 Diagnostic Information',
      diagnostic,
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
