#!/usr/bin/env node

/**
 * This script checks if the WebSocket server is running.
 * Run this script with: node scripts/check-socket.js
 */

import http from 'http';

const socketPort = process.env.SOCKET_PORT || 4000;

const req = http.request({
  hostname: 'localhost',
  port: socketPort,
  path: '/health',
  method: 'GET'
}, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ WebSocket server is running on port', socketPort);
      console.log('Response:', data);
    } else {
      console.log('❌ WebSocket server returned status code:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.log(`❌ WebSocket server is not running on port ${socketPort}`);
  console.log('Error:', error.message);
  console.log('\nStart the socket server with:');
  console.log('  npm run socket');
});

req.end();