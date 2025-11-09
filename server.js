import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
// Use port 4000 for the socket server to avoid conflict with Next.js dev server
const port = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT, 10) : 4000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create a simple HTTP server for Socket.io only
  const server = createServer((req, res) => {
    // Simple CORS handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Simple health check endpoint
    if (req.url === '/health') {
      res.writeHead(200);
      res.end('Socket server is running');
      return;
    }
    
    // For all other requests, return 404
    res.writeHead(404);
    res.end('Not found');
  });

  // Initialize Socket.IO with the HTTP server
  initSocketServer(server);

  // Start listening
  server.listen(port, () => {
    console.log(`> Socket.io server ready on http://${hostname}:${port}`);
    console.log(`> Make sure to set NEXT_PUBLIC_SOCKET_URL=http://${hostname}:${port} in your .env`);
  });
});