/**
 * Publish Draft Progress Reports
 * 
 * This script changes draft reports to published status
 * Run: node scripts/publish-draft-reports.js
 */

import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function publishDraftReports() {
  try {
    console.log('🔍 Finding draft progress reports...\n');

    // Get all draft reports
    const draftReports = await prisma.progressReport.findMany({
      where: {
        status: 'draft'
      },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        teacher: {
          select: { id: true, name: true }
        }
      }
    });

    if (draftReports.length === 0) {
      console.log('✅ No draft reports found. All reports are already published!');
      await prisma.$disconnect();
      return;
    }

    console.log(`📝 Found ${draftReports.length} draft report(s):\n`);

    draftReports.forEach((report, idx) => {
      console.log(`${idx + 1}. Report ID ${report.id}`);
      console.log(`   Student: ${report.student?.name} (${report.student?.email})`);
      console.log(`   Teacher: ${report.teacher?.name}`);
      console.log(`   Period: ${report.reportPeriod || 'Not specified'}`);
      console.log(`   Subject: ${report.subject || 'Not specified'}\n`);
    });

    console.log('🚀 Publishing all draft reports...\n');

    // Update all draft reports to published
    const result = await prisma.progressReport.updateMany({
      where: {
        status: 'draft'
      },
      data: {
        status: 'published',
        isVisible: true
      }
    });

    console.log(`✅ Successfully published ${result.count} report(s)!`);
    console.log('\n📱 Students and parents can now see these reports in their dashboards.\n');

    // Show updated reports
    const publishedReports = await prisma.progressReport.findMany({
      where: {
        status: 'published'
      },
      include: {
        student: {
          select: { name: true }
        }
      }
    });

    console.log(`📊 Total Published Reports: ${publishedReports.length}`);
    publishedReports.forEach((report) => {
      console.log(`  - ${report.student?.name}: ${report.reportPeriod || 'Report'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishDraftReports();
