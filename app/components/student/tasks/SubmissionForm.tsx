"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { uploadTaskFile } from "@/components/tasks/api";
import type { TaskItem } from "@/components/tasks/types";
import {
  TASK_UPLOAD_ALLOWED_TYPES,
  canStudentPerform,
  getMissingRequirements,
  isSafeHttpUrl,
  taskHasSubmissionRequirements,
  requiresChecklistCompletion,
  type StudentTaskAction,
} from "@/lib/tasks";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  Paperclip,
  Play,
  Save,
  ShieldAlert,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmissionPayload } from "./studentTaskApi";

const TASK_UPLOAD_ACCEPT = Object.entries(TASK_UPLOAD_ALLOWED_TYPES)
  .flatMap(([mime, exts]) => [mime, ...exts.map((ext) => `.${ext}`)])
  .join(",");

function fromItem(item: TaskItem): SubmissionPayload {
  return {
    submissionNote: item.submissionNote ?? "",
    submissionUrl: item.submissionUrl ?? "",
    submissionFileUrl: item.submissionFileUrl ?? null,
    submissionFileName: item.submissionFileName ?? null,
    submissionExternalConfirmed: Boolean(item.submissionExternalConfirmed),
  };
}

interface SubmissionFormProps {
  item: TaskItem;
  busy: boolean;
  /** Runs a workflow action; resolves true on success. */
  onAction: (action: Exclude<StudentTaskAction, "TOGGLE_CHECKLIST">, payload?: SubmissionPayload) => Promise<boolean>;
}

/**
 * The student's workspace for one task: required fields, Save Draft, and
 * Submit / Mark as Completed. Edits are kept locally until saved; server
 * updates (realtime, reloads) only replace the form while it has no unsaved edits.
 */
export function SubmissionForm({ item, busy, onAction }: SubmissionFormProps) {
  const { toast } = useToast();
  const { task, status } = item;
  const [form, setForm] = useState<SubmissionPayload>(() => fromItem(item));
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = `task-file-${item.id}`;

  // Pick up server-side changes (e.g. after saving, or a realtime reload) unless the student is mid-edit.
  const serverKey = JSON.stringify(fromItem(item));
  useEffect(() => {
    if (!dirty) setForm(JSON.parse(serverKey) as SubmissionPayload);
  }, [serverKey, dirty]);

  const editable = !task.isCancelled && canStudentPerform("SAVE_DRAFT", status);
  const hasRequirements = taskHasSubmissionRequirements(task);
  // Requirements that need something filled in below (the checklist lives above the form).
  const needsFields =
    task.requireSubmissionNote || task.requireFileUpload || task.requireUrl || task.requireExternalConfirmation;
  const needsAllSteps = requiresChecklistCompletion(task);
  const completeDirect = !hasRequirements && !task.requireMentorApproval;

  const update = (patch: Partial<SubmissionPayload>) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const missing = getMissingRequirements(task, {
    note: form.submissionNote,
    url: form.submissionUrl,
    fileUrl: form.submissionFileUrl,
    externalConfirmed: form.submissionExternalConfirmed,
    checklistDone: item.checklistDone,
  });
  const urlInvalid = Boolean(form.submissionUrl.trim()) && !isSafeHttpUrl(form.submissionUrl);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadTaskFile(file);
      update({ submissionFileUrl: res.fileUrl, submissionFileName: res.fileName });
      toast({ title: "File uploaded", description: `${res.fileName} attached. Save or submit to keep it.` });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const run = async (action: Exclude<StudentTaskAction, "TOGGLE_CHECKLIST">) => {
    const ok = await onAction(action, action === "SAVE_DRAFT" || action === "SUBMIT" ? form : undefined);
    if (ok) setDirty(false);
  };

  const fieldsDisabled = !editable || busy;

  return (
    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Work & Submission</h4>
        <div className="flex items-center gap-2">
          {task.requireMentorApproval && (
            <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Requires mentor approval
            </span>
          )}
          {canStudentPerform("START", status) && !task.isCancelled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void run("START")}
              disabled={busy}
              className="h-7 text-xs gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Play className="h-3 w-3" /> Start task
            </Button>
          )}
        </div>
      </div>

      {task.requireSubmissionNote && (
        <div className="space-y-1.5">
          <Label htmlFor={`note-${item.id}`} className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            Submission note / summary <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            id={`note-${item.id}`}
            placeholder="Write a clear summary of what you did, who you contacted, or your findings…"
            rows={3}
            value={form.submissionNote}
            onChange={(e) => update({ submissionNote: e.target.value })}
            disabled={fieldsDisabled}
            className="text-xs bg-white"
            maxLength={10000}
          />
        </div>
      )}

      {task.requireUrl && (
        <div className="space-y-1.5">
          <Label htmlFor={`url-${item.id}`} className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5 text-indigo-600" />
            Submission URL / link <span className="text-rose-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id={`url-${item.id}`}
              type="url"
              placeholder="https://…"
              value={form.submissionUrl}
              onChange={(e) => update({ submissionUrl: e.target.value })}
              disabled={fieldsDisabled}
              aria-invalid={urlInvalid}
              className={cn("text-xs h-9 bg-white", urlInvalid && "border-rose-300 focus-visible:ring-rose-400")}
            />
            {isSafeHttpUrl(form.submissionUrl) && (
              <a
                href={form.submissionUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 rounded-md border bg-white flex items-center justify-center text-indigo-600 hover:bg-indigo-50 shrink-0"
                title="Open link"
                aria-label="Open submitted link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {urlInvalid && <p className="text-[11px] text-rose-600">Links must start with http:// or https://</p>}
        </div>
      )}

      {task.requireFileUpload && (
        <div className="space-y-1.5">
          <Label htmlFor={inputId} className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <UploadCloud className="h-3.5 w-3.5 text-indigo-600" />
            File / screenshot upload <span className="text-rose-500">*</span>
          </Label>
          {form.submissionFileUrl ? (
            <div className="p-3 bg-white rounded-lg border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">{form.submissionFileName || "Uploaded file"}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSafeHttpUrl(form.submissionFileUrl) && (
                  <a
                    href={form.submissionFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> View
                  </a>
                )}
                {editable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => update({ submissionFileUrl: null, submissionFileName: null })}
                    disabled={busy}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={cn("border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white", fieldsDisabled && "opacity-60")}>
              <input
                ref={fileRef}
                type="file"
                id={inputId}
                accept={TASK_UPLOAD_ACCEPT}
                className="sr-only"
                onChange={(e) => void onFile(e.target.files?.[0])}
                disabled={uploading || fieldsDisabled}
              />
              <label
                htmlFor={inputId}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600",
                  !fieldsDisabled && !uploading ? "cursor-pointer hover:text-indigo-800" : "cursor-not-allowed"
                )}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Click to select a file / screenshot"}
              </label>
              <p className="text-[10px] text-slate-400 mt-0.5">PDF, images, Word, Excel, PowerPoint, TXT or CSV</p>
            </div>
          )}
        </div>
      )}

      {task.requireExternalConfirmation && (
        <div className="p-3 bg-white rounded-lg border">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={form.submissionExternalConfirmed}
              onCheckedChange={(chk) => update({ submissionExternalConfirmed: chk === true })}
              disabled={fieldsDisabled}
              className="mt-0.5"
            />
            <div>
              <span className="text-xs font-bold text-slate-800">
                {task.externalConfirmationPrompt || "I confirm that I have completed this action."}
              </span>
              <p className="text-[11px] text-slate-500">
                Confirm only after you have performed the action (e.g. sent the email, registered for the event).
              </p>
            </div>
          </label>
        </div>
      )}

      {!needsFields && (
        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border">
          {needsAllSteps
            ? `This task doesn't need any files or links. Tick every checklist step above, then ${
                task.requireMentorApproval ? "submit it for your mentor to review" : "mark it as completed"
              }.`
            : task.requireMentorApproval
              ? "This task doesn't need any files or links. Do the requested action, then submit it for your mentor to review."
              : "This task doesn't need any files or links. Do the requested action and mark it as completed."}
        </p>
      )}

      {editable && missing.length > 0 && (
        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] text-amber-900 flex items-start gap-2" role="status">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Before submitting, finish: <strong>{missing.join(", ")}</strong>.
          </span>
        </div>
      )}

      {editable && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            onClick={() => void run(completeDirect ? "COMPLETE_DIRECT" : "SUBMIT")}
            disabled={busy || uploading || missing.length > 0 || urlInvalid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 gap-1.5"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {task.requireMentorApproval ? "Submit for mentor review" : "Mark as completed"}
          </Button>
          {needsFields && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void run("SAVE_DRAFT")}
              disabled={busy || uploading || urlInvalid || !dirty}
              className="text-xs h-9 gap-1.5"
            >
              <Save className="h-3.5 w-3.5" /> Save draft
            </Button>
          )}
          {dirty && <span className="text-[11px] text-slate-500">Unsaved changes</span>}
        </div>
      )}

      {status === "SUBMITTED" && (
        <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Submitted!</strong> Your work is with your mentor for review. You&apos;ll be notified once it&apos;s reviewed.
          </span>
        </div>
      )}
      {status === "COMPLETED" && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Task completed!</strong> Great job finishing this one.
          </span>
        </div>
      )}
    </div>
  );
}
