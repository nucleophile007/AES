import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkProgressReports() {
  try {
    console.log('=== PROGRESS REPORTS DEBUG ===\n');
    
    // 1. Check total reports
    const totalReports = await prisma.progressReport.count();
    console.log(`📊 Total progress reports: ${totalReports}\n`);
    
    if (totalReports === 0) {
      console.log('❌ NO REPORTS FOUND IN DATABASE!');
      console.log('   Please create some reports from the teacher dashboard first.\n');
      await prisma.$disconnect();
      return;
    }
    
    // 2. Check by status
    const byStatus = await prisma.progressReport.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    console.log('📈 Reports by status:');
    byStatus.forEach(s => {
      console.log(`   - ${s.status}: ${s._count.id}`);
    });
    console.log();
    
    // 3. Check published & visible
    const publishedVisible = await prisma.progressReport.count({
      where: {
        status: 'published',
        isVisible: true
      }
    });
    console.log(`✅ Published & Visible: ${publishedVisible}\n`);
    
    // 4. Get sample reports
    console.log('📄 Sample Reports:');
    const reports = await prisma.progressReport.findMany({
      take: 10,
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } }
      },
      orderBy: { reportDate: 'desc' }
    });
    
    reports.forEach((r, i) => {
      console.log(`\n${i + 1}. Report ID: ${r.id}`);
      console.log(`   Student: ${r.student.name} (${r.student.email})`);
      console.log(`   Teacher: ${r.teacher.name}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Visible: ${r.isVisible}`);
      console.log(`   Date: ${r.reportDate.toLocaleDateString()}`);
      console.log(`   Period: ${r.reportPeriod || 'N/A'}`);
    });
    
    // 5. Check students without reports
    const studentsWithReports = await prisma.student.findMany({
      where: {
        progressReports: {
          some: {
            status: 'published',
            isVisible: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            progressReports: true
          }
        }
      }
    });
    
    console.log('\n\n👥 Students WITH published reports:');
    if (studentsWithReports.length === 0) {
      console.log('   ❌ NONE - This is likely why students see no reports!');
    } else {
      studentsWithReports.forEach(s => {
        console.log(`   - ${s.name} (${s.email}): ${s._count.progressReports} reports`);
      });
    }
    
    // 6. Show draft reports that could be published
    const draftReports = await prisma.progressReport.count({
      where: { status: 'draft' }
    });
    
    if (draftReports > 0) {
      console.log(`\n\n⚠️  ${draftReports} DRAFT reports found!`);
      console.log('   These need to be PUBLISHED to be visible to students.');
      console.log('   Go to Teacher Dashboard → Progress Reports → Publish');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProgressReports();
