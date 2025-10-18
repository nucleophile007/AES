import { NextResponse } from 'next/server';

export function handlePrismaError(error: unknown) {
  console.error('Prisma error:', error);
  
  // Check if it's a Prisma initialization error
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('@prisma/client did not initialize') || 
      errorMessage.includes('PrismaClient is not defined')) {
      
    // Log additional debug information
    console.error('Prisma client initialization error. Debug info:');
    console.error('- Node environment:', process.env.NODE_ENV);
    console.error('- Prisma schema path:', process.env.PRISMA_SCHEMA_PATH || 'Not set');
    console.error('- Generated client path:', process.cwd() + '/generated/prisma');
    
    // Try to check if the generated files exist
    try {
      const fs = require('fs');
      const generatedFilesExist = fs.existsSync(process.cwd() + '/generated/prisma/index.js');
      console.error('- Generated files exist:', generatedFilesExist);
    } catch (e) {
      console.error('- Error checking generated files:', e);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection error. Try again later.',
        details: 'Server needs to run prisma generate. Please contact support.'
      }, 
      { status: 500 }
    );
  }
  
  // Check for specific known errors
  if (errorMessage.includes('users_view') || errorMessage.includes('relation "users_view" does not exist')) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database operation failed',
        details: 'The users_view does not exist. Run "npm run db:view" to create it.'
      }, 
      { status: 500 }
    );
  }
  
  // Generic database error
  return NextResponse.json(
    { 
      success: false, 
      error: 'Database operation failed',
      details: errorMessage
    }, 
    { status: 500 }
  );
}