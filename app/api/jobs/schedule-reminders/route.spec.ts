import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const routePath = path.resolve(process.cwd(), 'app/api/jobs/schedule-reminders/route.ts');

describe('schedule reminders route configuration', () => {
  const sourceCode = fs.readFileSync(routePath, 'utf8');

  it('reads lead minutes from SCHEDULE_REMINDER_LEAD_MINUTES with a safe default', () => {
    expect(sourceCode).toContain("parsePositiveInt(process.env.SCHEDULE_REMINDER_LEAD_MINUTES, 60)");
  });

  it('reads reminder window and batch limit from environment with defaults', () => {
    expect(sourceCode).toContain("parsePositiveInt(process.env.SCHEDULE_REMINDER_WINDOW_MINUTES, 5)");
    expect(sourceCode).toContain("parsePositiveInt(process.env.SCHEDULE_REMINDER_BATCH_LIMIT, 100)");
  });

  it('supports toggling skip-google-managed behavior via env var', () => {
    expect(sourceCode).toContain("process.env.SCHEDULE_REMINDER_SKIP_WHEN_GOOGLE_EVENT !== 'false'");
  });
});
