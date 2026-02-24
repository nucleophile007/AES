/**
 * Database Check Script for Progress Reports
 * 
 * Run this in the terminal to check if progress reports exist in the database:
 * node scripts/check-progress-reports.js
 */

import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkProgressReports() {
  try {
    console.log('🔍 Checking Progress Reports in Database...\n');

    // Get all progress reports
    const allReports = await prisma.progressReport.findMany({
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        teacher: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total Progress Reports in Database: ${allReports.length}\n`);

    if (allReports.length === 0) {
      console.log('❌ No progress reports found in database.');
      console.log('\n💡 To create a test report:');
      console.log('   1. Login as teacher');
      console.log('   2. Use the ProgressReportForm component');
      console.log('   3. Or run: node scripts/create-sample-report.js\n');
      return;
    }

    // Show summary
    console.log('📋 Reports Summary:');
    console.log('─'.repeat(80));
    
    allReports.forEach((report, idx) => {
      console.log(`\nReport #${idx + 1}:`);
      console.log(`  ID: ${report.id}`);
      console.log(`  Student: ${report.student?.name} (ID: ${report.studentId})`);
      console.log(`  Teacher: ${report.teacher?.name} (ID: ${report.teacherId})`);
      console.log(`  Period: ${report.reportPeriod || 'N/A'}`);
      console.log(`  Subject: ${report.subject || 'N/A'}`);
      console.log(`  Status: ${report.status}`);
      console.log(`  Visible: ${report.isVisible ? 'Yes' : 'No'}`);
      console.log(`  Created: ${report.createdAt}`);
    });

    console.log('\n' + '─'.repeat(80));

    // Check published reports
    const publishedReports = allReports.filter(r => r.status === 'published' && r.isVisible);
    console.log(`\n✅ Published & Visible Reports: ${publishedReports.length}`);

    // Check draft reports
    const draftReports = allReports.filter(r => r.status === 'draft');
    console.log(`📝 Draft Reports: ${draftReports.length}`);

    // Check hidden reports
    const hiddenReports = allReports.filter(r => !r.isVisible);
    console.log(`👁️  Hidden Reports: ${hiddenReports.length}`);

    // Check by student
    console.log('\n👨‍🎓 Reports by Student:');
    const studentReports = {};
    allReports.forEach(report => {
      const studentName = report.student?.name || `Student ${report.studentId}`;
      if (!studentReports[studentName]) {
        studentReports[studentName] = { total: 0, published: 0, draft: 0 };
      }
      studentReports[studentName].total++;
      if (report.status === 'published' && report.isVisible) {
        studentReports[studentName].published++;
      } else if (report.status === 'draft') {
        studentReports[studentName].draft++;
      }
    });

    Object.entries(studentReports).forEach(([name, counts]) => {
      console.log(`  ${name}: ${counts.total} total (${counts.published} published, ${counts.draft} draft)`);
    });

    console.log('\n✨ Check complete!\n');

  } catch (error) {
    console.error('❌ Error checking progress reports:', error);
    if (error.message?.includes("Can't reach database")) {
      console.log('\n⚠️  Supabase appears to be under maintenance.');
      console.log('   Please wait for maintenance to complete and try again.');
      console.log('   Check status: https://status.supabase.com\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProgressReports();
