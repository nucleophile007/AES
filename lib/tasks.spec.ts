import { describe, expect, it } from 'vitest';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  DEFAULT_TASK_CATEGORIES,
  formatTaskKey,
  isTaskOverdue,
  getDeadlineLabel,
} from './tasks';

describe('Task Management Domain Helpers', () => {
  it('formats Jira-style task key correctly', () => {
    expect(formatTaskKey(1)).toBe('TSK-1');
    expect(formatTaskKey(105)).toBe('TSK-105');
  });

  it('accurately identifies overdue tasks', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Overdue when deadline has passed and task is NOT completed
    expect(isTaskOverdue(yesterday, 'TODO')).toBe(true);
    expect(isTaskOverdue(yesterday, 'IN_PROGRESS')).toBe(true);
    // Submitted work is waiting on the mentor, so it isn't the student's overdue item
    expect(isTaskOverdue(yesterday, 'SUBMITTED')).toBe(false);
    expect(isTaskOverdue(yesterday, 'CHANGES_REQUESTED')).toBe(true);

    // Completed tasks are never overdue
    expect(isTaskOverdue(yesterday, 'COMPLETED')).toBe(false);

    // Future deadlines are not overdue
    expect(isTaskOverdue(tomorrow, 'TODO')).toBe(false);
    expect(isTaskOverdue(tomorrow, 'IN_PROGRESS')).toBe(false);

    // Null or undefined deadlines are never overdue
    expect(isTaskOverdue(null, 'TODO')).toBe(false);
    expect(isTaskOverdue(undefined, 'TODO')).toBe(false);
  });

  it('generates friendly and accurate deadline labels', () => {
    const noDeadline = getDeadlineLabel(null);
    expect(noDeadline.text).toBe('No deadline');
    expect(noDeadline.isOverdue).toBe(false);

    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const pastLabel = getDeadlineLabel(pastDate);
    expect(pastLabel.isOverdue).toBe(true);
    expect(pastLabel.text).toContain('Overdue');

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tomorrowLabel = getDeadlineLabel(tomorrow);
    expect(tomorrowLabel.isOverdue).toBe(false);
  });

  it('validates supported task statuses and priorities', () => {
    expect(TASK_STATUSES.TODO.label).toBe('To Do');
    expect(TASK_STATUSES.IN_PROGRESS.label).toBe('In Progress');
    expect(TASK_STATUSES.SUBMITTED.label).toBe('Submitted for Review');
    expect(TASK_STATUSES.CHANGES_REQUESTED.label).toBe('Changes Requested');
    expect(TASK_STATUSES.COMPLETED.label).toBe('Completed');

    expect(TASK_PRIORITIES.LOW.label).toBe('Low');
    expect(TASK_PRIORITIES.MEDIUM.label).toBe('Medium');
    expect(TASK_PRIORITIES.HIGH.label).toBe('High');
    expect(TASK_PRIORITIES.URGENT.label).toBe('Urgent');

    expect(DEFAULT_TASK_CATEGORIES).toContain('College Prep');
    expect(DEFAULT_TASK_CATEGORIES).toContain('Outreach');
    expect(DEFAULT_TASK_CATEGORIES).toContain('Research');
    expect(DEFAULT_TASK_CATEGORIES).toContain('Event Registration');
  });
});

