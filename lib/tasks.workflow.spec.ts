import { describe, expect, it } from 'vitest';
import {
  canMentorPerform,
  canStudentPerform,
  getMissingRequirements,
  isAllowedTaskUpload,
  isSafeHttpUrl,
  isTaskUploadUrl,
  taskHasSubmissionRequirements,
} from './tasks';

const noRequirements = {
  requireSubmissionNote: false,
  requireFileUpload: false,
  requireUrl: false,
  requireExternalConfirmation: false,
};

describe('Task workflow rules', () => {
  it('lets students work only on open tasks', () => {
    expect(canStudentPerform('START', 'TODO')).toBe(true);
    expect(canStudentPerform('START', 'IN_PROGRESS')).toBe(false);

    for (const action of ['SAVE_DRAFT', 'SUBMIT', 'COMPLETE_DIRECT'] as const) {
      expect(canStudentPerform(action, 'TODO')).toBe(true);
      expect(canStudentPerform(action, 'IN_PROGRESS')).toBe(true);
      expect(canStudentPerform(action, 'CHANGES_REQUESTED')).toBe(true);
      expect(canStudentPerform(action, 'SUBMITTED')).toBe(false);
      expect(canStudentPerform(action, 'COMPLETED')).toBe(false);
    }
  });

  it('lets mentors review only submitted or completed work', () => {
    expect(canMentorPerform('APPROVE', 'SUBMITTED')).toBe(true);
    expect(canMentorPerform('APPROVE', 'TODO')).toBe(false);
    expect(canMentorPerform('APPROVE', 'IN_PROGRESS')).toBe(false);
    expect(canMentorPerform('APPROVE', 'COMPLETED')).toBe(false);

    expect(canMentorPerform('REQUEST_CHANGES', 'SUBMITTED')).toBe(true);
    expect(canMentorPerform('REQUEST_CHANGES', 'COMPLETED')).toBe(true);
    expect(canMentorPerform('REQUEST_CHANGES', 'TODO')).toBe(false);

    expect(canMentorPerform('REOPEN', 'COMPLETED')).toBe(true);
    expect(canMentorPerform('REOPEN', 'IN_PROGRESS')).toBe(false);
  });

  it('rejects unknown actions and statuses', () => {
    expect(canStudentPerform('HACK' as never, 'TODO')).toBe(false);
    expect(canMentorPerform('APPROVE', 'WHATEVER')).toBe(false);
  });
});

describe('Task requirements', () => {
  it('detects when a task has submission requirements', () => {
    expect(taskHasSubmissionRequirements(noRequirements)).toBe(false);
    expect(taskHasSubmissionRequirements({ ...noRequirements, requireFileUpload: true })).toBe(true);
  });

  it('lists every missing requirement', () => {
    const task = {
      requireSubmissionNote: true,
      requireFileUpload: true,
      requireUrl: true,
      requireExternalConfirmation: true,
      externalConfirmationPrompt: 'I registered for the SAT',
    };
    expect(getMissingRequirements(task, { note: '  ' })).toEqual([
      'a submission note / description',
      'a file or screenshot upload',
      'a valid submission URL',
      'I registered for the SAT',
    ]);
    expect(
      getMissingRequirements(task, {
        note: 'Done',
        fileUrl: 'https://files.example.com/tasks/x.pdf',
        url: 'https://collegeboard.org',
        externalConfirmed: true,
      })
    ).toEqual([]);
  });
});

describe('Link and upload validation', () => {
  it('accepts only http(s) URLs', () => {
    expect(isSafeHttpUrl('https://example.com/a')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeHttpUrl('not a url')).toBe(false);
    expect(isSafeHttpUrl('')).toBe(false);
    expect(isSafeHttpUrl(null)).toBe(false);
  });

  it('accepts only files from our task upload storage', () => {
    const base = 'https://pub-abc.r2.dev/';
    expect(isTaskUploadUrl('https://pub-abc.r2.dev/tasks/student/1/x.pdf', base)).toBe(true);
    expect(isTaskUploadUrl('https://pub-abc.r2.dev/resources/x.pdf', base)).toBe(false);
    expect(isTaskUploadUrl('https://evil.example/tasks/x.pdf', base)).toBe(false);
    expect(isTaskUploadUrl('https://pub-abc.r2.dev.evil.example/tasks/x.pdf', base)).toBe(false);
    expect(isTaskUploadUrl('https://pub-abc.r2.dev/tasks/x.pdf', undefined)).toBe(false);
  });

  it('allows common document and image types only', () => {
    expect(isAllowedTaskUpload('essay.pdf', 'application/pdf')).toBe(true);
    expect(isAllowedTaskUpload('proof.JPG', 'image/jpeg')).toBe(true);
    expect(isAllowedTaskUpload('page.html', 'text/html')).toBe(false);
    expect(isAllowedTaskUpload('icon.svg', 'image/svg+xml')).toBe(false);
    expect(isAllowedTaskUpload('fake.pdf', 'text/html')).toBe(false);
    expect(isAllowedTaskUpload('script.exe', 'application/pdf')).toBe(false);
  });
});
