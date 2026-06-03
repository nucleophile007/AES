"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToastAction } from "@/components/ui/toast";
import { Plus, Save, X, Calendar, FileText, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserTimezone } from "@/lib/timezone";
import McqPdfAssignmentModal from "./McqPdfAssignmentModal";

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  program: string;
  subject: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  isActive: boolean;
  submissions: any[];
  resources: Array<{
    resource: Resource;
  }>;
  assignmentTargets?: Array<{
    student: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  targetStudent?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  program: string;
  grade: string;
}

interface StudentGroupMember {
  id: number;
  name: string;
  email: string;
  grade: string;
  program: string;
}

interface StudentGroup {
  id: number;
  name: string;
  createdAt: string;
  members: StudentGroupMember[];
}

interface Resource {
  id: number;
  title: string;
  type: string;
  fileUrl?: string | null;
  linkUrl?: string | null;
  fileName?: string | null;
}

type McqAssessmentType = "mock-test" | "simple-assignment";

interface McqTemplateOption {
  id: number;
  title: string;
  fileName?: string | null;
  summary?: string;
  updatedAt?: string;
  assessmentType: McqAssessmentType;
}

interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  programs: string[];
  subject: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  studentIds: string[];
  groupIds: string[];
  resourceFiles?: File[];
  resourceLinks?: string[];
  resourceIds?: number[];
  mcqTemplateIds?: string[];
}

interface AssignmentManagerProps {
  teacherEmail: string;
  assignments: Assignment[];
  onAssignmentCreated: (assignment?: Assignment | null) => Promise<void> | void;
  onAssignmentUpdated: (assignment?: Assignment | null) => Promise<void> | void;
}

const EMPTY_ASSIGNMENT_FORM: AssignmentFormData = {
  title: "",
  description: "",
  instructions: "",
  programs: [],
  subject: "",
  dueDate: "",
  totalPoints: 100,
  allowLateSubmission: false,
  studentIds: [],
  groupIds: [],
  resourceFiles: [],
  resourceLinks: [],
  resourceIds: [],
  mcqTemplateIds: [],
};

const PROGRAMS = [
  "Academic Tutoring",
  "SAT Coaching",
  "College Prep",
  "Math Competition",
  "Research Program"
];

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology"
];

const getMcqTemplateTypeLabel = (assessmentType: McqAssessmentType) =>
  assessmentType === "simple-assignment" ? "MCQ + PDF Assignment" : "MCQ + PDF Mock Test";

// Separate AssignmentForm component to prevent recreation on every render
const AssignmentForm = ({ 
  formData, 
  setFormData, 
  students, 
  availablePrograms,
  studentGroups,
  existingResources,
  mcqTemplates
}: {
  formData: AssignmentFormData;
  setFormData: (data: AssignmentFormData) => void;
  students: Student[];
  availablePrograms: string[];
  studentGroups: StudentGroup[];
  existingResources?: Resource[];
  mcqTemplates?: McqTemplateOption[];
}) => {
  const filteredStudents = formData.programs.length > 0
    ? students.filter((student) => formData.programs.includes(student.program))
    : students;
  const selectedGroupIdSet = new Set(formData.groupIds);
  const groupedStudentIdSet = new Set(
    studentGroups
      .filter((group) => selectedGroupIdSet.has(group.id.toString()))
      .flatMap((group) => group.members.map((member) => member.id.toString()))
  );
  const manualSelectedStudentIdSet = new Set(formData.studentIds);
  const isStudentChecked = (studentId: string) =>
    groupedStudentIdSet.has(studentId) || manualSelectedStudentIdSet.has(studentId);

  const [linkInput, setLinkInput] = React.useState("");
  const [resourceError, setResourceError] = React.useState<string | null>(null);

  const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".ppt",
    ".pptx",
    ".xlsx",
    // videos intentionally excluded for now
  ];

  const MAX_RESOURCES = 8;
  const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const currentFiles = formData.resourceFiles || [];
    const nextFiles: File[] = [];
    // validate extensions and sizes
    const existingSize = currentFiles.reduce((s, f) => s + (f.size || 0), 0);
    let runningSize = existingSize;
    for (const file of Array.from(files)) {
      const lower = file.name.toLowerCase();
      const ok = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
      if (!ok) {
        setResourceError(`File type not allowed: ${file.name}`);
        continue;
      }
      if (runningSize + file.size > MAX_TOTAL_SIZE_BYTES) {
        setResourceError(`Adding ${file.name} would exceed total size limit of 50 MB. File skipped.`);
        continue;
      }
      runningSize += file.size;
      nextFiles.push(file);
      if (currentFiles.length + nextFiles.length >= MAX_RESOURCES) break;
    }

    const combined = [...currentFiles, ...nextFiles].slice(0, MAX_RESOURCES);
    if (combined.length >= MAX_RESOURCES && nextFiles.length > 0) {
      setResourceError(`Reached max resources (${MAX_RESOURCES}). Extra files were ignored.`);
    } else if (!resourceError) {
      setResourceError(null);
    }
    setFormData({ ...formData, resourceFiles: combined });
  };

  const handleAddLink = () => {
    if (!linkInput) return;
    try {
      // Validate URL
      // eslint-disable-next-line no-new
      new URL(linkInput);
    } catch {
      setResourceError('Invalid URL');
      return;
    }
    const currentLinks = formData.resourceLinks || [];
    if (currentLinks.length + (formData.resourceFiles?.length || 0) >= MAX_RESOURCES) {
      setResourceError(`Cannot add more than ${MAX_RESOURCES} resources`);
      return;
    }
    setFormData({ ...formData, resourceLinks: [...currentLinks, linkInput] });
    setLinkInput("");
    setResourceError(null);
  };

  const removeResourceFileAt = (index: number) => {
    const files = formData.resourceFiles || [];
    const next = files.filter((_, i) => i !== index);
    setFormData({ ...formData, resourceFiles: next });
  };

  const removeResourceLinkAt = (index: number) => {
    const links = formData.resourceLinks || [];
    const next = links.filter((_, i) => i !== index);
    setFormData({ ...formData, resourceLinks: next });
  };

  const activeResourceIds = new Set(formData.resourceIds || []);
  const selectedTemplateIdSet = new Set(formData.mcqTemplateIds || []);
  const visibleExistingResources = (existingResources || []).filter((resource) =>
    activeResourceIds.has(resource.id) && resource.type !== "mcq_template"
  );
  const removeExistingResource = (resourceId: number) => {
    const next = (formData.resourceIds || []).filter((id) => id !== resourceId);
    setFormData({ ...formData, resourceIds: next });
  };

  const toggleTemplateSelection = (templateId: number) => {
    const templateIdStr = String(templateId);
    const current = formData.mcqTemplateIds || [];
    const next = selectedTemplateIdSet.has(templateIdStr)
      ? current.filter((id) => id !== templateIdStr)
      : [...current, templateIdStr];
    setFormData({ ...formData, mcqTemplateIds: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Assignment Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter assignment title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the assignment"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="instructions">Detailed Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Detailed instructions for students"
          rows={4}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label>Program filter</Label>
          <p className="text-xs text-muted-foreground mb-2">Pick one or more programs to narrow the student list.</p>
          <div className="flex flex-wrap gap-2 rounded-md border bg-gray-50 p-3">
            {availablePrograms.map((program) => {
              const isSelected = formData.programs.includes(program);
              const nextPrograms = isSelected
                ? formData.programs.filter((value) => value !== program)
                : [...formData.programs, program];
              const nextFilteredStudents = nextPrograms.length > 0
                ? students.filter((student) => nextPrograms.includes(student.program))
                : students;
              const selectedStudentStillVisible = nextFilteredStudents.some(
                (student) => formData.studentIds.includes(student.id.toString())
              );

              return (
                <Button
                  key={program}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      programs: nextPrograms,
                      studentIds: selectedStudentStillVisible
                        ? formData.studentIds
                        : formData.studentIds.filter((studentId) =>
                            nextFilteredStudents.some((student) => student.id.toString() === studentId)
                          )
                    });
                  }}
                >
                  {program}
                </Button>
              );
            })}
            {formData.programs.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setFormData({ ...formData, programs: [] })}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Assign to Groups (Optional)</Label>
        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
          {studentGroups.length === 0 ? (
            <p className="text-sm text-gray-500">No groups available</p>
          ) : (
            studentGroups.map((group) => (
              <div key={group.id} className="rounded-md border bg-white p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`group-${group.id}`}
                      checked={formData.groupIds.includes(group.id.toString())}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            groupIds: [...formData.groupIds, group.id.toString()]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            groupIds: formData.groupIds.filter((id) => id !== group.id.toString())
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`group-${group.id}`} className="cursor-pointer font-normal">
                      {group.name} ({group.members.length} students)
                    </Label>
                  </div>
                  <details className="text-xs text-blue-700">
                    <summary className="cursor-pointer">View students</summary>
                    <p className="mt-1 max-w-[320px] text-gray-600">
                      {group.members.map((member) => member.name).join(", ")}
                    </p>
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Student Selection */}
      <div>
        <Label>Assign to Students</Label>
        {formData.programs.length > 0 ? (
          <p className="text-xs text-muted-foreground mb-1">
            Showing students for {formData.programs.join(", ")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mb-1">Showing students from all programs.</p>
        )}
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border bg-gray-50 p-3">
          {filteredStudents.map((student) => {
            const studentId = student.id.toString();
            const lockedByGroup = groupedStudentIdSet.has(studentId);
            return (
              <div key={student.id} className="flex items-center justify-between rounded-md border bg-white p-2">
                <Label htmlFor={`student-${student.id}`} className="cursor-pointer text-sm font-normal">
                  {student.name} ({student.grade}) - {student.email}
                </Label>
                <div className="flex items-center gap-2">
                  {lockedByGroup && <span className="text-xs text-blue-700">via group</span>}
                  <input
                    id={`student-${student.id}`}
                    type="checkbox"
                    className="rounded"
                    checked={isStudentChecked(studentId)}
                    disabled={lockedByGroup}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          studentIds: Array.from(new Set([...formData.studentIds, studentId]))
                        });
                      } else {
                        setFormData({
                          ...formData,
                          studentIds: formData.studentIds.filter((id) => id !== studentId)
                        });
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
          {filteredStudents.length === 0 && (
            <p className="text-sm text-gray-500">No students available for current filters.</p>
          )}
        </div>
        {formData.programs.length > 0 && filteredStudents.length === 0 && (
          <p className="text-sm text-orange-600 mt-1">No students found for selected programs</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalPoints">Total Points</Label>
          <Input
            id="totalPoints"
            type="number"
            value={formData.totalPoints}
            onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 100 })}
            min="1"
            max="1000"
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="allowLateSubmission"
          type="checkbox"
          checked={formData.allowLateSubmission}
          onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="allowLateSubmission">Allow late submissions</Label>
      </div>

      <div className="space-y-2">
        <Label>Add Resources (optional)</Label>
        <p className="text-xs text-muted-foreground">Allowed: {ALLOWED_EXTENSIONS.join(', ')}. Max {MAX_RESOURCES} total (files + links).</p>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          <div className="flex items-center gap-2">
            <Input placeholder="https://example.com/resource" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} />
            <Button type="button" onClick={handleAddLink}>Add Link</Button>
          </div>

          {resourceError && <p className="text-xs text-red-600">{resourceError}</p>}

          {(formData.resourceFiles?.length || 0) + (formData.resourceLinks?.length || 0) > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Added resources</p>
              <div className="flex flex-wrap gap-2">
                {formData.resourceFiles?.map((file, idx) => (
                  <div key={`file-${idx}`} className="rounded-md border bg-white px-2 py-1 text-xs flex items-center gap-2">
                    <span>{file.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeResourceFileAt(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {formData.resourceLinks?.map((link, idx) => (
                  <div key={`link-${idx}`} className="rounded-md border bg-white px-2 py-1 text-xs flex items-center gap-2">
                    <a href={link} target="_blank" rel="noreferrer" className="underline text-blue-700 truncate max-w-[220px]">{link}</a>
                    <Button size="sm" variant="ghost" onClick={() => removeResourceLinkAt(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Attach MCQ Templates</Label>
        <details className="rounded-md border bg-gray-50 p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {selectedTemplateIdSet.size > 0
              ? `${selectedTemplateIdSet.size} template${selectedTemplateIdSet.size > 1 ? "s" : ""} selected`
              : "Select templates"}
          </summary>
          <div className="mt-3 space-y-2">
            {(mcqTemplates || []).length === 0 ? (
              <p className="text-sm text-gray-500">No saved templates yet. Create one using “Create Test”.</p>
            ) : (
              (mcqTemplates || []).map((template) => (
                <label
                  key={template.id}
                  className="flex cursor-pointer items-center justify-between rounded-md border bg-white p-2"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{template.title}</p>
                      <Badge variant="outline" className="text-[10px]">{getMcqTemplateTypeLabel(template.assessmentType)}</Badge>
                    </div>
                    <p className="truncate text-xs text-gray-500">
                      {template.fileName || "Linked PDF"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedTemplateIdSet.has(String(template.id))}
                    onChange={() => toggleTemplateSelection(template.id)}
                  />
                </label>
              ))
            )}
          </div>
        </details>
      </div>

      {visibleExistingResources.length > 0 && (
        <div className="space-y-2">
          <Label>Existing resources</Label>
          <div className="space-y-2">
            {visibleExistingResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{resource.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {resource.fileName || resource.linkUrl || resource.fileUrl || resource.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(resource.linkUrl || resource.fileUrl) && (
                    <a
                      href={resource.linkUrl || resource.fileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-700 underline"
                    >
                      View
                    </a>
                  )}
                  <Button size="sm" variant="outline" onClick={() => removeExistingResource(resource.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AssignmentManager({ teacherEmail, assignments, onAssignmentCreated, onAssignmentUpdated }: AssignmentManagerProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMcqPdfDialogOpen, setIsMcqPdfDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [activeTemplateEditorId, setActiveTemplateEditorId] = useState<number | null>(null);
  const [pendingDiscardTarget, setPendingDiscardTarget] = useState<"create" | "edit" | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const submitInFlightRef = useRef(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [mcqTemplates, setMcqTemplates] = useState<McqTemplateOption[]>([]);
  const [deletingTemplateIds, setDeletingTemplateIds] = useState<Set<number>>(new Set());
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [groupLoadError, setGroupLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "saving" | "success" | "error";
    message: string;
  } | null>(null);
  const [deletingAssignmentIds, setDeletingAssignmentIds] = useState<Set<number>>(new Set());
  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<Set<number>>(new Set());
  const [expandedAssignmentIds, setExpandedAssignmentIds] = useState<Set<number>>(new Set());
  const [initialEditSnapshot, setInitialEditSnapshot] = useState<AssignmentFormData | null>(null);
  const pendingDeleteTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const saveFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState<AssignmentFormData>(EMPTY_ASSIGNMENT_FORM);

  const getAssignmentDraftStorageKey = (assignmentId: number | null) =>
    assignmentId
      ? `aes:teacher:assignment:draft:${teacherEmail}:edit:${assignmentId}`
      : `aes:teacher:assignment:draft:${teacherEmail}:create`;

  const readAssignmentDraft = (assignmentId: number | null): AssignmentFormData | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(getAssignmentDraftStorageKey(assignmentId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<AssignmentFormData>;
      return {
        ...EMPTY_ASSIGNMENT_FORM,
        ...parsed,
      };
    } catch {
      return null;
    }
  };

  const clearAssignmentDraft = (assignmentId: number | null) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getAssignmentDraftStorageKey(assignmentId));
  };

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const data = await response.json();

        if (response.ok && data.students) {
          // Normalize students to use their main program for assignments
          const normalizedStudents: Student[] = data.students.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            grade: s.grade,
            // Prefer mainProgram (from Student model) and fall back to program if needed
            program: (s.mainProgram || s.program || "").trim()
          }));

          setStudents(normalizedStudents);

          // Get unique, normalized programs from students (case-insensitive, trimmed)
          const programs = Array.from(
            new Map(
              normalizedStudents
                .map((student) => student.program)
                .filter((program) => Boolean(program))
                .map((program: string) => [program.toLowerCase(), program])
            ).values()
          );

          if (programs.length > 0) {
            setAvailablePrograms(programs);
          } else if (Array.isArray(data.teacher?.programs) && data.teacher.programs.length > 0) {
            setAvailablePrograms(data.teacher.programs);
          } else {
            setAvailablePrograms([]);
          }
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (teacherEmail) {
      fetchStudents();
    }
  }, [teacherEmail]);

  const fetchMcqTemplates = useCallback(async () => {
    if (!teacherEmail) return;
    try {
      const response = await fetch(`/api/teacher/mcq-tests?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      const tests = Array.isArray(data.tests) ? data.tests : Array.isArray(data.templates) ? data.templates : [];
      if (response.ok && tests.length > 0) {
        const templates = tests.map((template: any) => ({
          id: Number(template.id),
          title: String(template.title || "Untitled Test"),
          fileName: template.fileName ? String(template.fileName) : null,
          summary: template.summary ? String(template.summary) : "",
          updatedAt: template.updatedAt ? String(template.updatedAt) : undefined,
          assessmentType: template?.config?.assessmentType === "simple-assignment" ? "simple-assignment" : "mock-test",
        }));
        setMcqTemplates(templates);
      } else if (response.ok) {
        setMcqTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  }, [teacherEmail]);

  useEffect(() => {
    if (teacherEmail) {
      void fetchMcqTemplates();
    }
  }, [teacherEmail, fetchMcqTemplates]);

  const handleDeleteTemplate = async (templateId: number) => {
    const confirmed = window.confirm("Delete this test? This will remove it from linked assignments.");
    if (!confirmed) return;

    setDeletingTemplateIds((prev) => {
      const next = new Set(prev);
      next.add(templateId);
      return next;
    });

    try {
      const response = await fetch(
        `/api/teacher/mcq-tests?id=${templateId}`,
        { method: "DELETE" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete test");
      }

      await fetchMcqTemplates();
      toast({
        title: "Test deleted",
        description: data.message || "Test deleted successfully.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeletingTemplateIds((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/teacher/student-groups?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const data = await response.json();
        if (response.ok && data.groups) {
          setStudentGroups(data.groups);
          setGroupLoadError(null);
        } else {
          setGroupLoadError(data.error || 'Failed to load groups');
        }
      } catch (error) {
        console.error('Error fetching student groups:', error);
        setGroupLoadError('Failed to load groups');
      }
    };

    if (teacherEmail) {
      fetchGroups();
    }
  }, [teacherEmail]);

  const resetForm = () => {
    setFormData(EMPTY_ASSIGNMENT_FORM);
  };

  const formatDueDateForInput = (dueDate: string) => {
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }
    const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const getAssignmentTargetStudentIds = (assignment: Assignment): number[] => {
    if (assignment.assignmentTargets && assignment.assignmentTargets.length > 0) {
      return Array.from(new Set(assignment.assignmentTargets.map((target) => target.student.id)));
    }
    if (assignment.targetStudent?.id) {
      return [assignment.targetStudent.id];
    }
    return [];
  };

  const resolveGroupIdsForTargets = (targetIds: number[]) => {
    if (targetIds.length === 0) return [];

    const targetSet = new Set(targetIds);
    const exactGroups = studentGroups.filter((group) => {
      const memberIds = group.members.map((member) => member.id);
      if (memberIds.length !== targetSet.size) return false;
      return memberIds.every((id) => targetSet.has(id));
    });

    if (exactGroups.length > 0) {
      return exactGroups.map((group) => group.id.toString());
    }

    const exactByUnion = (startIndex: number, currentIds: Set<number>, selectedGroupIds: number[]): string[] | null => {
      if (currentIds.size > targetSet.size) return null;
      let isSubset = true;
      for (const id of currentIds) {
        if (!targetSet.has(id)) {
          isSubset = false;
          break;
        }
      }
      if (!isSubset) return null;
      if (currentIds.size === targetSet.size) {
        return selectedGroupIds.map((id) => id.toString());
      }

      for (let index = startIndex; index < studentGroups.length; index += 1) {
        const group = studentGroups[index];
        if (group.members.length === 0) continue;
        const nextIds = new Set(currentIds);
        for (const member of group.members) {
          nextIds.add(member.id);
        }
        const result = exactByUnion(index + 1, nextIds, [...selectedGroupIds, group.id]);
        if (result) return result;
      }

      return null;
    };

    return exactByUnion(0, new Set<number>(), []) ?? [];
  };

  const toggleExpandedAssignment = (assignmentId: number) => {
    setExpandedAssignmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setInitialEditSnapshot(null);
    const createDraft = readAssignmentDraft(null);
    setFormData(createDraft || EMPTY_ASSIGNMENT_FORM);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    const targetStudentIds = getAssignmentTargetStudentIds(assignment);
    const prefilledGroupIds = resolveGroupIdsForTargets(targetStudentIds);
    const groupedTargetIds = new Set(
      studentGroups
        .filter((group) => prefilledGroupIds.includes(group.id.toString()))
        .flatMap((group) => group.members.map((member) => member.id))
    );
    const manuallySelectedStudentIds = targetStudentIds.filter((id) => !groupedTargetIds.has(id));
    const snapshot: AssignmentFormData = {
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      programs: assignment.program ? [assignment.program] : [],
      subject: assignment.subject,
      dueDate: formatDueDateForInput(assignment.dueDate),
      totalPoints: assignment.totalPoints,
      allowLateSubmission: assignment.allowLateSubmission,
      studentIds: manuallySelectedStudentIds.map((id) => id.toString()),
      groupIds: prefilledGroupIds,
      resourceIds: assignment.resources.filter((item) => item.resource.type !== "mcq_template").map((item) => item.resource.id),
      mcqTemplateIds: assignment.resources
        .filter((item) => item.resource.type === "mcq_template")
        .map((item) => String(item.resource.id)),
    };
    const editDraft = readAssignmentDraft(assignment.id);
    setFormData(editDraft || snapshot);
    setInitialEditSnapshot(snapshot);
    setEditingAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const isCreateDirty = JSON.stringify(formData) !== JSON.stringify(EMPTY_ASSIGNMENT_FORM);
  const isEditDirty = Boolean(
    isEditDialogOpen &&
    initialEditSnapshot &&
    JSON.stringify(formData) !== JSON.stringify(initialEditSnapshot)
  );

  const handleCreateDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isCreateDirty && !loading) {
      setPendingDiscardTarget("create");
      setIsDiscardDialogOpen(true);
      return;
    }
    if (!nextOpen) {
      clearAssignmentDraft(null);
      resetForm();
    }
    setIsCreateDialogOpen(nextOpen);
  };

  const handleEditDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isEditDirty && !loading) {
      setPendingDiscardTarget("edit");
      setIsDiscardDialogOpen(true);
      return;
    }
    if (!nextOpen) {
      clearAssignmentDraft(editingAssignment?.id ?? null);
      setEditingAssignment(null);
      setInitialEditSnapshot(null);
      resetForm();
    }
    setIsEditDialogOpen(nextOpen);
  };

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!(isCreateDialogOpen && isCreateDirty) && !isEditDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isCreateDialogOpen, isCreateDirty, isEditDirty]);

  useEffect(() => {
    const pendingDeleteTimeouts = pendingDeleteTimeoutsRef.current;
    return () => {
      pendingDeleteTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      pendingDeleteTimeouts.clear();
      if (saveFeedbackTimeoutRef.current) {
        clearTimeout(saveFeedbackTimeoutRef.current);
        saveFeedbackTimeoutRef.current = null;
      }
    };
  }, []);

  const showSaveFeedback = (type: "saving" | "success" | "error", message: string) => {
    if (saveFeedbackTimeoutRef.current) {
      clearTimeout(saveFeedbackTimeoutRef.current);
      saveFeedbackTimeoutRef.current = null;
    }
    setSaveFeedback({ type, message });
    if (type !== "saving") {
      saveFeedbackTimeoutRef.current = setTimeout(() => {
        setSaveFeedback(null);
        saveFeedbackTimeoutRef.current = null;
      }, 3500);
    }
  };

  useEffect(() => {
    if (!(isCreateDialogOpen || isEditDialogOpen)) return;
    if (typeof window === "undefined") return;
    const storageKey = editingAssignment?.id
      ? `aes:teacher:assignment:draft:${teacherEmail}:edit:${editingAssignment.id}`
      : `aes:teacher:assignment:draft:${teacherEmail}:create`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch {
      // Ignore storage errors (private mode/quota) and continue.
    }
  }, [formData, isCreateDialogOpen, isEditDialogOpen, editingAssignment?.id, teacherEmail]);

  const discardPendingChanges = () => {
    if (pendingDiscardTarget === "create") {
      clearAssignmentDraft(null);
      resetForm();
      setIsCreateDialogOpen(false);
    } else if (pendingDiscardTarget === "edit") {
      clearAssignmentDraft(editingAssignment?.id ?? null);
      setEditingAssignment(null);
      setInitialEditSnapshot(null);
      resetForm();
      setIsEditDialogOpen(false);
    }
    setPendingDiscardTarget(null);
    setIsDiscardDialogOpen(false);
  };

  const buildResourceTitle = (input: string) => {
    try {
      const url = new URL(input);
      return url.hostname;
    } catch {
      return input;
    }
  };

  const classifyResourceType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    return 'document';
  };

  const uploadAssignmentResources = async (files: File[]) => {
    if (files.length === 0) return [] as Array<{
      type: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      title: string;
    }>;

    const uploads: Array<{ type: string; fileUrl: string; fileName: string; fileSize: number; title: string }> = [];

    for (const file of files) {
      const presignResponse = await fetch('/api/r2-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          resourceType: 'assignment'
        })
      });

      const presignData = await presignResponse.json();
      if (!presignResponse.ok || !presignData.success) {
        throw new Error(presignData.error || 'Failed to request upload URL');
      }

      const putResponse = await fetch(presignData.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      uploads.push({
        type: classifyResourceType(file),
        fileUrl: presignData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        title: file.name
      });
    }

    return uploads;
  };

  const handleSubmit = async () => {
    // Hard guard against rapid double-clicks before React re-renders disabled state.
    if (submitInFlightRef.current || loading) {
      return;
    }

    if (!formData.title || !formData.description || !formData.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in the title, description, and due date.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    // Collect all student IDs from selected groups
    let allGroupStudentIds: number[] = [];
    const selectedGroups = studentGroups.filter((group) => formData.groupIds.includes(group.id.toString()));
    
    for (const group of selectedGroups) {
      if (group.members.length === 0) {
        toast({
          title: "Empty group",
          description: `Group "${group.name}" has no students.`,
          className: "border-yellow-500 bg-yellow-50 text-yellow-900",
        });
        return;
      }
      allGroupStudentIds.push(...group.members.map((member) => member.id));
    }

    // Remove duplicates if user is also in a group
    allGroupStudentIds = Array.from(new Set(allGroupStudentIds));

    const manualStudentIds = formData.studentIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    const allTargetStudentIds = Array.from(new Set([...allGroupStudentIds, ...manualStudentIds]));
    if (allTargetStudentIds.length === 0) {
      toast({
        title: "No students selected",
        description: "Choose at least one student or one group.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    const selectedStudent = students.find((student) => student.id === allTargetStudentIds[0]) || null;
    const selectedGroupPrograms = Array.from(
      new Set(
        selectedGroups
          .flatMap((group) => group.members.map((member) => member.program))
          .filter((program): program is string => Boolean(program))
      )
    );
    const resolvedProgram = selectedStudent?.program || selectedGroupPrograms[0] || formData.programs[0] || "";
    const resolvedSubject = formData.subject || "";

    const resourceLinks = (formData.resourceLinks || [])
      .map((link) => link.trim())
      .filter(Boolean);
    for (const link of resourceLinks) {
      try {
        // eslint-disable-next-line no-new
        new URL(link);
      } catch {
        toast({
          title: 'Invalid resource link',
          description: `Invalid URL: ${link}`,
          className: 'border-yellow-500 bg-yellow-50 text-yellow-900'
        });
        return;
      }
    }

    submitInFlightRef.current = true;
    setLoading(true);
    showSaveFeedback("saving", editingAssignment ? "Updating assignment..." : "Creating assignment...");
    try {
      const resourceFiles = formData.resourceFiles || [];
      if (resourceFiles.length > 0) {
        showSaveFeedback('saving', 'Uploading resources...');
      }

      const uploadedResources = await uploadAssignmentResources(resourceFiles);
      const linkResources = resourceLinks.map((link) => ({
        type: 'link',
        linkUrl: link,
        title: buildResourceTitle(link)
      }));

      const url = editingAssignment 
        ? `/api/teacher/assignments`
        : `/api/teacher/assignments`;
      
      const method = editingAssignment ? 'PATCH' : 'POST';
      
      const selectedTemplateResourceIds = Array.from(
        new Set(
          (formData.mcqTemplateIds || [])
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
        )
      );
      const mergedResourceIds = Array.from(
        new Set([...(formData.resourceIds || []), ...selectedTemplateResourceIds])
      );

      const {
        resourceFiles: _resourceFiles,
        resourceLinks: _resourceLinks,
        mcqTemplateIds: _mcqTemplateIds,
        ...assignmentPayload
      } = formData;
      const requestData = {
        ...assignmentPayload,
        resourceIds: mergedResourceIds,
        program: resolvedProgram,
        subject: resolvedSubject,
        teacherEmail,
        timezone: getUserTimezone(), // Include timezone for proper UTC conversion
        ...(editingAssignment && { id: editingAssignment.id }),
        studentIds: allTargetStudentIds,
        resourceUploads: [...uploadedResources, ...linkResources]
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const debugReason = data?.debug?.reason ? ` (${data.debug.reason})` : '';
        throw new Error((data?.error || data?.message || `Failed to save assignment (${response.status})`) + debugReason);
      }

      // Close dialogs and reset form
      clearAssignmentDraft(editingAssignment?.id ?? null);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      resetForm();

      const savedAssignment: Assignment | null =
        (data.assignment as Assignment | undefined) ??
        (Array.isArray(data.assignments) && data.assignments.length > 0
          ? (data.assignments[0] as Assignment)
          : null);

      // Update UI immediately, then revalidate in background via parent callback.
      if (editingAssignment) {
        void Promise.resolve(onAssignmentUpdated(savedAssignment));
      } else {
        void Promise.resolve(onAssignmentCreated(savedAssignment));
      }

      toast({
        title: "Assignment saved",
        description: data.message || "The assignment has been saved successfully.",
        className: "border-green-500 bg-green-50 text-green-900",
      });
      showSaveFeedback("success", editingAssignment ? "Assignment updated." : "Assignment created.");

    } catch (error) {
      console.error('Error saving assignment:', error);
      if (error instanceof Error && /Failed to fetch/i.test(error.message)) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'Check Cloudflare R2 CORS settings for PUT requests from this origin.',
        });
      }
      toast({
        variant: "destructive",
        title: "Failed to save assignment",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      showSaveFeedback("error", error instanceof Error ? error.message : "Failed to save assignment.");
    } finally {
      setLoading(false);
      submitInFlightRef.current = false;
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (deletingAssignmentIds.has(assignmentId) || pendingDeleteTimeoutsRef.current.has(assignmentId)) {
      return;
    }

    // Instant UI feedback while server processes soft-delete.
    setOptimisticallyRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(assignmentId);
      return next;
    });
    const finalizeDelete = async () => {
      setDeletingAssignmentIds((prev) => {
        const next = new Set(prev);
        next.add(assignmentId);
        return next;
      });
      try {
        const response = await fetch(`/api/teacher/assignments?id=${assignmentId}&teacherEmail=${encodeURIComponent(teacherEmail)}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete assignment');
        }
        await Promise.resolve(onAssignmentUpdated());
        toast({
          title: "Assignment deleted",
          description: "The assignment has been deleted successfully.",
          className: "border-yellow-500 bg-yellow-50 text-yellow-900",
        });
      } catch (error) {
        setOptimisticallyRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(assignmentId);
          return next;
        });
        console.error('Error deleting assignment:', error);
        toast({
          variant: "destructive",
          title: "Failed to delete assignment",
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setDeletingAssignmentIds((prev) => {
          const next = new Set(prev);
          next.delete(assignmentId);
          return next;
        });
        pendingDeleteTimeoutsRef.current.delete(assignmentId);
      }
    };

    const timeoutId = setTimeout(finalizeDelete, 5000);
    pendingDeleteTimeoutsRef.current.set(assignmentId, timeoutId);

    toast({
      title: "Assignment scheduled for delete",
      description: "Undo within 5 seconds to keep it.",
      action: (
        <ToastAction
          altText="Undo delete"
          onClick={() => {
            const pendingTimeout = pendingDeleteTimeoutsRef.current.get(assignmentId);
            if (pendingTimeout) {
              clearTimeout(pendingTimeout);
              pendingDeleteTimeoutsRef.current.delete(assignmentId);
              setOptimisticallyRemovedIds((prev) => {
                const next = new Set(prev);
                next.delete(assignmentId);
                return next;
              });
              toast({
                title: "Delete cancelled",
                description: "Assignment restored.",
              });
            }
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const visibleAssignments = assignments.filter(
    (assignment) => !optimisticallyRemovedIds.has(assignment.id)
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignment Management</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              setActiveTemplateEditorId(null);
              setIsMcqPdfDialogOpen(true);
            }}
          >
            <FileText className="w-4 h-4" />
            Create Test
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <AssignmentForm
                formData={formData}
                setFormData={setFormData}
                students={students}
                availablePrograms={availablePrograms}
                studentGroups={studentGroups}
                mcqTemplates={mcqTemplates}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleCreateDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Assignment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
                {groupLoadError && (
                  <p className="text-sm text-orange-600">{groupLoadError}</p>
                )}
      </div>

      <McqPdfAssignmentModal
        open={isMcqPdfDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsMcqPdfDialogOpen(nextOpen);
          if (!nextOpen) {
            setActiveTemplateEditorId(null);
          }
        }}
        teacherEmail={teacherEmail}
        initialTemplateId={activeTemplateEditorId}
        onTemplatesUpdated={() => {
          void fetchMcqTemplates();
        }}
      />

      {saveFeedback && (
        <div
          className={
            saveFeedback.type === "saving"
              ? "rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800"
              : saveFeedback.type === "success"
                ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
                : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          }
        >
          {saveFeedback.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Saved MCQ Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {mcqTemplates.length === 0 ? (
            <p className="text-sm text-gray-600">No templates yet. Use “Create Test” to create one.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {mcqTemplates.map((template) => (
                <div key={template.id} className="rounded-md border bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{template.title}</p>
                    <Badge variant="outline" className="text-[10px]">{getMcqTemplateTypeLabel(template.assessmentType)}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{template.fileName || "Linked PDF"}</p>
                  {template.summary && <p className="mt-1 line-clamp-2 text-xs text-gray-600">{template.summary}</p>}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                      {template.updatedAt ? `Updated ${new Date(template.updatedAt).toLocaleString()}` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveTemplateEditorId(template.id);
                          setIsMcqPdfDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={deletingTemplateIds.has(template.id)}
                        onClick={() => {
                          void handleDeleteTemplate(template.id);
                        }}
                      >
                        {deletingTemplateIds.has(template.id) ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment List */}
      <div className="grid gap-4">
        {visibleAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
              <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          visibleAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{assignment.subject}</Badge>
                      {assignment.assignmentTargets && assignment.assignmentTargets.length > 0 ? (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {assignment.assignmentTargets.length === 1
                            ? `Assigned to: ${assignment.assignmentTargets[0].student.name}`
                            : `Assigned to: ${assignment.assignmentTargets.length} students`}
                        </Badge>
                      ) : assignment.targetStudent ? (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Assigned to: {assignment.targetStudent.name}
                        </Badge>
                      ) : null}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {assignment.assignmentTargets && assignment.assignmentTargets.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => toggleExpandedAssignment(assignment.id)}
                        >
                          {expandedAssignmentIds.has(assignment.id) ? "Hide assignees" : "View assignees"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(assignment)} disabled={deletingAssignmentIds.has(assignment.id)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                      disabled={deletingAssignmentIds.has(assignment.id)}
                    >
                      {deletingAssignmentIds.has(assignment.id) ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{assignment.description}</p>

                {expandedAssignmentIds.has(assignment.id) && assignment.assignmentTargets && assignment.assignmentTargets.length > 0 && (
                  <div className="mb-4 rounded-md border bg-blue-50 p-3">
                    <p className="text-sm font-semibold text-blue-900">Assigned students</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {assignment.assignmentTargets.map((target) => {
                        const matchedGroups = studentGroups
                          .filter((group) => group.members.some((member) => member.id === target.student.id))
                          .map((group) => group.name);
                        return (
                          <div key={target.student.id} className="rounded-md border bg-white px-2 py-1 text-xs">
                            <p className="font-medium text-gray-900">{target.student.name}</p>
                            <p className="text-gray-600">
                              {matchedGroups.length > 0
                                ? `Groups: ${matchedGroups.join(", ")}`
                                : "No group"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submissions</p>
                      <p className="font-medium">{assignment.submissions?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-medium">{assignment.totalPoints}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Resources</p>
                      <p className="font-medium">{assignment.resources?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {assignment.allowLateSubmission && (
                  <Badge variant="outline" className="text-xs">
                    Late submissions allowed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          <AssignmentForm 
            formData={formData}
            setFormData={setFormData}
            students={students}
            availablePrograms={availablePrograms}
            studentGroups={studentGroups}
            existingResources={editingAssignment?.resources?.map((item) => item.resource) || []}
            mcqTemplates={mcqTemplates}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => handleEditDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsDiscardDialogOpen(nextOpen);
          if (!nextOpen) {
            setPendingDiscardTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved assignment changes. Discarding now will remove your draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardPendingChanges}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
