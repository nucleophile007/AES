import { describe, expect, it } from 'vitest';
import {
  countUnfinishedChecklistSteps,
  getMissingRequirements,
  requiresChecklistCompletion,
  taskHasSubmissionRequirements,
  averageReviewHours,
  computeStudentInsights,
  extractMentions,
  getChecklistProgress,
  isTaskStuck,
  nextOccurrenceDate,
  normalizeChecklist,
  readChecklistDone,
  sanitizeFilterQuery,
  toCsv,
} from './tasks';

describe('checklists', () => {
  it('normalizes input, keeps valid ids, drops blanks, caps length', () => {
    const items = normalizeChecklist([{ id: 'abc', title: '  Draft essay ' }, '', 'Get feedback', { title: 42 }]);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ id: 'abc', title: 'Draft essay' });
    expect(items[1].title).toBe('Get feedback');
    expect(items[1].id).toMatch(/^[a-z0-9]+$/i);
    expect(normalizeChecklist(Array.from({ length: 50 }, (_, i) => `step ${i}`))).toHaveLength(30);
    expect(normalizeChecklist('nope')).toEqual([]);
  });

  it('replaces duplicate or malformed ids', () => {
    const items = normalizeChecklist([{ id: 'x', title: 'a' }, { id: 'x', title: 'b' }, { id: 'bad id!', title: 'c' }]);
    expect(new Set(items.map((i) => i.id)).size).toBe(3);
  });

  it('ignores completion ids that are no longer in the checklist', () => {
    const list = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }];
    expect(readChecklistDone(['a', 'zzz', 'a', 5], list)).toEqual(['a']);
    expect(getChecklistProgress(list, ['b', 'gone'])).toEqual({ done: 1, total: 2 });
    expect(getChecklistProgress(null, null)).toEqual({ done: 0, total: 0 });
  });
});

describe('recurrence', () => {
  const base = new Date(Date.UTC(2026, 0, 31, 17, 0));
  it('adds weeks', () => {
    expect(nextOccurrenceDate(base, 'WEEKLY').toISOString()).toBe('2026-02-07T17:00:00.000Z');
    expect(nextOccurrenceDate(base, 'BIWEEKLY').toISOString()).toBe('2026-02-14T17:00:00.000Z');
  });
  it('clamps monthly to the end of shorter months', () => {
    expect(nextOccurrenceDate(base, 'MONTHLY').toISOString()).toBe('2026-02-28T17:00:00.000Z');
    expect(nextOccurrenceDate(new Date(Date.UTC(2026, 2, 15)), 'MONTHLY').toISOString()).toBe('2026-04-15T00:00:00.000Z');
  });
});

describe('mentions', () => {
  const people = [{ name: 'Ana' }, { name: 'Ana Maria' }, { name: 'Ravi Kumar' }];
  it('matches full names case-insensitively, longest first', () => {
    expect(extractMentions('Thanks @ana maria!', people).map((p) => p.name)).toEqual(['Ana Maria']);
    expect(extractMentions('@Ravi Kumar and @Ana', people).map((p) => p.name).sort()).toEqual(['Ana', 'Ravi Kumar']);
  });
  it('ignores partial-word matches and plain names', () => {
    expect(extractMentions('@Anastasia said hi', people)).toEqual([]);
    expect(extractMentions('Ana, please check', people)).toEqual([]);
  });
});

describe('filter queries', () => {
  it('keeps only known non-default keys', () => {
    expect(sanitizeFilterQuery('?status=SUBMITTED&priority=ALL&evil=1&search=%20sat%20')).toBe('search=sat&status=SUBMITTED');
    expect(sanitizeFilterQuery('')).toBe('');
  });
});

describe('insights', () => {
  const now = new Date('2026-11-10T12:00:00Z');
  const row = (over: Partial<Parameters<typeof computeStudentInsights>[0][number]>) => ({
    studentId: 1,
    studentName: 'Sam',
    status: 'TODO',
    deadline: null,
    submittedAt: null,
    completedAt: null,
    reviewedAt: null,
    startedAt: null,
    updatedAt: null,
    ...over,
  });

  it('flags items in progress for too long as stuck', () => {
    expect(isTaskStuck({ status: 'IN_PROGRESS', updatedAt: '2026-10-01T00:00:00Z' }, now)).toBe(true);
    expect(isTaskStuck({ status: 'IN_PROGRESS', updatedAt: '2026-11-08T00:00:00Z' }, now)).toBe(false);
    expect(isTaskStuck({ status: 'COMPLETED', updatedAt: '2026-01-01T00:00:00Z' }, now)).toBe(false);
  });

  it('computes completion and on-time rates per student', () => {
    const [sam] = computeStudentInsights(
      [
        row({ status: 'COMPLETED', deadline: '2026-11-05T00:00:00Z', submittedAt: '2026-11-04T00:00:00Z' }),
        row({ status: 'COMPLETED', deadline: '2026-11-05T00:00:00Z', submittedAt: '2026-11-06T00:00:00Z' }),
        row({ status: 'IN_PROGRESS', deadline: '2026-11-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' }),
        row({ status: 'SUBMITTED' }),
      ],
      now
    );
    expect(sam.total).toBe(4);
    expect(sam.completed).toBe(2);
    expect(sam.completionRate).toBe(0.5);
    expect(sam.onTimeRate).toBe(0.5);
    expect(sam.overdue).toBe(1);
    expect(sam.stuck).toBe(1);
    expect(sam.pendingReview).toBe(1);
  });

  it('averages review turnaround in hours', () => {
    expect(
      averageReviewHours([
        { submittedAt: '2026-11-01T00:00:00Z', reviewedAt: '2026-11-01T10:00:00Z' },
        { submittedAt: '2026-11-01T00:00:00Z', reviewedAt: '2026-11-01T20:00:00Z' },
        { submittedAt: null, reviewedAt: '2026-11-01T20:00:00Z' },
      ])
    ).toBe(15);
    expect(averageReviewHours([])).toBeNull();
  });
});

describe('CSV export', () => {
  it('quotes special characters and neutralises formulas', () => {
    const csv = toCsv(['a', 'b'], [['x,y', 'say "hi"'], ['=SUM(A1)', null], ['line\nbreak', 3]]);
    expect(csv.split('\r\n')).toEqual(['a,b', '"x,y","say ""hi"""', "'=SUM(A1),", '"line\nbreak",3']);
  });
});

describe('checklist completion requirement', () => {
  const steps = [
    { id: 'a', title: 'Step 1' },
    { id: 'b', title: 'Step 2' },
  ];
  const base = {
    requireSubmissionNote: false,
    requireFileUpload: false,
    requireUrl: false,
    requireExternalConfirmation: false,
  };

  it('blocks submitting until every step is ticked when the option is on', () => {
    const task = { ...base, requireChecklistComplete: true, checklist: steps };
    expect(getMissingRequirements(task, { checklistDone: [] })).toEqual(['2 unticked checklist steps']);
    expect(getMissingRequirements(task, { checklistDone: ['a'] })).toEqual(['1 unticked checklist step']);
    expect(getMissingRequirements(task, { checklistDone: ['a', 'b'] })).toEqual([]);
    // Ids of steps that no longer exist don't count
    expect(getMissingRequirements(task, { checklistDone: ['a', 'gone'] })).toEqual(['1 unticked checklist step']);
  });

  it('is only a guide when the option is off (the previous behaviour)', () => {
    const task = { ...base, requireChecklistComplete: false, checklist: steps };
    expect(getMissingRequirements(task, { checklistDone: [] })).toEqual([]);
    expect(taskHasSubmissionRequirements(task)).toBe(false);
  });

  it('does nothing when the option is on but the task has no steps', () => {
    const task = { ...base, requireChecklistComplete: true, checklist: [] };
    expect(requiresChecklistCompletion(task)).toBe(false);
    expect(getMissingRequirements(task, {})).toEqual([]);
    expect(taskHasSubmissionRequirements(task)).toBe(false);
  });

  it('counts as a submission requirement, so "mark complete" can no longer skip it', () => {
    expect(taskHasSubmissionRequirements({ ...base, requireChecklistComplete: true, checklist: steps })).toBe(true);
    expect(countUnfinishedChecklistSteps(steps, ['b'])).toBe(1);
  });
});
