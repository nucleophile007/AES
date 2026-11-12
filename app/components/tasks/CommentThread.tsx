"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AtSign, Loader2, MessageSquare, Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSafeHttpUrl, TASK_UPLOAD_ALLOWED_TYPES } from "@/lib/tasks";
import { taskApi, uploadTaskFile } from "./api";
import type { TaskCommentRecord } from "./types";

const ACCEPT = Object.entries(TASK_UPLOAD_ALLOWED_TYPES)
  .flatMap(([mime, exts]) => [mime, ...exts.map((e) => `.${e}`)])
  .join(",");

interface Participant {
  name: string;
  role: "teacher" | "student";
}

interface CommentThreadProps {
  studentTaskId: number;
  comments: TaskCommentRecord[];
  participants: Participant[];
  currentRole: "teacher" | "student";
  /** Called after a comment is saved (the thread already shows it). */
  onPosted: (comment: TaskCommentRecord) => void;
  disabled?: boolean;
  /** The parent is still fetching comments; show that instead of "No comments yet". */
  loading?: boolean;
}

/** http(s) links, or inline data URIs produced by the local-dev upload fallback. */
function isViewableAttachment(url: string): boolean {
  return url.startsWith("data:") || isSafeHttpUrl(url);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders comment text with @mentions of known participants highlighted. */
function CommentBody({ text, names }: { text: string; names: string[] }) {
  if (!names.length) return <>{text}</>;
  const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).sort((a, b) => b.length - a.length).join("|")}))`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        pattern.test(part) && part.startsWith("@") ? (
          <span key={i} className="rounded bg-indigo-100 px-1 text-indigo-800 font-medium">
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export function CommentThread({ studentTaskId, comments, participants, currentRole, onPosted, disabled, loading }: CommentThreadProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  // Comments posted here but not yet in `comments`. Negative ids are still sending.
  const [justPosted, setJustPosted] = useState<TaskCommentRecord[]>([]);
  useEffect(() => setJustPosted([]), [studentTaskId]);
  const shown = useMemo(
    () => [...comments, ...justPosted.filter((p) => !comments.some((c) => c.id === p.id))],
    [comments, justPosted]
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const others = useMemo(() => participants.filter((p) => p.role !== currentRole), [participants, currentRole]);
  const names = useMemo(() => participants.map((p) => p.name), [participants]);

  const insertMention = (name: string) => {
    const el = textareaRef.current;
    const pos = el?.selectionStart ?? text.length;
    // Replace a trailing "@" the user just typed, otherwise insert.
    const before = text.slice(0, pos).replace(/@$/, "");
    const next = `${before}@${name} ${text.slice(pos)}`;
    setText(next);
    setMentionOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      const caret = before.length + name.length + 2;
      el?.setSelectionRange(caret, caret);
    });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadTaskFile(file);
      setAttachment({ url: res.fileUrl, name: res.fileName });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const post = async () => {
    const content = text.trim();
    const sentAttachment = attachment;
    if (!content && !sentAttachment) return;
    // Show it right away; swap in the saved comment (or undo) when the server answers.
    const tempId = -Date.now();
    const me = participants.find((p) => p.role === currentRole);
    const temp: TaskCommentRecord = {
      id: tempId,
      studentTaskId,
      authorId: 0,
      authorRole: currentRole,
      authorName: me?.name ?? "You",
      content,
      attachmentUrl: sentAttachment?.url ?? null,
      attachmentName: sentAttachment?.name ?? null,
      createdAt: new Date().toISOString(),
    };
    setJustPosted((p) => [...p, temp]);
    setText("");
    setAttachment(null);
    setMentionOpen(false);
    setPosting(true);
    try {
      const res = await taskApi<{ comment: TaskCommentRecord }>("/api/tasks/comments", {
        method: "POST",
        json: { studentTaskId, content, attachmentUrl: sentAttachment?.url, attachmentName: sentAttachment?.name },
      });
      setJustPosted((p) => p.map((c) => (c.id === tempId ? res.comment : c)));
      onPosted(res.comment);
    } catch (err) {
      setJustPosted((p) => p.filter((c) => c.id !== tempId));
      // Give the text back so nothing is lost.
      setText((current) => (current ? `${content}\n${current}` : content));
      setAttachment((current) => current ?? sentAttachment);
      toast({ title: "Couldn't post comment", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {loading && shown.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading comments…
          </div>
        ) : shown.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
            <MessageSquare className="h-5 w-5" />
            No comments yet. Ask a question or share an update.
          </div>
        ) : (
          shown.map((c) => {
            const mine = c.authorRole === currentRole;
            const sending = c.id < 0;
            return (
              <div key={c.id} className={cn("flex gap-2", mine && "flex-row-reverse", sending && "opacity-60")}>
                <Avatar className="h-7 w-7 text-[10px] shrink-0">
                  <AvatarFallback className={cn("font-bold", c.authorRole === "teacher" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700")}>
                    {c.authorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", mine ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50 border")}>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-700">{c.authorName}</span>
                    <span>{c.authorRole === "teacher" ? "Mentor" : "Student"}</span>
                    <span>·</span>
                    {sending ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Sending…
                      </span>
                    ) : (
                      <time dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>
                    )}
                  </div>
                  {c.content && (
                    <p className="whitespace-pre-wrap text-slate-800 break-words">
                      <CommentBody text={c.content} names={names} />
                    </p>
                  )}
                  {c.attachmentUrl && isViewableAttachment(c.attachmentUrl) && (
                    <a
                      href={c.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" /> {c.attachmentName || "Attachment"}
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!disabled && (
        <div className="border rounded-lg bg-white p-2 space-y-2">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const pos = e.target.selectionStart ?? e.target.value.length;
              setMentionOpen(e.target.value.charAt(pos - 1) === "@" && others.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void post();
              }
              if (e.key === "Escape") setMentionOpen(false);
            }}
            placeholder={`Write a comment… type @ to mention ${others.map((o) => o.name).join(" or ") || "someone"}`}
            rows={2}
            className="text-sm border-0 shadow-none focus-visible:ring-0 resize-none p-1"
            maxLength={5000}
            aria-label="Comment"
          />
          {mentionOpen && (
            <div className="flex flex-wrap gap-1.5" role="listbox" aria-label="Mention someone">
              {others.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => insertMention(p.name)}
                  className="text-xs px-2 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                >
                  @{p.name} <span className="text-indigo-400">({p.role === "teacher" ? "mentor" : "student"})</span>
                </button>
              ))}
            </div>
          )}
          {attachment && (
            <div className="flex items-center gap-2 text-xs bg-slate-50 border rounded px-2 py-1">
              <Paperclip className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate flex-1">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment" className="text-slate-400 hover:text-rose-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-slate-500" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />} Attach
              </Button>
              {others.length > 0 && (
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-slate-500" onClick={() => setMentionOpen((o) => !o)}>
                  <AtSign className="h-3.5 w-3.5" /> Mention
                </Button>
              )}
            </div>
            <Button type="button" size="sm" className="h-7 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => void post()} disabled={posting || uploading || (!text.trim() && !attachment)}>
              {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Post
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 px-1">Ctrl/⌘ + Enter to post. Mentions send an email notification.</p>
        </div>
      )}
    </div>
  );
}
