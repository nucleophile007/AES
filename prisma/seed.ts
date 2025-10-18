import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // Hash passwords
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.studentSubmissionRemark.deleteMany();
  await prisma.studentSubmission.deleteMany();
  await prisma.teacherStudent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@aesteacher.com',
        password: teacherPassword,
        programs: ['Mathematics', 'SAT Coaching']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@aesteacher.com',
        password: teacherPassword,
        programs: ['Physics', 'Science Tutoring']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Ms. Emily Rodriguez',
        email: 'emily.rodriguez@aesteacher.com',
        password: teacherPassword,
        programs: ['English Literature', 'College Prep']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Mr. David Wilson',
        email: 'david.wilson@acharya.edu',
        password: teacherPassword,
        programs: ['Mathematics Tutoring', 'Science Tutoring', 'SAT Math']
      }
    })
  ]);

  console.log('👨‍🏫 Created teachers');

  // Create Students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Alex Thompson',
        email: 'alex.thompson@student.com',
        password: studentPassword,
        grade: '10th Grade',
        schoolName: 'Roosevelt High School',
        parentName: 'John Thompson',
        parentEmail: 'john.thompson@gmail.com',
        parentPhone: '+1-555-0101',
        program: 'Mathematics Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Emma Davis',
        email: 'emma.davis@student.com',
        password: studentPassword,
        grade: '11th Grade',
        schoolName: 'Lincoln High School',
        parentName: 'Sarah Davis',
        parentEmail: 'sarah.davis@gmail.com',
        parentPhone: '+1-555-0102',
        program: 'SAT Coaching'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Liam Johnson',
        email: 'liam.johnson@student.com',
        password: studentPassword,
        grade: '12th Grade',
        schoolName: 'Washington High School',
        parentName: 'Michael Johnson',
        parentEmail: 'michael.johnson@gmail.com',
        parentPhone: '+1-555-0103',
        program: 'College Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Sophia Lee',
        email: 'sophia.lee@student.com',
        password: studentPassword,
        grade: '12th Grade',
        schoolName: 'Jefferson High School',
        parentName: 'David Lee',
        parentEmail: 'david.lee@gmail.com',
        parentPhone: '+1-555-0104',
        program: 'College Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ryan Martinez',
        email: 'ryan.martinez@student.com',
        password: studentPassword,
        grade: '10th Grade',
        schoolName: 'Adams High School',
        parentName: 'Maria Martinez',
        parentEmail: 'maria.martinez@gmail.com',
        parentPhone: '+1-555-0105',
        program: 'Science Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Olivia Brown',
        email: 'olivia.brown@student.com',
        password: studentPassword,
        grade: '11th Grade',
        schoolName: 'Madison High School',
        parentName: 'Robert Brown',
        parentEmail: 'robert.brown@gmail.com',
        parentPhone: '+1-555-0106',
        program: 'Mathematics Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ethan Wilson',
        email: 'ethan.wilson@student.com',
        password: studentPassword,
        grade: '9th Grade',
        schoolName: 'Lincoln High School',
        parentName: 'Jennifer Wilson',
        parentEmail: 'jennifer.wilson@gmail.com',
        parentPhone: '+1-555-0107',
        program: 'SAT Coaching'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Isabella Garcia',
        email: 'isabella.garcia@student.com',
        password: studentPassword,
        grade: '12th Grade',
        schoolName: 'Roosevelt High School',
        parentName: 'Carlos Garcia',
        parentEmail: 'carlos.garcia@gmail.com',
        parentPhone: '+1-555-0108',
        program: 'College Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Mason Taylor',
        email: 'mason.taylor@student.com',
        password: studentPassword,
        grade: '10th Grade',
        schoolName: 'Washington High School',
        parentName: 'Lisa Taylor',
        parentEmail: 'lisa.taylor@gmail.com',
        parentPhone: '+1-555-0109',
        program: 'Science Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ava Anderson',
        email: 'ava.anderson@student.com',
        password: studentPassword,
        grade: '11th Grade',
        schoolName: 'Jefferson High School',
        parentName: 'Mark Anderson',
        parentEmail: 'mark.anderson@gmail.com',
        parentPhone: '+1-555-0110',
        program: 'Mathematics Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Noah Clark',
        email: 'noah.clark@student.com',
        password: studentPassword,
        grade: '9th Grade',
        schoolName: 'Adams High School',
        parentName: 'Jessica Clark',
        parentEmail: 'jessica.clark@gmail.com',
        parentPhone: '+1-555-0111',
        program: 'SAT Coaching'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Mia Rodriguez',
        email: 'mia.rodriguez@student.com',
        password: studentPassword,
        grade: '12th Grade',
        schoolName: 'Madison High School',
        parentName: 'Luis Rodriguez',
        parentEmail: 'luis.rodriguez@gmail.com',
        parentPhone: '+1-555-0112',
        program: 'College Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Lucas White',
        email: 'lucas.white@student.com',
        password: studentPassword,
        grade: '10th Grade',
        schoolName: 'Roosevelt High School',
        parentName: 'Amanda White',
        parentEmail: 'amanda.white@gmail.com',
        parentPhone: '+1-555-0113',
        program: 'Science Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Charlotte Miller',
        email: 'charlotte.miller@student.com',
        password: studentPassword,
        grade: '11th Grade',
        schoolName: 'Washington High School',
        parentName: 'Brian Miller',
        parentEmail: 'brian.miller@gmail.com',
        parentPhone: '+1-555-0114',
        program: 'Mathematics Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Benjamin Harris',
        email: 'benjamin.harris@student.com',
        password: studentPassword,
        grade: '9th Grade',
        schoolName: 'Lincoln High School',
        parentName: 'Rachel Harris',
        parentEmail: 'rachel.harris@gmail.com',
        parentPhone: '+1-555-0115',
        program: 'SAT Coaching'
      }
    })
  ]);

  console.log('👨‍🎓 Created students');

  // Create Teacher-Student relationships
  const teacherStudentRelations = await Promise.all([
    // Dr. Sarah Johnson (Math) with math students
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[0].id, // Dr. Sarah Johnson
        studentId: students[0].id, // Alex Thompson
        assignedAt: new Date(),
        program: "Mathematics Tutoring"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[0].id, // Dr. Sarah Johnson
        studentId: students[5].id, // Olivia Brown
        assignedAt: new Date(),
        program: "Mathematics Tutoring"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[0].id, // Dr. Sarah Johnson
        studentId: students[9].id, // Ava Anderson
        assignedAt: new Date(),
        program: "Mathematics Tutoring"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[0].id, // Dr. Sarah Johnson
        studentId: students[13].id, // Charlotte Miller
        assignedAt: new Date(),
        program: "Mathematics Tutoring"
      }
    }),

    // Prof. Michael Chen (Physics/Science) with science students
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[1].id, // Prof. Michael Chen
        studentId: students[4].id, // Ryan Martinez
        assignedAt: new Date(),
        program: "Science Tutoring"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[1].id, // Prof. Michael Chen
        studentId: students[8].id, // Mason Taylor
        assignedAt: new Date(),
        program: "Science Tutoring"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[1].id, // Prof. Michael Chen
        studentId: students[12].id, // Lucas White
        assignedAt: new Date(),
        program: "Science Tutoring"
      }
    }),

    // Ms. Emily Rodriguez (English/College Prep) with college prep students
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[2].id, // Ms. Emily Rodriguez
        studentId: students[2].id, // Liam Johnson
        assignedAt: new Date(),
        program: "College Prep"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[2].id, // Ms. Emily Rodriguez
        studentId: students[3].id, // Sophia Lee
        assignedAt: new Date(),
        program: "College Prep"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[2].id, // Ms. Emily Rodriguez
        studentId: students[7].id, // Isabella Garcia
        assignedAt: new Date(),
        program: "College Prep"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[2].id, // Ms. Emily Rodriguez
        studentId: students[11].id, // Mia Rodriguez
        assignedAt: new Date(),
        program: "College Prep"
      }
    }),

    // Mr. David Wilson (Math/Science/SAT) with SAT students
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[3].id, // Mr. David Wilson
        studentId: students[1].id, // Emma Davis
        assignedAt: new Date(),
        program: "SAT Coaching"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[3].id, // Mr. David Wilson
        studentId: students[6].id, // Ethan Wilson
        assignedAt: new Date(),
        program: "SAT Coaching"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[3].id, // Mr. David Wilson
        studentId: students[10].id, // Noah Clark
        assignedAt: new Date(),
        program: "SAT Coaching"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[3].id, // Mr. David Wilson
        studentId: students[14].id, // Benjamin Harris
        assignedAt: new Date(),
        program: "SAT Coaching"
      }
    }),

    // Cross-assignments for some students with multiple teachers
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[3].id, // Mr. David Wilson (SAT Math)
        studentId: students[0].id, // Alex Thompson (also with Dr. Sarah for regular math)
        assignedAt: new Date(),
        program: "SAT Math"
      }
    }),
    prisma.teacherStudent.create({
      data: {
        teacherId: teachers[1].id, // Prof. Michael Chen (Science)
        studentId: students[2].id, // Liam Johnson (also with Ms. Emily for college prep)
        assignedAt: new Date(),
        program: "Science Tutoring"
      }
    }),
  ]);

  console.log('🔗 Created teacher-student relationships');

  // Create Student Submissions
  const submissions = await Promise.all([
    prisma.studentSubmission.create({
      data: {
        title: 'Algebra Homework Assignment',
        description: 'Solutions to Chapter 5 quadratic equations problems',
        fileUrl: 'https://example.com/submissions/algebra-homework-alex.pdf',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        studentId: students[0].id, // Alex Thompson
        teacherIds: [teachers[0].id] // Dr. Sarah Johnson
      }
    }),
    prisma.studentSubmission.create({
      data: {
        title: 'Physics Lab Report',
        description: 'Experiment on projectile motion with data analysis',
        fileUrl: 'https://example.com/submissions/physics-lab-ryan.pdf',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        studentId: students[4].id, // Ryan Martinez
        teacherIds: [teachers[1].id] // Prof. Michael Chen
      }
    }),
    prisma.studentSubmission.create({
      data: {
        title: 'College Essay Draft',
        description: 'Personal statement for university applications',
        fileUrl: 'https://example.com/submissions/college-essay-liam.docx',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        studentId: students[2].id, // Liam Johnson
        teacherIds: [teachers[2].id] // Ms. Emily Rodriguez
      }
    }),
    prisma.studentSubmission.create({
      data: {
        title: 'SAT Math Practice Test',
        description: 'Practice test results and problem areas identified',
        fileUrl: 'https://example.com/submissions/sat-practice-emma.pdf',
        submittedAt: new Date(), // Today
        studentId: students[1].id, // Emma Davis
        teacherIds: [teachers[3].id] // Mr. David Wilson
      }
    })
  ]);

  console.log('📄 Created student submissions');

  // Create Teacher Remarks on Submissions
  const remarks = await Promise.all([
    prisma.studentSubmissionRemark.create({
      data: {
        remark: 'Excellent work on the algebraic solutions! Your step-by-step approach is very clear. Focus more on checking your final answers.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        studentSubmissionId: submissions[0].id,
        teacherId: teachers[0].id // Dr. Sarah Johnson
      }
    }),
    prisma.studentSubmissionRemark.create({
      data: {
        remark: 'Great experimental design and data collection. Your analysis shows good understanding of physics principles. Consider adding error analysis.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        studentSubmissionId: submissions[1].id,
        teacherId: teachers[1].id // Prof. Michael Chen
      }
    }),
    prisma.studentSubmissionRemark.create({
      data: {
        remark: 'Your essay has a strong personal voice and compelling narrative. Work on the conclusion to better tie your experiences to your future goals.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        studentSubmissionId: submissions[2].id,
        teacherId: teachers[2].id // Ms. Emily Rodriguez
      }
    }),
    prisma.studentSubmissionRemark.create({
      data: {
        remark: 'Good progress on SAT math! Your algebra skills are strong. We should focus on geometry and data analysis in our next session.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        studentSubmissionId: submissions[3].id,
        teacherId: teachers[3].id // Mr. David Wilson
      }
    }),
    prisma.studentSubmissionRemark.create({
      data: {
        remark: 'Your experimental methodology shows good scientific thinking. Consider expanding your error analysis section.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        studentSubmissionId: submissions[1].id, // Ryan's physics lab
        teacherId: teachers[0].id // Dr. Sarah Johnson - cross-subject feedback
      }
    })
  ]);

  console.log('💬 Created teacher remarks');

  // Helper function to map program to subject
  function getSubjectFromProgram(program: string): string {
    const programToSubject: { [key: string]: string } = {
      'Mathematics Tutoring': 'Mathematics',
      'Science Tutoring': 'Science',
      'SAT Coaching': 'SAT Prep',
      'College Prep': 'English Literature'
    };
    return programToSubject[program] || 'General';
  }

  // Create some sample enrollments for completeness
  const enrollments = await Promise.all(
    students.map(student => 
      prisma.enrollment.create({
        data: {
          studentId: student.id,
          program: student.program,
          subject: getSubjectFromProgram(student.program),
          startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
          isActive: true
        }
      })
    )
  );

  console.log('📚 Created enrollments');

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created:`);
  console.log(`- ${teachers.length} teachers`);
  console.log(`- ${students.length} students`);
  console.log(`- ${teacherStudentRelations.length} teacher-student relationships`);
  console.log(`- ${enrollments.length} enrollments`);
  console.log(`- ${submissions.length} student submissions`);
  console.log(`- ${remarks.length} teacher remarks`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });