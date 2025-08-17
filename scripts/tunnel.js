const ngrok = require('ngrok');

async function createTunnel() {
  try {
    const url = await ngrok.connect({
      addr: 3000,
      subdomain: 'aes-booking', // Remove this line if you don't have ngrok pro
      inspect: true
    });
    
    console.log('🚀 Tunnel created!');
    console.log('📱 Public URL:', url);
    console.log('🔍 Inspector:', url.replace('https://', 'http://127.0.0.1:4040/inspect/'));
    
    return url;
  } catch (error) {
    console.error('❌ Error creating tunnel:', error.message);
  }
}

createTunnel();
