import { PrismaClient } from '../generated/prisma/index.js';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Test token - generate a real one in your system
const TEST_TOKEN = 'your-test-token';

async function testScheduleAPI() {
  try {
    console.log('Testing Schedule API...');
    
    // Get a teacher and student for testing
    const teacher = await prisma.teacher.findFirst();
    const student = await prisma.student.findFirst({
      where: {
        teacherLinks: {
          some: {
            teacherId: teacher.id
          }
        }
      }
    });
    
    if (!teacher || !student) {
      console.log('No teacher or student found for testing');
      return;
    }
    
    console.log(`Using teacher: ${teacher.name} (ID: ${teacher.id})`);
    console.log(`Using student: ${student.name} (ID: ${student.id})`);
    
    // Create a test schedule
    const scheduleData = {
      title: "Test Math Class",
      description: "A test class for API testing",
      studentId: student.id,
      teacherId: teacher.id,
      subject: "Mathematics",
      program: student.program,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
      location: "Room 101",
      isRecurring: false
    };
    
    console.log('Creating test schedule...');
    const createResponse = await fetch('http://localhost:3000/api/teacher/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(scheduleData)
    });
    
    const createResult = await createResponse.json();
    console.log('Create result:', createResult);
    
    if (createResult.success && createResult.schedule) {
      console.log(`Schedule created with ID: ${createResult.schedule.id}`);
      
      // Fetch the schedule
      console.log('Fetching schedules...');
      const getResponse = await fetch(`http://localhost:3000/api/teacher/schedule?teacherEmail=${encodeURIComponent(teacher.email)}&studentId=${student.id}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      const getResult = await getResponse.json();
      console.log('Fetch result:', getResult);
      
      // Delete the test schedule
      if (createResult.schedule.id) {
        console.log(`Deleting schedule with ID: ${createResult.schedule.id}`);
        const deleteResponse = await fetch(`http://localhost:3000/api/teacher/schedule?id=${createResult.schedule.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        });
        
        const deleteResult = await deleteResponse.json();
        console.log('Delete result:', deleteResult);
      }
    }
    
    console.log('Testing completed');
  } catch (error) {
    console.error('Error testing Schedule API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScheduleAPI();