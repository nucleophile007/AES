import { afterEach, describe, expect, it, vi } from 'vitest';
import { parentAssignmentEmailsEnabled, uniqueRecipients } from './academic-notifications';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('academic notification recipients', () => {
  it('normalizes and deduplicates recipient email addresses', () => {
    expect(uniqueRecipients([
      { email: ' Student@Example.com ', name: 'Student' },
      { email: 'student@example.com', name: 'Duplicate' },
      { email: '', name: 'Missing' },
    ])).toEqual([{ email: 'student@example.com', name: 'Student' }]);
  });

  it('enables parent assignment messages by default', () => {
    vi.stubEnv('EMAIL_PARENTS_ON_ASSIGNMENTS', '');
    expect(parentAssignmentEmailsEnabled()).toBe(true);
  });

  it('allows parent assignment messages to be disabled', () => {
    vi.stubEnv('EMAIL_PARENTS_ON_ASSIGNMENTS', 'false');
    expect(parentAssignmentEmailsEnabled()).toBe(false);
  });
});
