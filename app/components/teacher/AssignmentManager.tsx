"use client";

import React, { useEffect, useRef, useState } from "react";
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

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  program: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  isActive: boolean;
  submissions: any[];
  resources: any[];
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

interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  program: string;
  subject: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  studentId: string;
  groupId: string;
}

interface AssignmentManagerProps {
  teacherEmail: string;
  assignments: Assignment[];
  onAssignmentCreated: () => Promise<void> | void;
  onAssignmentUpdated: () => Promise<void> | void;
}

const EMPTY_ASSIGNMENT_FORM: AssignmentFormData = {
  title: "",
  description: "",
  instructions: "",
  program: "",
  subject: "",
  dueDate: "",
  totalPoints: 100,
  allowLateSubmission: false,
  studentId: "",
  groupId: "",
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

// Separate AssignmentForm component to prevent recreation on every render
const AssignmentForm = ({ 
  formData, 
  setFormData, 
  students, 
  availablePrograms,
  studentGroups
}: {
  formData: AssignmentFormData;
  setFormData: (data: AssignmentFormData) => void;
  students: Student[];
  availablePrograms: string[];
  studentGroups: StudentGroup[];
}) => {
  const selectedGroup = formData.groupId
    ? studentGroups.find((group) => group.id.toString() === formData.groupId)
    : null;
  const groupMembers = selectedGroup ? selectedGroup.members : [];

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="program">Program *</Label>
          <Select value={formData.program} onValueChange={(value) => {
            setFormData({ ...formData, program: value, studentId: "", groupId: "" });
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {availablePrograms.map((program) => (
                <SelectItem key={program} value={program}>
                  {program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
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
        <Label htmlFor="group">Assign to Group</Label>
        <Select
          value={formData.groupId}
          onValueChange={(value) => setFormData({ ...formData, groupId: value, studentId: "" })}
          disabled={!formData.program}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.program ? "Select group (optional)" : "Select a program first"} />
          </SelectTrigger>
          <SelectContent>
            {studentGroups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name} ({group.members.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.groupId && groupMembers.length === 0 && (
          <p className="text-sm text-orange-600 mt-1">Selected group has no students.</p>
        )}
      </div>

      {/* Student Selection */}
      <div>
        <Label htmlFor="student">Assign to Student *</Label>
        <Select 
          value={formData.studentId} 
          onValueChange={(value) => setFormData({ ...formData, studentId: value, groupId: "" })}
          disabled={!formData.program}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.program ? "Select student" : "Select a program first"} />
          </SelectTrigger>
          <SelectContent>
            {students
              .filter(student => student.program === formData.program)
              .map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} ({student.grade}) - {student.email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {formData.program && students.filter(s => s.program === formData.program).length === 0 && (
          <p className="text-sm text-orange-600 mt-1">No students found for selected program</p>
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
    </div>
  );
};

export default function AssignmentManager({ teacherEmail, assignments, onAssignmentCreated, onAssignmentUpdated }: AssignmentManagerProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [pendingDiscardTarget, setPendingDiscardTarget] = useState<"create" | "edit" | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const submitInFlightRef = useRef(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [deletingAssignmentIds, setDeletingAssignmentIds] = useState<Set<number>>(new Set());
  const [optimisticallyRemovedIds, setOptimisticallyRemovedIds] = useState<Set<number>>(new Set());
  const [initialEditSnapshot, setInitialEditSnapshot] = useState<AssignmentFormData | null>(null);
  const pendingDeleteTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

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

          setAvailablePrograms(programs);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (teacherEmail) {
      fetchStudents();
    }
  }, [teacherEmail]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/teacher/student-groups?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const data = await response.json();
        if (response.ok && data.groups) {
          setStudentGroups(data.groups);
        }
      } catch (error) {
        console.error('Error fetching student groups:', error);
      }
    };

    if (teacherEmail) {
      fetchGroups();
    }
  }, [teacherEmail]);

  const resetForm = () => {
    setFormData(EMPTY_ASSIGNMENT_FORM);
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setInitialEditSnapshot(null);
    const createDraft = readAssignmentDraft(null);
    setFormData(createDraft || EMPTY_ASSIGNMENT_FORM);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    const snapshot: AssignmentFormData = {
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      program: assignment.program,
      subject: assignment.subject,
      dueDate: assignment.dueDate.split('T')[0], // Format for date input
      totalPoints: assignment.totalPoints,
      allowLateSubmission: assignment.allowLateSubmission,
      studentId: "",
      groupId: ""
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
    };
  }, []);

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

  const handleSubmit = async () => {
    // Hard guard against rapid double-clicks before React re-renders disabled state.
    if (submitInFlightRef.current || loading) {
      return;
    }

    if (!formData.title || !formData.description || !formData.program || !formData.subject || !formData.dueDate || (!formData.studentId && !formData.groupId)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including student or group selection.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    const selectedGroup = formData.groupId
      ? studentGroups.find((group) => group.id.toString() === formData.groupId)
      : null;
    // When a group is selected, send the assignment to ALL members of the group,
    // not just those filtered by program.
    const groupStudentIds = selectedGroup
      ? selectedGroup.members.map((member) => member.id)
      : [];

    if (formData.groupId && groupStudentIds.length === 0) {
      toast({
        title: "No eligible students",
        description: "Selected group has no students.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    submitInFlightRef.current = true;
    setLoading(true);
    try {
      const url = editingAssignment 
        ? `/api/teacher/assignments`
        : `/api/teacher/assignments`;
      
      const method = editingAssignment ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        teacherEmail,
        timezone: getUserTimezone(), // Include timezone for proper UTC conversion
        ...(editingAssignment && { id: editingAssignment.id }),
        ...(formData.groupId ? { studentIds: groupStudentIds } : {})
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assignment');
      }

      // Close dialogs and reset form
      clearAssignmentDraft(editingAssignment?.id ?? null);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      resetForm();

      // Refresh assignments
      if (editingAssignment) {
        await Promise.resolve(onAssignmentUpdated());
      } else {
        await Promise.resolve(onAssignmentCreated());
      }

      toast({
        title: "Assignment saved",
        description: data.message || "The assignment has been saved successfully.",
        className: "border-green-500 bg-green-50 text-green-900",
      });

    } catch (error) {
      console.error('Error saving assignment:', error);
      toast({
        variant: "destructive",
        title: "Failed to save assignment",
        description: error instanceof Error ? error.message : "Please try again.",
      });
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
                      {assignment.targetStudent && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Assigned to: {assignment.targetStudent.name}
                        </Badge>
                      )}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive">Overdue</Badge>
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
