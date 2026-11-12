import type { Prisma } from '../generated/prisma';
import { normalizeChecklist, isTaskRecurrence } from './tasks';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/** Validates template input. `partial` allows omitting fields (for PATCH). */
export function parseTemplateInput(
  body: Record<string, unknown>,
  partial: boolean
): { ok: true; data: Prisma.TaskTemplateUncheckedUpdateInput } | { ok: false; error: string } {
  const data: Prisma.TaskTemplateUncheckedUpdateInput = {};
  const str = (k: string, max: number) => {
    const v = body[k];
    return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
  };

  for (const [key, max, label] of [
    ['name', 100, 'Template name'],
    ['title', 200, 'Task title'],
    ['description', 10000, 'Task description'],
  ] as const) {
    const v = str(key, max);
    if (v) data[key] = v;
    else if (!partial || body[key] !== undefined) return { ok: false, error: `${label} is required` };
  }

  if (body.category !== undefined) data.category = str('category', 100) ?? 'General';
  if (body.priority !== undefined) data.priority = PRIORITIES.includes(String(body.priority)) ? String(body.priority) : 'MEDIUM';
  if (body.defaultDeadlineDays !== undefined) {
    const n = body.defaultDeadlineDays === null || body.defaultDeadlineDays === '' ? null : Number(body.defaultDeadlineDays);
    if (n !== null && (!Number.isInteger(n) || n < 0 || n > 365)) {
      return { ok: false, error: 'Default deadline must be 0–365 days' };
    }
    data.defaultDeadlineDays = n;
  }
  for (const flag of [
    'requireSubmissionNote',
    'requireFileUpload',
    'requireUrl',
    'requireExternalConfirmation',
    'requireChecklistComplete',
    'requireMentorApproval',
  ] as const) {
    if (typeof body[flag] === 'boolean') data[flag] = body[flag] as boolean;
  }
  if (body.externalConfirmationPrompt !== undefined) data.externalConfirmationPrompt = str('externalConfirmationPrompt', 1000);
  if (body.checklist !== undefined) data.checklist = normalizeChecklist(body.checklist) as unknown as Prisma.InputJsonValue;
  if (body.recurrence !== undefined) data.recurrence = isTaskRecurrence(body.recurrence) ? body.recurrence : null;

  return { ok: true, data };
}
