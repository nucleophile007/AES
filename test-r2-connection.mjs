// Test R2 connection
import { r2Client, R2_CONFIG } from './lib/r2.js';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

async function testR2Connection() {
  try {
    console.log('Testing R2 connection...');
    console.log('Endpoint:', process.env.R2_ENDPOINT);
    console.log('Bucket:', process.env.R2_BUCKET_NAME);
    console.log('Access Key exists:', !!process.env.R2_ACCESS_KEY_ID);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucket,
      MaxKeys: 1
    });
    
    const response = await r2Client.send(command);
    console.log('✅ R2 connection successful!');
    console.log('Objects in bucket:', response.KeyCount || 0);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('Sample object:', response.Contents[0].Key);
    }
    
  } catch (error) {
    console.error('❌ R2 connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.Code);
    console.error('Details:', error);
  }
}

testR2Connection();