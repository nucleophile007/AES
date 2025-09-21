import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.teacherStudent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.assignment.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@acharya.edu',
        programs: ['Mathematics Tutoring', 'SAT Math', 'Academic Tutoring']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@acharya.edu',
        programs: ['Science Tutoring', 'College Prep', 'Academic Tutoring']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@acharya.edu',
        programs: ['English Tutoring', 'SAT English', 'College Prep']
      }
    }),
    prisma.teacher.create({
      data: {
        name: 'Mr. David Wilson',
        email: 'david.wilson@acharya.edu',
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
        grade: '11th Grade',
        schoolName: 'Lincoln High School',
        parentName: 'Sarah Davis',
        parentEmail: 'sarah.davis@gmail.com',
        parentPhone: '+1-555-0102',
        program: 'SAT Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Marcus Johnson',
        email: 'marcus.johnson@student.com',
        grade: '9th Grade',
        schoolName: 'Washington Middle School',
        parentName: 'Lisa Johnson',
        parentEmail: 'lisa.johnson@gmail.com',
        parentPhone: '+1-555-0103',
        program: 'Academic Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Sophia Lee',
        email: 'sophia.lee@student.com',
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
        grade: '9th Grade',
        schoolName: 'Monroe High School',
        parentName: 'Jennifer Wilson',
        parentEmail: 'jennifer.wilson@gmail.com',
        parentPhone: '+1-555-0107',
        program: 'Academic Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ava Garcia',
        email: 'ava.garcia@student.com',
        grade: '12th Grade',
        schoolName: 'Jackson High School',
        parentName: 'Carlos Garcia',
        parentEmail: 'carlos.garcia@gmail.com',
        parentPhone: '+1-555-0108',
        program: 'SAT Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Noah Anderson',
        email: 'noah.anderson@student.com',
        grade: '10th Grade',
        schoolName: 'Tyler High School',
        parentName: 'Amy Anderson',
        parentEmail: 'amy.anderson@gmail.com',
        parentPhone: '+1-555-0109',
        program: 'Science Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Mia Taylor',
        email: 'mia.taylor@student.com',
        grade: '11th Grade',
        schoolName: 'Van Buren High School',
        parentName: 'Michael Taylor',
        parentEmail: 'michael.taylor@gmail.com',
        parentPhone: '+1-555-0110',
        program: 'English Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Liam Thomas',
        email: 'liam.thomas@student.com',
        grade: '9th Grade',
        schoolName: 'Harrison High School',
        parentName: 'Susan Thomas',
        parentEmail: 'susan.thomas@gmail.com',
        parentPhone: '+1-555-0111',
        program: 'Mathematics Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Isabella Moore',
        email: 'isabella.moore@student.com',
        grade: '12th Grade',
        schoolName: 'Polk High School',
        parentName: 'James Moore',
        parentEmail: 'james.moore@gmail.com',
        parentPhone: '+1-555-0112',
        program: 'College Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'William Jackson',
        email: 'william.jackson@student.com',
        grade: '10th Grade',
        schoolName: 'Taylor High School',
        parentName: 'Patricia Jackson',
        parentEmail: 'patricia.jackson@gmail.com',
        parentPhone: '+1-555-0113',
        program: 'SAT Prep'
      }
    }),
    prisma.student.create({
      data: {
        name: 'Charlotte White',
        email: 'charlotte.white@student.com',
        grade: '11th Grade',
        schoolName: 'Fillmore High School',
        parentName: 'Christopher White',
        parentEmail: 'christopher.white@gmail.com',
        parentPhone: '+1-555-0114',
        program: 'Academic Tutoring'
      }
    }),
    prisma.student.create({
      data: {
        name: 'James Harris',
        email: 'james.harris@student.com',
        grade: '9th Grade',
        schoolName: 'Pierce High School',
        parentName: 'Linda Harris',
        parentEmail: 'linda.harris@gmail.com',
        parentPhone: '+1-555-0115',
        program: 'Science Tutoring'
      }
    })
  ]);

  console.log('👨‍🎓 Created students');

  // Create Teacher-Student relationships
  const teacherStudentRelations = [
    // Dr. Sarah Johnson (Math, SAT Math, Academic)
    { teacherId: teachers[0].id, studentId: students[0].id, program: 'Mathematics Tutoring' }, // Alex
    { teacherId: teachers[0].id, studentId: students[5].id, program: 'Mathematics Tutoring' }, // Olivia
    { teacherId: teachers[0].id, studentId: students[10].id, program: 'Mathematics Tutoring' }, // Liam
    { teacherId: teachers[0].id, studentId: students[1].id, program: 'SAT Math' }, // Emma
    { teacherId: teachers[0].id, studentId: students[7].id, program: 'SAT Math' }, // Ava
    { teacherId: teachers[0].id, studentId: students[12].id, program: 'SAT Math' }, // William
    { teacherId: teachers[0].id, studentId: students[2].id, program: 'Academic Tutoring' }, // Marcus
    { teacherId: teachers[0].id, studentId: students[6].id, program: 'Academic Tutoring' }, // Ethan
    
    // Prof. Michael Chen (Science, College Prep, Academic)
    { teacherId: teachers[1].id, studentId: students[4].id, program: 'Science Tutoring' }, // Ryan
    { teacherId: teachers[1].id, studentId: students[8].id, program: 'Science Tutoring' }, // Noah
    { teacherId: teachers[1].id, studentId: students[14].id, program: 'Science Tutoring' }, // James
    { teacherId: teachers[1].id, studentId: students[3].id, program: 'College Prep' }, // Sophia
    { teacherId: teachers[1].id, studentId: students[11].id, program: 'College Prep' }, // Isabella
    { teacherId: teachers[1].id, studentId: students[13].id, program: 'Academic Tutoring' }, // Charlotte
    
    // Dr. Emily Rodriguez (English, SAT English, College Prep)
    { teacherId: teachers[2].id, studentId: students[9].id, program: 'English Tutoring' }, // Mia
    { teacherId: teachers[2].id, studentId: students[1].id, program: 'SAT English' }, // Emma
    { teacherId: teachers[2].id, studentId: students[7].id, program: 'SAT English' }, // Ava
    { teacherId: teachers[2].id, studentId: students[12].id, program: 'SAT English' }, // William
    { teacherId: teachers[2].id, studentId: students[3].id, program: 'College Prep' }, // Sophia
    { teacherId: teachers[2].id, studentId: students[11].id, program: 'College Prep' }, // Isabella
    
    // Mr. David Wilson (Math, Science, SAT Math)
    { teacherId: teachers[3].id, studentId: students[0].id, program: 'Mathematics Tutoring' }, // Alex
    { teacherId: teachers[3].id, studentId: students[5].id, program: 'Mathematics Tutoring' }, // Olivia
    { teacherId: teachers[3].id, studentId: students[4].id, program: 'Science Tutoring' }, // Ryan
    { teacherId: teachers[3].id, studentId: students[8].id, program: 'Science Tutoring' }, // Noah
    { teacherId: teachers[3].id, studentId: students[1].id, program: 'SAT Math' }, // Emma
    { teacherId: teachers[3].id, studentId: students[12].id, program: 'SAT Math' }, // William
  ];

  await Promise.all(
    teacherStudentRelations.map(relation =>
      prisma.teacherStudent.create({ data: relation })
    )
  );

  console.log('🔗 Created teacher-student relationships');

  // Create enrollments for students
  const enrollments = [
    { studentId: students[0].id, program: 'Mathematics Tutoring', subject: 'Algebra II' },
    { studentId: students[1].id, program: 'SAT Prep', subject: 'Math & English' },
    { studentId: students[2].id, program: 'Academic Tutoring', subject: 'General Math' },
    { studentId: students[3].id, program: 'College Prep', subject: 'Advanced Placement' },
    { studentId: students[4].id, program: 'Science Tutoring', subject: 'Chemistry' },
    { studentId: students[5].id, program: 'Mathematics Tutoring', subject: 'Pre-Calculus' },
    { studentId: students[6].id, program: 'Academic Tutoring', subject: 'General Science' },
    { studentId: students[7].id, program: 'SAT Prep', subject: 'Math & English' },
    { studentId: students[8].id, program: 'Science Tutoring', subject: 'Physics' },
    { studentId: students[9].id, program: 'English Tutoring', subject: 'Literature' },
    { studentId: students[10].id, program: 'Mathematics Tutoring', subject: 'Geometry' },
    { studentId: students[11].id, program: 'College Prep', subject: 'Advanced Placement' },
    { studentId: students[12].id, program: 'SAT Prep', subject: 'Math & English' },
    { studentId: students[13].id, program: 'Academic Tutoring', subject: 'General Studies' },
    { studentId: students[14].id, program: 'Science Tutoring', subject: 'Biology' },
  ];

  await Promise.all(
    enrollments.map(enrollment =>
      prisma.enrollment.create({ data: enrollment })
    )
  );

  console.log('📚 Created student enrollments');

  // Create sample assignments (temporarily disabled due to schema changes)
  /*
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        title: 'Quadratic Equations Practice',
        description: 'Solve the given quadratic equations using factoring and the quadratic formula.',
        program: 'Mathematics Tutoring',
        subject: 'Algebra II',
        grade: '10th Grade',
        dueDate: new Date('2025-09-20'),
        totalPoints: 100
      }
    }),
    prisma.assignment.create({
      data: {
        title: 'SAT Math Practice Test 1',
        description: 'Complete sections 1-4 of the SAT Math practice test.',
        program: 'SAT Prep',
        subject: 'Math',
        grade: '11th Grade',
        dueDate: new Date('2025-09-22'),
        totalPoints: 150
      }
    }),
    prisma.assignment.create({
      data: {
        title: 'Chemical Bonding Lab Report',
        description: 'Write a detailed lab report on the chemical bonding experiment conducted in class.',
        program: 'Science Tutoring',
        subject: 'Chemistry',
        grade: '10th Grade',
        dueDate: new Date('2025-09-25'),
        totalPoints: 120
      }
    }),
    prisma.assignment.create({
      data: {
        title: 'College Essay Draft',
        description: 'Submit your first draft of your college application essay.',
        program: 'College Prep',
        subject: 'Advanced Placement',
        grade: '12th Grade',
        dueDate: new Date('2025-09-18'),
        totalPoints: 100
      }
    })
  ]);
  */

  // Temporary: Create empty assignments array to avoid undefined error
  const assignments: any[] = [];

  console.log('📝 Created assignments (disabled)');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Teachers: ${teachers.length}`);
  console.log(`- Students: ${students.length}`);
  console.log(`- Teacher-Student relationships: ${teacherStudentRelations.length}`);
  console.log(`- Enrollments: ${enrollments.length}`);
  console.log(`- Assignments: ${assignments.length}`);

  console.log('\n🔐 Login Credentials:');
  console.log('\n👨‍🏫 TEACHERS:');
  teachers.forEach((teacher, index) => {
    console.log(`${index + 1}. ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Password: teacher123`);
    console.log(`   Programs: ${teacher.programs.join(', ')}`);
    console.log('');
  });

  console.log('\n👨‍🎓 STUDENTS:');
  students.forEach((student, index) => {
    console.log(`${index + 1}. ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Password: student123`);
    console.log(`   Grade: ${student.grade}`);
    console.log(`   Program: ${student.program}`);
    console.log('');
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
