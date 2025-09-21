const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
  try {
    // Create a test file
    fs.writeFileSync('test-upload.txt', 'This is a test file for R2 upload');
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('test-upload.txt'));
    form.append('studentId', '1');
    form.append('assignmentId', '1');
    
    console.log('Testing R2 upload endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/upload-r2', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Success response:', response.data);
    
  } catch (error) {
    console.error('Error occurred:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  } finally {
    // Clean up
    if (fs.existsSync('test-upload.txt')) {
      fs.unlinkSync('test-upload.txt');
    }
  }
}

testUpload();