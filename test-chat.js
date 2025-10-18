// Test Chat Functionality

// Insert a few test messages in the database using the Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testMessages = async () => {
  try {
    // First, make sure we have a user view in the database
    // This would normally be handled by a database migration
    // For testing, we'll create sample messages between a teacher and student
    
    // Insert a test message from teacher to student
    const teacherToStudentMsg = await prisma.message.create({
      data: {
        senderId: 1, // Replace with an actual teacher ID from your database
        senderRole: 'teacher',
        recipientId: 1, // Replace with an actual student ID from your database
        recipientRole: 'student',
        content: 'This is a test message from teacher to student.',
      }
    });
    
    console.log('Teacher to student message created:', teacherToStudentMsg);
    
    // Insert a test message from student to teacher
    const studentToTeacherMsg = await prisma.message.create({
      data: {
        senderId: 1, // Replace with an actual student ID
        senderRole: 'student',
        recipientId: 1, // Replace with an actual teacher ID
        recipientRole: 'teacher',
        content: 'This is a test response from student to teacher.',
      }
    });
    
    console.log('Student to teacher message created:', studentToTeacherMsg);
    
    // Query and display all messages
    const messages = await prisma.message.findMany();
    console.log('All messages in the database:');
    console.log(JSON.stringify(messages, null, 2));
    
  } catch (error) {
    console.error('Error in test messages:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the test function
testMessages()
  .then(() => console.log('Test completed'))
  .catch(console.error);