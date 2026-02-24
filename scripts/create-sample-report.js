/**
 * Create Sample Progress Report Script
 * 
 * This script creates a sample progress report in the database
 * Usage: node scripts/create-sample-report.js <studentId> <teacherId>
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function createSampleReport(studentId, teacherId) {
  try {
    console.log('🎯 Creating sample progress report...\n');

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) }
    });

    if (!student) {
      console.error(`❌ Student with ID ${studentId} not found`);
      return;
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) }
    });

    if (!teacher) {
      console.error(`❌ Teacher with ID ${teacherId} not found`);
      return;
    }

    console.log(`Student: ${student.name} (${student.email})`);
    console.log(`Teacher: ${teacher.name} (${teacher.email})\n`);

    // Create the report
    const report = await prisma.progressReport.create({
      data: {
        studentId: parseInt(studentId),
        teacherId: parseInt(teacherId),
        reportPeriod: "January 2026",
        subject: "Mathematics",
        overallProgress: "Excellent progress this month! The student has shown exceptional understanding of advanced concepts and demonstrates strong problem-solving abilities. They consistently participate in class discussions and help their peers understand complex topics.",
        progressRating: 9,
        attendanceRate: 95.5,
        homeworkCompletion: 98.0,
        milestonesAchieved: JSON.stringify([
          "Completed advanced calculus module with distinction",
          "Won regional mathematics competition",
          "Perfect score on midterm examination",
          "Presented research project to class"
        ]),
        publications: JSON.stringify([
          "Research paper: 'Introduction to Number Theory'",
          "Blog post: 'Understanding Complex Numbers'"
        ]),
        skillsImproved: JSON.stringify([
          "Problem-solving techniques",
          "Critical thinking",
          "Time management",
          "Analytical reasoning",
          "Mathematical proof writing"
        ]),
        strengthsAreas: JSON.stringify([
          "Quick learner with strong mathematical foundation",
          "Excellent analytical and problem-solving skills",
          "Very proactive in seeking additional challenges",
          "Natural leadership in group activities"
        ]),
        improvementAreas: JSON.stringify([
          "Could improve on showing detailed work step-by-step",
          "Time management during timed assessments"
        ]),
        nextSteps: JSON.stringify([
          "Begin linear algebra module",
          "Practice AMC competition problems",
          "Start preparing for Math Olympiad",
          "Read 'Principles of Mathematical Analysis'",
          "Work on capstone project proposal"
        ]),
        recommendations: "The student is performing exceptionally well and is ready for more advanced topics. I highly recommend enrolling in the honors mathematics track and considering participation in national mathematics competitions. Their passion and dedication are exemplary.",
        parentNotes: "Your child is excelling in the mathematics program! We are incredibly proud of their progress, dedication, and enthusiasm. They demonstrate genuine passion for mathematics and consistently go above and beyond expectations. Please continue to encourage their curiosity and love for learning!",
        classParticipation: "Highly engaged during all class sessions. Consistently asks insightful questions that deepen class discussions. Frequently volunteers to help peers understand complex concepts. Perfect attendance record and always comes well-prepared. A model student.",
        status: "published",
        isVisible: true,
        reportDate: new Date()
      },
      include: {
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } }
      }
    });

    console.log('✅ Progress Report Created Successfully!\n');
    console.log('Report Details:');
    console.log('─'.repeat(60));
    console.log(`ID: ${report.id}`);
    console.log(`Student: ${report.student.name}`);
    console.log(`Teacher: ${report.teacher.name}`);
    console.log(`Period: ${report.reportPeriod}`);
    console.log(`Subject: ${report.subject}`);
    console.log(`Status: ${report.status}`);
    console.log(`Visible: ${report.isVisible}`);
    console.log(`Rating: ${report.progressRating}/10`);
    console.log(`Attendance: ${report.attendanceRate}%`);
    console.log(`Homework: ${report.homeworkCompletion}%`);
    console.log('─'.repeat(60));
    console.log('\n🎉 The student can now see this report in their dashboard!');
    console.log('   (Make sure they refresh the page)\n');

    return report;

  } catch (error) {
    console.error('❌ Error creating progress report:', error);
    if (error.message?.includes("Can't reach database")) {
      console.log('\n⚠️  Supabase appears to be under maintenance.');
      console.log('   Please wait for maintenance to complete and try again.');
      console.log('   Check status: https://status.supabase.com\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/create-sample-report.js <studentId> <teacherId>');
  console.log('Example: node scripts/create-sample-report.js 6 5\n');
  process.exit(1);
}

const [studentId, teacherId] = args;
createSampleReport(studentId, teacherId);
