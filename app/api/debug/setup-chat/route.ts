import { NextRequest, NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Get the root directory of the project
    const rootDir = path.resolve(process.cwd());
    const scriptPath = path.join(rootDir, 'scripts', 'setup-chat.js');

    console.log(`Running chat setup script at: ${scriptPath}`);

    // Execute the setup-chat.js script
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);

    console.log('Chat setup script output:', stdout);
    
    if (stderr) {
      console.error('Chat setup script error:', stderr);
      return NextResponse.json({
        success: false,
        error: "Chat setup encountered errors",
        stderr
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Chat system setup successfully!",
      details: stdout
    });
  } catch (error) {
    console.error('Error running chat setup script:', error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to run chat setup script",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}