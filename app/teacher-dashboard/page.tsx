"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useRequireAuth } from "../../contexts/AuthContext";
import "../components/chat-no-spinner.css";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import AssignmentManager from "@/components/teacher/AssignmentManager";
import SubmissionReviewer from "@/components/teacher/SubmissionReviewer";
import CustomChatDialog from "../../components/CustomChatDialog";
import StudentProgressModal from "../../components/teacher/RealStudentProgressModal";
import ProgressReportManager from "@/components/teacher/ProgressReportManager";
import DashboardLoadingSkeleton, { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import {
  User,
  BookOpen,
  GraduationCap,
  Search,
  Users,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Mail,
  Phone,
  School,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  LogOut,
  RefreshCw,
  MessageCircle,
  Send,
  Eye,
  Download,
  ExternalLink,
  BarChart3,
  Edit,
  Trash2
} from "lucide-react";

type ResourceCategory = "assignment" | "personal" | "general";

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  schoolName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  program: string;
  mainProgram: string;
  enrollments: Array<{
    program: string;
    subject: string;
    isActive: boolean;
  }>;
  recentSubmissions: Array<{
    id: number;
    submittedAt: string;
    grade: number | null;
    status: string;
    assignment: {
      title: string;
      subject: string;
    };
  }>;
  assignedAt: string;
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

interface Teacher {
  id: number;
  name: string;
  email: string;
  programs: string[];
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  program: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  instructions: string;
  allowLateSubmission: boolean;
  submissions: Array<{
    id: number;
    studentName?: string;
    studentEmail?: string;
    submittedAt: string;
    grade: number | null;
    status: string;
    feedback: string | null;
    student?: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  resources: Array<{
    id: number;
    name: string;
    url: string;
    resource?: any;
  }>;
  _count?: {
    submissions: number;
  };
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

interface TeacherResource {
  id: number;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string | null;
  linkUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  program: string;
  subject: string;
  grade: string;
  isPublic: boolean;
  createdAt: string;
  assignmentLinks: Array<{
    assignment: {
      id: number;
      title: string;
    };
  }>;
  studentAssignments: Array<{
    student: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

interface ResourceFormState {
  title: string;
  description: string;
  type: string;
  linkUrl: string;
  program: string;
  subject: string;
  grade: string;
  category: ResourceCategory;
  assignmentId: number | null;
  studentIds: number[];
  existingFileUrl: string | null;
  existingFileName: string | null;
  existingFileSize: number | null;
}

export default function TeacherDashboard() {
  // Authentication - require teacher role
  const { user: authUser, isLoading: authLoading } = useRequireAuth('teacher');
  const { toast } = useToast();

  // All state hooks must be declared first
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupStudentIds, setGroupStudentIds] = useState<number[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const createGroupInFlightRef = useRef(false);

  const createEmptyResourceForm = (defaultProgram = ""): ResourceFormState => ({
    title: "",
    description: "",
    type: "document",
    linkUrl: "",
    program: defaultProgram,
    subject: "",
    grade: "",
    category: "personal",
    assignmentId: null,
    studentIds: [],
    existingFileUrl: null,
    existingFileName: null,
    existingFileSize: null,
  });

  // Resource sending state
  const [newResource, setNewResource] = useState<ResourceFormState>(createEmptyResourceForm(""));
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const [sendingResource, setSendingResource] = useState(false);
  const sendResourceInFlightRef = useRef(false);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [resourceGroupIds, setResourceGroupIds] = useState<string[]>([]);
  const [resourceSaveFeedback, setResourceSaveFeedback] = useState<{
    type: "saving" | "success" | "error";
    message: string;
  } | null>(null);
  const resourceFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resources, setResources] = useState<TeacherResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceListError, setResourceListError] = useState<string | null>(null);
  const [resourceActionLoadingIds, setResourceActionLoadingIds] = useState<Set<number>>(new Set());
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editResource, setEditResource] = useState<ResourceFormState>(createEmptyResourceForm(""));
  const [editResourceFile, setEditResourceFile] = useState<File | null>(null);
  const [editResourceGroupIds, setEditResourceGroupIds] = useState<string[]>([]);
  const [editResourceError, setEditResourceError] = useState<string | null>(null);
  const [savingEditedResource, setSavingEditedResource] = useState(false);
  const [editResourceSaveFeedback, setEditResourceSaveFeedback] = useState<{
    type: "saving" | "success" | "error";
    message: string;
  } | null>(null);
  const editResourceFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Student submissions state
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [remarkText, setRemarkText] = useState("");
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const addRemarkInFlightRef = useRef(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatStudent, setSelectedChatStudent] = useState<Student | null>(null);
  const [selectedChatParent, setSelectedChatParent] = useState<{ id: number, name: string } | null>(null);

  // Parent conversations state
  const [parentConversations, setParentConversations] = useState<any[]>([]);
  const [loadingParentConversations, setLoadingParentConversations] = useState(false);

  // Progress modal state
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedProgressStudent, setSelectedProgressStudent] = useState<Student | null>(null);
  const [isUrlStateReady, setIsUrlStateReady] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get teacher email from authenticated user
  const teacherEmail = authUser?.email || "";

  // Prefill defaults once teacher data is available
  useEffect(() => {
    if (teacher?.programs?.length) {
      setNewResource((prev) => ({
        ...prev,
        program: prev.program || teacher.programs[0]
      }));
    }
  }, [teacher]);

  // Fetch functions
  const fetchTeacherData = async () => {
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort("request-timeout");
    }, 15000);
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (response.ok && data.teacher) {
        setTeacher(data.teacher);
        setStudents(data.students || []);
      } else {
        setError(data.error || 'Failed to fetch teacher data');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (didTimeout) {
          setError("Dashboard load timed out. Please retry.");
        }
        return;
      } else {
        setError('Failed to fetch teacher data');
        console.error('Error fetching teacher data:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const fetchStudentGroups = async () => {
    if (!teacherEmail) return;
    try {
      const response = await fetch(`/api/teacher/student-groups?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (data.success) {
        setStudentGroups(data.groups || []);
      } else {
        console.error('Failed to fetch student groups:', data.error);
      }
    } catch (err) {
      console.error('Error fetching student groups:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (createGroupInFlightRef.current || creatingGroup) return;
    setGroupError(null);

    if (!teacherEmail) {
      const message = "Teacher email not available.";
      setGroupError(message);
      toast({
        variant: "destructive",
        title: "Cannot create group",
        description: message,
      });
      return;
    }

    if (!groupName.trim()) {
      const message = "Group name is required.";
      setGroupError(message);
      toast({
        title: "Missing group name",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (groupStudentIds.length === 0) {
      const message = "Select at least one student.";
      setGroupError(message);
      toast({
        title: "No students selected",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    createGroupInFlightRef.current = true;
    setCreatingGroup(true);
    try {
      const response = await fetch("/api/teacher/student-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherEmail,
          name: groupName.trim(),
          studentIds: groupStudentIds
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create group");
      }

      setGroupName("");
      setGroupStudentIds([]);
      await fetchStudentGroups();
      toast({
        title: "Group created",
        description: "Students have been grouped successfully.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create group";
      setGroupError(message);
      toast({
        variant: "destructive",
        title: "Failed to create group",
        description: message,
      });
    } finally {
      setCreatingGroup(false);
      createGroupInFlightRef.current = false;
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `/api/teacher/assignments?teacherEmail=${encodeURIComponent(teacherEmail)}&_=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);
      } else {
        console.error('Failed to fetch assignments:', data.error);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchResources = async () => {
    if (!teacherEmail) return;
    try {
      setResourcesLoading(true);
      setResourceListError(null);
      const response = await fetch(
        `/api/teacher/resources?teacherEmail=${encodeURIComponent(teacherEmail)}&_=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (data.success) {
        setResources(data.resources || []);
      } else {
        setResourceListError(data.error || "Failed to fetch resources");
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResourceListError("Failed to fetch resources");
    } finally {
      setResourcesLoading(false);
    }
  };

  const getAssignmentStudentIds = (assignmentId: number | null) => {
    if (!assignmentId) return [];
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return [];
    return Array.from(
      new Set([
        ...(assignment.assignmentTargets || []).map((target) => target.student.id),
        ...(assignment.targetStudent ? [assignment.targetStudent.id] : [])
      ])
    );
  };

  const getStudentIdsFromGroups = (groupIds: string[]) =>
    Array.from(
      new Set(
        groupIds.flatMap((groupId) => {
          const group = studentGroups.find((item) => item.id.toString() === groupId);
          return group ? group.members.map((member) => member.id) : [];
        })
      )
    );

  const inferResourceCategory = (resource: TeacherResource): ResourceCategory => {
    if (resource.assignmentLinks.length > 0) return "assignment";
    if (resource.isPublic) return "general";
    return "personal";
  };

  const mergeAssignmentIntoState = (assignment?: any | null) => {
    if (!assignment || typeof assignment.id !== "number") return;
    setAssignments((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === assignment.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], ...assignment } as Assignment;
        return next;
      }
      return [assignment as Assignment, ...prev];
    });
  };

  const handleAssignmentCreated = (assignment?: any | null) => {
    mergeAssignmentIntoState(assignment);
    void fetchAssignments();
  };

  const handleAssignmentUpdated = (assignment?: any | null) => {
    mergeAssignmentIntoState(assignment);
    void fetchAssignments();
  };

  const resetResourceForm = () => {
    setNewResource(createEmptyResourceForm(teacher?.programs?.[0] || ""));
    setNewResourceFile(null);
    setResourceError(null);
    setResourceGroupIds([]);
  };

  const showResourceSaveFeedback = (type: "saving" | "success" | "error", message: string) => {
    if (resourceFeedbackTimeoutRef.current) {
      clearTimeout(resourceFeedbackTimeoutRef.current);
      resourceFeedbackTimeoutRef.current = null;
    }
    setResourceSaveFeedback({ type, message });
    if (type !== "saving") {
      resourceFeedbackTimeoutRef.current = setTimeout(() => {
        setResourceSaveFeedback(null);
        resourceFeedbackTimeoutRef.current = null;
      }, 3500);
    }
  };

  const showEditResourceSaveFeedback = (type: "saving" | "success" | "error", message: string) => {
    if (editResourceFeedbackTimeoutRef.current) {
      clearTimeout(editResourceFeedbackTimeoutRef.current);
      editResourceFeedbackTimeoutRef.current = null;
    }
    setEditResourceSaveFeedback({ type, message });
    if (type !== "saving") {
      editResourceFeedbackTimeoutRef.current = setTimeout(() => {
        setEditResourceSaveFeedback(null);
        editResourceFeedbackTimeoutRef.current = null;
      }, 3500);
    }
  };

  const openEditResourceDialog = (resource: TeacherResource) => {
    const inferredCategory = inferResourceCategory(resource);
    const assignmentId = inferredCategory === "assignment"
      ? resource.assignmentLinks[0]?.assignment.id ?? null
      : null;
    setEditingResourceId(resource.id);
    setEditResource({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      linkUrl: resource.linkUrl || "",
      program: resource.program || "",
      subject: resource.subject || "",
      grade: resource.grade || "",
      category: inferredCategory,
      assignmentId,
      studentIds: inferredCategory === "assignment"
        ? []
        : resource.studentAssignments.map((item) => item.student.id),
      existingFileUrl: resource.fileUrl,
      existingFileName: resource.fileName,
      existingFileSize: resource.fileSize,
    });
    setEditResourceFile(null);
    setEditResourceGroupIds([]);
    setEditResourceError(null);
    setEditResourceSaveFeedback(null);
    setIsEditResourceDialogOpen(true);
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (resourceActionLoadingIds.has(resourceId)) return;
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;
    setResourceActionLoadingIds((prev) => new Set(prev).add(resourceId));
    try {
      const response = await fetch(
        `/api/teacher/resources?id=${resourceId}&teacherEmail=${encodeURIComponent(teacherEmail)}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete resource");
      }
      setResources((prev) => prev.filter((item) => item.id !== resourceId));
      toast({
        title: "Resource deleted",
        description: "The resource has been removed.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete resource.",
      });
    } finally {
      setResourceActionLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
    }
  };

  const handleSendResource = async () => {
    if (sendResourceInFlightRef.current || sendingResource) return;
    setResourceError(null);
    setResourceSaveFeedback(null);

    const isAssignmentCategory = newResource.category === "assignment";
    const selectedAssignmentForSend = isAssignmentCategory && newResource.assignmentId
      ? assignments.find((assignment) => assignment.id === newResource.assignmentId)
      : null;
    const assignmentStudentIds = selectedAssignmentForSend
      ? Array.from(
          new Set([
            ...(selectedAssignmentForSend.assignmentTargets || []).map((target) => target.student.id),
            ...(selectedAssignmentForSend.targetStudent ? [selectedAssignmentForSend.targetStudent.id] : [])
          ])
        )
      : [];
    const groupedStudentIds = Array.from(
      new Set(
        resourceGroupIds.flatMap((groupId) => {
          const group = studentGroups.find((item) => item.id.toString() === groupId);
          return group ? group.members.map((member) => member.id) : [];
        })
      )
    );
    const manuallySelectedStudentIds = Array.from(new Set(newResource.studentIds));
    const directStudentIds = Array.from(new Set([...groupedStudentIds, ...manuallySelectedStudentIds]));
    const targetStudentIds = isAssignmentCategory ? assignmentStudentIds : directStudentIds;
    const normalizedLinkUrl = newResource.linkUrl.trim();

    if (!teacherEmail) {
      const message = "Teacher email not available.";
      setResourceError(message);
      toast({
        variant: "destructive",
        title: "Cannot send resource",
        description: message,
      });
      return;
    }

    if (!newResource.title.trim()) {
      const message = "Title is required.";
      setResourceError(message);
      toast({
        title: "Missing title",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (!newResource.type) {
      const message = "Type is required.";
      setResourceError(message);
      toast({
        title: "Missing type",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (newResource.category === "assignment" && !newResource.assignmentId) {
      const message = "Select an assignment for this category.";
      setResourceError(message);
      toast({
        title: "Assignment required",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (isAssignmentCategory && assignmentStudentIds.length === 0) {
      const message = "Selected assignment has no assigned students.";
      setResourceError(message);
      toast({
        title: "No assignment students",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (!isAssignmentCategory && newResource.category === "personal" && targetStudentIds.length === 0) {
      const message = "Select at least one student or group.";
      setResourceError(message);
      toast({
        title: "No students selected",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (newResource.type === "link" && !normalizedLinkUrl) {
      const message = "Provide a link URL for link type resources.";
      setResourceError(message);
      toast({
        title: "Link URL required",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    if (newResource.type !== "link" && !newResourceFile && !normalizedLinkUrl) {
      const message = "Attach a file or provide a link URL.";
      setResourceError(message);
      toast({
        title: "File or link required",
        description: message,
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      return;
    }

    sendResourceInFlightRef.current = true;
    setSendingResource(true);
    showResourceSaveFeedback("saving", "Sending resource...");
    try {
      let fileUrl: string | null = null;

      if (newResourceFile) {
        const formData = new FormData();
        formData.append("file", newResourceFile);
        formData.append("studentId", "0");
        formData.append("assignmentId", newResource.assignmentId ? newResource.assignmentId.toString() : "0");

        const uploadResponse = await fetch("/api/upload-r2", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }
        fileUrl = uploadData.fileUrl;
      }

      const payload = {
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        fileUrl,
        linkUrl: normalizedLinkUrl || null,
        fileName: newResourceFile?.name,
        fileSize: newResourceFile?.size,
        program: newResource.program?.trim() || selectedAssignmentForSend?.program || "",
        subject: newResource.subject?.trim() || selectedAssignmentForSend?.subject || "",
        grade: newResource.grade?.trim() || "",
        teacherEmail,
        isPublic: newResource.category === "general",
        assignmentIds: newResource.category === "assignment" && newResource.assignmentId ? [newResource.assignmentId] : [],
        studentIds: targetStudentIds,
      };

      const createResponse = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await createResponse.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send resource");
      }

      if (data.resource) {
        setResources((prev) => {
          const rest = prev.filter((item) => item.id !== data.resource.id);
          return [data.resource, ...rest];
        });
      }
      void fetchResources();

      resetResourceForm();
      toast({
        title: "Resource sent",
        description: isAssignmentCategory
          ? "Your resource has been linked to the selected assignment."
          : newResource.category === "general"
            ? "Your resource has been published."
            : "Your resource has been shared with the selected students.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      showResourceSaveFeedback(
        "success",
        isAssignmentCategory
          ? "Resource linked to assignment."
          : newResource.category === "general"
            ? "Resource published."
            : "Resource shared with students."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send resource";
      setResourceError(message);
      console.error("Send resource error:", err);
      toast({
        variant: "destructive",
        title: "Failed to send resource",
        description: message,
      });
      showResourceSaveFeedback("error", message);
    } finally {
      setSendingResource(false);
      sendResourceInFlightRef.current = false;
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResourceId || savingEditedResource) return;
    setEditResourceError(null);
    setEditResourceSaveFeedback(null);

    const isAssignmentCategory = editResource.category === "assignment";
    const assignmentStudentIds = getAssignmentStudentIds(editResource.assignmentId);
    const groupedStudentIds = getStudentIdsFromGroups(editResourceGroupIds);
    const directStudentIds = Array.from(new Set([...groupedStudentIds, ...editResource.studentIds]));
    const targetStudentIds = isAssignmentCategory ? assignmentStudentIds : directStudentIds;
    const normalizedLinkUrl = editResource.linkUrl.trim();

    if (!editResource.title.trim()) {
      setEditResourceError("Title is required.");
      return;
    }
    if (!editResource.type) {
      setEditResourceError("Type is required.");
      return;
    }
    if (isAssignmentCategory && !editResource.assignmentId) {
      setEditResourceError("Select an assignment.");
      return;
    }
    if (isAssignmentCategory && assignmentStudentIds.length === 0) {
      setEditResourceError("Selected assignment has no assigned students.");
      return;
    }
    if (!isAssignmentCategory && editResource.category === "personal" && targetStudentIds.length === 0) {
      setEditResourceError("Select at least one student or group.");
      return;
    }
    if (editResource.type === "link" && !normalizedLinkUrl) {
      setEditResourceError("Provide a link URL for link type resources.");
      return;
    }
    if (editResource.type !== "link" && !editResourceFile && !normalizedLinkUrl && !editResource.existingFileUrl) {
      setEditResourceError("Attach a file or provide a link URL.");
      return;
    }

    setSavingEditedResource(true);
    showEditResourceSaveFeedback("saving", "Updating resource...");
    try {
      let uploadedFileUrl: string | null = null;
      let uploadedFileName: string | null = null;
      let uploadedFileSize: number | null = null;

      if (editResourceFile) {
        const formData = new FormData();
        formData.append("file", editResourceFile);
        formData.append("studentId", "0");
        formData.append("assignmentId", editResource.assignmentId ? editResource.assignmentId.toString() : "0");
        const uploadResponse = await fetch("/api/upload-r2", { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }
        uploadedFileUrl = uploadData.fileUrl;
        uploadedFileName = editResourceFile.name;
        uploadedFileSize = editResourceFile.size;
      }

      const selectedEditAssignment = editResource.assignmentId
        ? assignments.find((item) => item.id === editResource.assignmentId)
        : null;

      const payload: any = {
        id: editingResourceId,
        title: editResource.title,
        description: editResource.description,
        type: editResource.type,
        linkUrl: normalizedLinkUrl || null,
        program: editResource.program?.trim() || selectedEditAssignment?.program || "",
        subject: editResource.subject?.trim() || selectedEditAssignment?.subject || "",
        grade: editResource.grade?.trim() || "",
        teacherEmail,
        isPublic: editResource.category === "general",
        assignmentIds: isAssignmentCategory && editResource.assignmentId ? [editResource.assignmentId] : [],
        studentIds: targetStudentIds,
      };

      if (uploadedFileUrl !== null) {
        payload.fileUrl = uploadedFileUrl;
        payload.fileName = uploadedFileName;
        payload.fileSize = uploadedFileSize;
      } else if (editResource.type !== "link") {
        payload.fileUrl = editResource.existingFileUrl;
        payload.fileName = editResource.existingFileName;
        payload.fileSize = editResource.existingFileSize;
      } else {
        payload.fileUrl = null;
        payload.fileName = null;
        payload.fileSize = null;
      }

      const response = await fetch("/api/teacher/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update resource");
      }

      if (data.resource) {
        setResources((prev) => {
          const next = [...prev];
          const index = next.findIndex((item) => item.id === data.resource.id);
          if (index >= 0) {
            next[index] = data.resource;
            return next;
          }
          return [data.resource, ...next];
        });
      }
      void fetchResources();
      setIsEditResourceDialogOpen(false);
      setEditingResourceId(null);
      setEditResource(createEmptyResourceForm(teacher?.programs?.[0] || ""));
      setEditResourceFile(null);
      setEditResourceGroupIds([]);
      toast({
        title: "Resource updated",
        description: "Changes saved successfully.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      showEditResourceSaveFeedback("success", "Resource updated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update resource";
      setEditResourceError(message);
      showEditResourceSaveFeedback("error", message);
    } finally {
      setSavingEditedResource(false);
    }
  };

  const fetchStudentSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      setSubmissionsError(null);
      const response = await fetch(`/api/teacher/submissions/resources?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();

      if (data.success) {
        setStudentSubmissions(data.submissions);
      } else {
        setSubmissionsError(data.error || "Failed to fetch student submissions");
        console.error('Failed to fetch student submissions:', data.error);
      }
    } catch (err) {
      setSubmissionsError(err instanceof Error ? err.message : "Failed to fetch student submissions");
      console.error('Error fetching student submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchParentConversations = async () => {
    if (!teacher?.id) return;

    try {
      setLoadingParentConversations(true);
      const response = await fetch(`/api/teacher/conversations?teacherId=${teacher.id}`);
      const data = await response.json();

      if (data.success) {
        // Filter to only show parent conversations
        const parents = data.conversations.filter((c: any) => c.recipientRole === 'parent');
        setParentConversations(parents);
      } else {
        console.error('Failed to fetch parent conversations:', data.error);
      }
    } catch (err) {
      console.error('Error fetching parent conversations:', err);
    } finally {
      setLoadingParentConversations(false);
    }
  };

  const handleAddRemark = async (submissionId: number) => {
    if (addRemarkInFlightRef.current || isAddingRemark) return;
    if (!remarkText.trim()) return;

    try {
      addRemarkInFlightRef.current = true;
      setIsAddingRemark(true);
      const response = await fetch('/api/teacher/submissions/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherEmail,
          submissionId,
          remark: remarkText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh submissions
        await fetchStudentSubmissions();
        setSelectedSubmission(null);
        setRemarkText("");
        toast({
          title: "Feedback sent",
          description: "Your feedback has been saved for the student.",
          className: "border-slate-300 bg-slate-100 text-slate-800",
        });
      } else {
        console.error('Failed to add remark:', data.error);
        toast({
          variant: "destructive",
          title: "Failed to save feedback",
          description: data.error || "Please try again.",
        });
      }
    } catch (err) {
      console.error('Error adding remark:', err);
      toast({
        variant: "destructive",
        title: "Failed to save feedback",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsAddingRemark(false);
      addRemarkInFlightRef.current = false;
    }
  };

  // useEffect hooks - must be after function declarations but before any conditional returns
  useEffect(() => {
    if (teacherEmail) {
      fetchAssignments();
      fetchTeacherData();
      fetchStudentGroups();
      fetchResources();
    }
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading) {
      setAuthTimedOut(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      setAuthTimedOut(true);
    }, 15000);
    return () => clearTimeout(timeoutId);
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (authUser && !teacherEmail) {
      setLoading(false);
      setError("Unable to load your account email. Please log out and sign in again.");
    }
  }, [authLoading, authUser, teacherEmail]);

  useEffect(() => {
    if (teacherEmail) {
      fetchStudentSubmissions();
    }
  }, [teacherEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (resourceFeedbackTimeoutRef.current) {
        clearTimeout(resourceFeedbackTimeoutRef.current);
        resourceFeedbackTimeoutRef.current = null;
      }
      if (editResourceFeedbackTimeoutRef.current) {
        clearTimeout(editResourceFeedbackTimeoutRef.current);
        editResourceFeedbackTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (teacher?.id) {
      fetchParentConversations();
    }
  }, [teacher?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const q = params.get("q");
    const program = params.get("program");
    const allowedTabs = new Set(["students", "assignments", "submissions", "resources", "progress", "schedule"]);

    if (tab && allowedTabs.has(tab)) {
      setActiveTab(tab);
    }
    if (q !== null) {
      setSearch(q);
    }
    if (program) {
      setSelectedProgram(program);
    }
    setIsUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (!isUrlStateReady) return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", activeTab);
    if (search.trim()) params.set("q", search.trim());
    else params.delete("q");
    if (selectedProgram) params.set("program", selectedProgram);
    else params.delete("program");
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    const currentUrl = `${pathname}${window.location.search}`;
    if (nextUrl === currentUrl) return;
    router.replace(nextUrl, { scroll: false });
  }, [activeTab, search, selectedProgram, isUrlStateReady, pathname, router]);

  // Early return for authentication loading (AFTER all hooks)
  if (authLoading && !authTimedOut) {
    return <DashboardLoadingSkeleton role="teacher" tab={activeTab} />;
  }

  if (authLoading && authTimedOut) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-100">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">Authentication is taking too long.</div>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!authUser) {
    return null;
  }

  // Filter students by selected program and search
  const filteredStudents = students.filter(
    (student) =>
      (!selectedProgram || student.program === selectedProgram) &&
      (student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter assignments by selected program
  const filteredAssignments = assignments.filter(
    (assignment) =>
      (!selectedProgram || assignment.program === selectedProgram)
  );

  if (loading) {
    return <DashboardLoadingSkeleton role="teacher" tab={activeTab} />;
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-100">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">Error: {error}</div>
              <Button onClick={fetchTeacherData}>Try Again</Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!teacher) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-100">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 text-xl">Teacher not found</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Sidebar items
  const sidebarItems = [
    {
      title: "Students",
      icon: Users,
      value: "students",
    },
    {
      title: "Assignments",
      icon: BookOpen,
      value: "assignments",
    },
    {
      title: "Submissions",
      icon: FileText,
      value: "submissions",
    },
    {
      title: "Resources",
      icon: GraduationCap,
      value: "resources",
    },
    {
      title: "Progress Reports",
      icon: BarChart3,
      value: "progress",
    },
    {
      title: "Schedule",
      icon: Calendar,
      value: "schedule",
    },
  ];

  const tabMeta: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
    students: {
      title: "Students",
      description: "Track learners, groups, and direct communication with families.",
      icon: Users,
    },
    assignments: {
      title: "Assignments",
      description: "Create, edit, and publish work with clear due dates and expectations.",
      icon: BookOpen,
    },
    submissions: {
      title: "Submissions",
      description: "Review student work and provide structured feedback.",
      icon: FileText,
    },
    resources: {
      title: "Resources",
      description: "Share learning resources by assignment, group, or individual student.",
      icon: GraduationCap,
    },
    progress: {
      title: "Progress Reports",
      description: "Monitor growth trends and publish progress snapshots.",
      icon: BarChart3,
    },
    schedule: {
      title: "Schedule",
      description: "Plan upcoming sessions and coordinate teaching availability.",
      icon: Calendar,
    },
  };

  const currentTabMeta = tabMeta[activeTab] || tabMeta.students;
  const selectedResourceAssignment = newResource.assignmentId
    ? assignments.find((assignment) => assignment.id === newResource.assignmentId) || null
    : null;
  const assignmentAutoStudentIds = selectedResourceAssignment
    ? Array.from(
        new Set([
          ...(selectedResourceAssignment.assignmentTargets || []).map((target) => target.student.id),
          ...(selectedResourceAssignment.targetStudent ? [selectedResourceAssignment.targetStudent.id] : [])
        ])
      )
    : [];
  const groupedResourceStudentIdSet = new Set(
    resourceGroupIds.flatMap((groupId) => {
      const group = studentGroups.find((item) => item.id.toString() === groupId);
      return group ? group.members.map((member) => member.id) : [];
    })
  );
  const isAssignmentResourceCategory = newResource.category === "assignment";
  const isResourceSubmitDisabled =
    sendingResource ||
    !newResource.title.trim() ||
    !newResource.type ||
    (isAssignmentResourceCategory && !newResource.assignmentId);
  const selectedEditResourceAssignment = editResource.assignmentId
    ? assignments.find((assignment) => assignment.id === editResource.assignmentId) || null
    : null;
  const editAssignmentAutoStudentIds = selectedEditResourceAssignment
    ? Array.from(
        new Set([
          ...(selectedEditResourceAssignment.assignmentTargets || []).map((target) => target.student.id),
          ...(selectedEditResourceAssignment.targetStudent ? [selectedEditResourceAssignment.targetStudent.id] : [])
        ])
      )
    : [];
  const groupedEditResourceStudentIdSet = new Set(getStudentIdsFromGroups(editResourceGroupIds));
  const isEditAssignmentResourceCategory = editResource.category === "assignment";
  const isEditResourceSubmitDisabled =
    savingEditedResource ||
    !editResource.title.trim() ||
    !editResource.type ||
    (isEditAssignmentResourceCategory && !editResource.assignmentId);
  const reviewPendingCount = studentSubmissions.filter((submission) => !submission.hasMyRemark).length;
  const dashboardStats = [
    { label: "Students", value: filteredStudents.length, icon: Users },
    { label: "Groups", value: studentGroups.length, icon: GraduationCap },
    { label: "Assignments", value: filteredAssignments.length, icon: BookOpen },
    { label: "Needs Review", value: reviewPendingCount, icon: AlertCircle },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-100">
        <Sidebar variant="inset" className="border-r border-slate-200/80 bg-white/85 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/80 bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-slate-300">
                <AvatarFallback className="bg-slate-900 text-white font-semibold">
                  {teacher?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {teacher?.name || "Teacher"}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {teacher?.email || ""}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={activeTab === item.value}
                        onClick={() => setActiveTab(item.value)}
                        className={cn(
                          "w-full rounded-md transition-colors hover:bg-slate-100",
                          activeTab === item.value && "bg-slate-900 text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      window.location.href = '/';
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="flex min-h-16 items-center gap-2 px-4 md:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex items-center gap-2 flex-1">
                <h1 className="text-lg font-semibold text-slate-900">
                  Teacher Dashboard
                </h1>
                <Badge variant="outline" className="hidden md:inline-flex border-slate-300 bg-slate-100 text-slate-700">
                  {currentTabMeta.title}
                </Badge>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <select
                  value={selectedProgram ?? ""}
                  onChange={(event) => setSelectedProgram(event.target.value || null)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="">All Programs</option>
                  {teacher.programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 teacher-chat-no-spinner">
            <Card className="border border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                      <currentTabMeta.icon className="h-5 w-5 text-slate-700" />
                      {currentTabMeta.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      {currentTabMeta.description}
                    </CardDescription>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700 border border-slate-300">
                    {teacher.programs.length} Program{teacher.programs.length === 1 ? "" : "s"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {dashboardStats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
                        <stat.icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Students Tab */}
            {activeTab === "students" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Parent Conversations Section */}
                {parentConversations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                      <Users className="h-5 w-5" />
                      Parent Conversations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {parentConversations.map((parent) => (
                        <Card key={parent.recipientId} className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{parent.recipientName}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{parent.lastMessage}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(parent.lastMessageTime).toLocaleDateString()}
                                </p>
                                {parent.unreadCount > 0 && (
                                  <Badge className="mt-2 bg-slate-900 text-white">
                                    {parent.unreadCount} unread
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-3 border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={() => {
                                  setSelectedChatParent({ id: parent.recipientId, name: parent.recipientName });
                                  setSelectedChatStudent(null); // Clear student selection
                                  setIsChatOpen(true);
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="border-t border-slate-200 my-6"></div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                      <Users className="h-5 w-5" />
                      Student Groups
                    </h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Group
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[520px]">
                        <DialogHeader>
                          <DialogTitle>Create Student Group</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Group Name *</Label>
                            <Input
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                              placeholder="e.g. Algebra MWF"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Select Students *</Label>
                            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                              {students.map((student) => (
                                <label key={student.id} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={groupStudentIds.includes(student.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setGroupStudentIds([...groupStudentIds, student.id]);
                                      } else {
                                        setGroupStudentIds(groupStudentIds.filter((id) => id !== student.id));
                                      }
                                    }}
                                  />
                                  <span className="flex-1">
                                    {student.name} <span className="text-gray-500">({student.email})</span>
                                  </span>
                                </label>
                              ))}
                              {students.length === 0 && (
                                <p className="text-sm text-gray-500">No students found.</p>
                              )}
                            </div>
                          </div>
                          {groupError && <p className="text-sm text-red-600">{groupError}</p>}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGroupName("");
                              setGroupStudentIds([]);
                              setGroupError(null);
                            }}
                          >
                            Reset
                          </Button>
                          <Button onClick={handleCreateGroup} disabled={creatingGroup}>
                            {creatingGroup ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Group
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {studentGroups.length === 0 ? (
                    <Card className="border border-dashed border-slate-300 bg-slate-50/60">
                      <CardContent className="py-10 text-center">
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Create your first group to manage students together.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentGroups.map((group) => (
                        <Card key={group.id} className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-slate-900 text-lg">
                              <span className="truncate">{group.name}</span>
                              <Badge variant="outline" className="bg-slate-50">
                                {group.members.length} students
                              </Badge>
                            </CardTitle>
                            <div className="text-xs text-gray-500">
                              {new Date(group.createdAt).toLocaleDateString()}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {group.members.length === 0 ? (
                              <p className="text-sm text-gray-500">No students assigned.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {group.members.slice(0, 4).map((member) => (
                                  <Badge key={member.id} variant="secondary" className="bg-gray-100 text-gray-700">
                                    {member.name}
                                  </Badge>
                                ))}
                                {group.members.length > 4 && (
                                  <Badge variant="outline" className="text-gray-500">
                                    +{group.members.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900">
                  <GraduationCap className="h-5 w-5" />
                  Students
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-12">
                      No students found.
                    </div>
                  )}
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                          <User className="h-5 w-5" />
                          {student.name}
                        </CardTitle>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Program Badges */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                              {student.program}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                              {student.grade}
                            </Badge>
                          </div>

                          {/* School Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <School className="h-4 w-4" />
                            {student.schoolName}
                          </div>

                          {/* Parent Info */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Parent: {student.parentName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.parentEmail}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.parentPhone}
                            </div>
                          </div>

                          {/* Recent Submissions */}
                          {student.recentSubmissions.length > 0 && (
                            <div className="text-xs">
                              <div className="font-medium text-gray-700 mb-1">Recent Submissions:</div>
                              {student.recentSubmissions.slice(0, 2).map((submission, idx) => (
                                <div key={idx} className="text-gray-500 flex justify-between">
                                  <span>{submission.assignment.title}</span>
                                  <span className={submission.grade ? 'text-slate-700' : 'text-slate-500'}>
                                    {submission.grade ? `${submission.grade}%` : 'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-300 hover:bg-slate-50"
                              onClick={() => {
                                setSelectedProgressStudent(student);
                                setIsProgressModalOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                              onClick={() => {
                                setSelectedChatStudent(student);
                                setSelectedChatParent(null); // Clear parent selection
                                setIsChatOpen(true);
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">Assignment Manager</CardTitle>
                    <CardDescription>Create, edit, and maintain assignment workflows.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssignmentManager
                      teacherEmail={teacherEmail}
                      assignments={assignments}
                      onAssignmentCreated={handleAssignmentCreated}
                      onAssignmentUpdated={handleAssignmentUpdated}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">Submission Review</CardTitle>
                    <CardDescription>Grade work, annotate feedback, and track follow-ups.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubmissionReviewer teacherEmail={teacherEmail} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Send resource to students */}
                <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                      <Send className="h-5 w-5" />
                      Send Resource to Students
                    </CardTitle>
                    <CardDescription>
                      Pick a category first. Assignment resources use assignment assignees automatically, while personal/general can target groups or individual students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={newResource.title}
                          onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                          placeholder="Resource title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <select
                          value={newResource.category}
                          onChange={(e) => {
                            const nextCategory = e.target.value as ResourceCategory;
                            setNewResource((prev) => ({
                              ...prev,
                              category: nextCategory,
                              assignmentId: nextCategory === "assignment" ? prev.assignmentId : null,
                              studentIds: nextCategory === "assignment" ? [] : prev.studentIds
                            }));
                            if (nextCategory === "assignment") {
                              setResourceGroupIds([]);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="assignment">Assignment</option>
                          <option value="personal">Personal</option>
                          <option value="general">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={newResource.description}
                          onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                          placeholder="Short description (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <select
                          value={newResource.type}
                          onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="image">Image</option>
                          <option value="link">Link</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Program</Label>
                        <Input
                          value={newResource.program}
                          onChange={(e) => setNewResource({ ...newResource, program: e.target.value })}
                          placeholder="Optional override"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={newResource.subject}
                          onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                          placeholder="Optional override"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Grade</Label>
                        <Input
                          value={newResource.grade}
                          onChange={(e) => setNewResource({ ...newResource, grade: e.target.value })}
                          placeholder="Optional override"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {newResource.category === "assignment" && (
                        <div className="space-y-2">
                          <Label>Link to Assignment *</Label>
                          <select
                            value={newResource.assignmentId ?? ""}
                            onChange={(e) =>
                              setNewResource({
                                ...newResource,
                                assignmentId: e.target.value ? Number(e.target.value) : null
                              })
                            }
                            className="w-full px-3 py-2 border rounded-md bg-white"
                          >
                            <option value="">Select assignment</option>
                            {assignments.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title}
                              </option>
                            ))}
                          </select>
                          {selectedResourceAssignment && (
                            <p className="text-xs text-blue-700">
                              Auto-targeting {assignmentAutoStudentIds.length} assigned student{assignmentAutoStudentIds.length === 1 ? "" : "s"} from this assignment.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Attach File (optional)</Label>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.png,.ppt,.pptx,.xlsx,.mp4,.mov"
                          onChange={(e) => setNewResourceFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-500">Or provide a link below.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Link URL (optional)</Label>
                        <Input
                          placeholder="https://..."
                          value={newResource.linkUrl}
                          onChange={(e) => setNewResource({ ...newResource, linkUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    {!isAssignmentResourceCategory && (
                      <>
                        <div className="space-y-2">
                          <Label>Assign to Groups (Optional)</Label>
                          <div className="space-y-2 rounded-md border bg-gray-50 p-3">
                            {studentGroups.length === 0 ? (
                              <p className="text-sm text-gray-500">No groups available.</p>
                            ) : (
                              studentGroups.map((group) => (
                                <div key={group.id} className="rounded-md border bg-white p-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={resourceGroupIds.includes(group.id.toString())}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setResourceGroupIds((prev) => [...prev, group.id.toString()]);
                                          } else {
                                            setResourceGroupIds((prev) => prev.filter((id) => id !== group.id.toString()));
                                          }
                                        }}
                                      />
                                      <span>{group.name} ({group.members.length} students)</span>
                                    </label>
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

                        <div className="space-y-2">
                          <Label>Select Students {newResource.category === "personal" ? "*" : "(Optional)"}</Label>
                          <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border bg-gray-50 p-3">
                            {students.map((student) => {
                              const lockedByGroup = groupedResourceStudentIdSet.has(student.id);
                              const checked = lockedByGroup || newResource.studentIds.includes(student.id);
                              return (
                                <label key={student.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                                  <span>
                                    {student.name} <span className="text-gray-500">({student.email})</span>
                                  </span>
                                  <span className="flex items-center gap-2">
                                    {lockedByGroup && <span className="text-xs text-blue-700">via group</span>}
                                    <Checkbox
                                      checked={checked}
                                      disabled={lockedByGroup}
                                      onCheckedChange={(value) => {
                                        if (value) {
                                          setNewResource({
                                            ...newResource,
                                            studentIds: Array.from(new Set([...newResource.studentIds, student.id]))
                                          });
                                        } else {
                                          setNewResource({
                                            ...newResource,
                                            studentIds: newResource.studentIds.filter((id) => id !== student.id)
                                          });
                                        }
                                      }}
                                    />
                                  </span>
                                </label>
                              );
                            })}
                            {students.length === 0 && (
                              <p className="text-sm text-gray-500">No students found.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-end gap-3">
                      {resourceSaveFeedback && (
                        <span
                          className={
                            resourceSaveFeedback.type === "saving"
                              ? "mr-auto rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-sm text-blue-800"
                              : resourceSaveFeedback.type === "success"
                                ? "mr-auto rounded-md border border-green-200 bg-green-50 px-2 py-1 text-sm text-green-800"
                                : "mr-auto rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-800"
                          }
                        >
                          {resourceSaveFeedback.message}
                        </span>
                      )}
                      {resourceError && (
                        <span className="text-sm text-red-600 mr-auto">{resourceError}</span>
                      )}
                      <Button
                        onClick={handleSendResource}
                        disabled={isResourceSubmitDisabled}
                      >
                        {sendingResource ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Resource
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg text-slate-900">Shared Resources</CardTitle>
                        <CardDescription>Edit or delete previously shared resources.</CardDescription>
                      </div>
                      <Button onClick={fetchResources} variant="outline" size="sm" disabled={resourcesLoading}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", resourcesLoading && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resourceListError && (
                      <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                        {resourceListError}
                      </div>
                    )}
                    {resourcesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <ShimmerSkeleton key={`resource-loading-${index}`} className="h-16 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : resources.length === 0 ? (
                      <p className="text-sm text-slate-600">No resources shared yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {resources.map((resource) => {
                          const isBusy = resourceActionLoadingIds.has(resource.id);
                          const resourceCategory = inferResourceCategory(resource);
                          return (
                            <div key={resource.id} className="rounded-lg border border-slate-200 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">{resource.title}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                    <Badge variant="outline">{resource.type}</Badge>
                                    <Badge variant="secondary">{resourceCategory}</Badge>
                                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                    {resource.assignmentLinks.length > 0 && (
                                      <span>
                                        Assignment: {resource.assignmentLinks.map((item) => item.assignment.title).join(", ")}
                                      </span>
                                    )}
                                    {resource.studentAssignments.length > 0 && (
                                      <span>Students: {resource.studentAssignments.length}</span>
                                    )}
                                  </div>
                                  {resource.description && (
                                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{resource.description}</p>
                                  )}
                                  {(resource.fileName || resource.linkUrl) && (
                                    <p className="mt-1 truncate text-xs text-slate-500">
                                      {resource.fileName || resource.linkUrl}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditResourceDialog(resource)}
                                    disabled={isBusy}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteResource(resource.id)}
                                    disabled={isBusy}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    {isBusy ? "Deleting..." : "Delete"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Dialog
                  open={isEditResourceDialogOpen}
                  onOpenChange={(open) => {
                    setIsEditResourceDialogOpen(open);
                    if (!open) {
                      setEditingResourceId(null);
                      setEditResource(createEmptyResourceForm(teacher?.programs?.[0] || ""));
                      setEditResourceFile(null);
                      setEditResourceGroupIds([]);
                      setEditResourceError(null);
                      setEditResourceSaveFeedback(null);
                    }
                  }}
                >
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={editResource.title}
                            onChange={(e) => setEditResource({ ...editResource, title: e.target.value })}
                            placeholder="Resource title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <select
                            value={editResource.category}
                            onChange={(e) => {
                              const nextCategory = e.target.value as ResourceCategory;
                              setEditResource((prev) => ({
                                ...prev,
                                category: nextCategory,
                                assignmentId: nextCategory === "assignment" ? prev.assignmentId : null,
                                studentIds: nextCategory === "assignment" ? [] : prev.studentIds
                              }));
                              if (nextCategory === "assignment") {
                                setEditResourceGroupIds([]);
                              }
                            }}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                          >
                            <option value="assignment">Assignment</option>
                            <option value="personal">Personal</option>
                            <option value="general">General</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={editResource.description}
                            onChange={(e) => setEditResource({ ...editResource, description: e.target.value })}
                            placeholder="Short description (optional)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type *</Label>
                          <select
                            value={editResource.type}
                            onChange={(e) => setEditResource({ ...editResource, type: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                          >
                            <option value="document">Document</option>
                            <option value="video">Video</option>
                            <option value="image">Image</option>
                            <option value="link">Link</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Program</Label>
                          <Input
                            value={editResource.program}
                            onChange={(e) => setEditResource({ ...editResource, program: e.target.value })}
                            placeholder="Optional override"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input
                            value={editResource.subject}
                            onChange={(e) => setEditResource({ ...editResource, subject: e.target.value })}
                            placeholder="Optional override"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grade</Label>
                          <Input
                            value={editResource.grade}
                            onChange={(e) => setEditResource({ ...editResource, grade: e.target.value })}
                            placeholder="Optional override"
                          />
                        </div>
                      </div>

                      {editResource.category === "assignment" && (
                        <div className="space-y-2">
                          <Label>Link to Assignment *</Label>
                          <select
                            value={editResource.assignmentId ?? ""}
                            onChange={(e) => setEditResource({ ...editResource, assignmentId: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-2 border rounded-md bg-white"
                          >
                            <option value="">Select assignment</option>
                            {assignments.map((assignment) => (
                              <option key={assignment.id} value={assignment.id}>
                                {assignment.title}
                              </option>
                            ))}
                          </select>
                          {selectedEditResourceAssignment && (
                            <p className="text-xs text-blue-700">
                              Auto-targeting {editAssignmentAutoStudentIds.length} assigned student{editAssignmentAutoStudentIds.length === 1 ? "" : "s"} from this assignment.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Replace File (optional)</Label>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.png,.ppt,.pptx,.xlsx,.mp4,.mov"
                            onChange={(e) => setEditResourceFile(e.target.files?.[0] || null)}
                          />
                          {editResource.existingFileName && !editResourceFile && (
                            <p className="text-xs text-slate-500">Current file: {editResource.existingFileName}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Link URL (optional)</Label>
                          <Input
                            value={editResource.linkUrl}
                            onChange={(e) => setEditResource({ ...editResource, linkUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      {!isEditAssignmentResourceCategory && (
                        <>
                          <div className="space-y-2">
                            <Label>Assign to Groups (Optional)</Label>
                            <div className="space-y-2 rounded-md border bg-gray-50 p-3">
                              {studentGroups.map((group) => (
                                <label key={group.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                                  <span>{group.name} ({group.members.length} students)</span>
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={editResourceGroupIds.includes(group.id.toString())}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditResourceGroupIds((prev) => [...prev, group.id.toString()]);
                                      } else {
                                        setEditResourceGroupIds((prev) => prev.filter((id) => id !== group.id.toString()));
                                      }
                                    }}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Select Students {editResource.category === "personal" ? "*" : "(Optional)"}</Label>
                            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border bg-gray-50 p-3">
                              {students.map((student) => {
                                const lockedByGroup = groupedEditResourceStudentIdSet.has(student.id);
                                const checked = lockedByGroup || editResource.studentIds.includes(student.id);
                                return (
                                  <label key={student.id} className="flex items-center justify-between rounded-md border bg-white p-2 text-sm">
                                    <span>
                                      {student.name} <span className="text-gray-500">({student.email})</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                      {lockedByGroup && <span className="text-xs text-blue-700">via group</span>}
                                      <Checkbox
                                        checked={checked}
                                        disabled={lockedByGroup}
                                        onCheckedChange={(value) => {
                                          if (value) {
                                            setEditResource({
                                              ...editResource,
                                              studentIds: Array.from(new Set([...editResource.studentIds, student.id]))
                                            });
                                          } else {
                                            setEditResource({
                                              ...editResource,
                                              studentIds: editResource.studentIds.filter((id) => id !== student.id)
                                            });
                                          }
                                        }}
                                      />
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <DialogFooter className="mt-4">
                      {editResourceSaveFeedback && (
                        <span
                          className={
                            editResourceSaveFeedback.type === "saving"
                              ? "mr-auto rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-sm text-blue-800"
                              : editResourceSaveFeedback.type === "success"
                                ? "mr-auto rounded-md border border-green-200 bg-green-50 px-2 py-1 text-sm text-green-800"
                                : "mr-auto rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-800"
                          }
                        >
                          {editResourceSaveFeedback.message}
                        </span>
                      )}
                      {editResourceError && (
                        <span className="mr-auto text-sm text-red-600">{editResourceError}</span>
                      )}
                      <Button variant="outline" onClick={() => setIsEditResourceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateResource} disabled={isEditResourceSubmitDisabled}>
                        {savingEditedResource ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Resource"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Student Resource Submissions</h3>
                    <p className="text-slate-600">Review and provide feedback on work submitted by students.</p>
                  </div>
                  <Button onClick={fetchStudentSubmissions} variant="outline" disabled={submissionsLoading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", submissionsLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>

                {submissionsError && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-red-700">{submissionsError}</p>
                        <Button variant="outline" size="sm" onClick={fetchStudentSubmissions}>
                          Retry
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {submissionsLoading ? (
                  <div className="grid gap-6 py-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={`teacher-submissions-loading-${index}`}>
                        <CardHeader className="space-y-3">
                          <ShimmerSkeleton className="h-5 w-1/2" />
                          <ShimmerSkeleton className="h-4 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <ShimmerSkeleton className="h-4 w-full" />
                          <ShimmerSkeleton className="h-4 w-5/6" />
                          <ShimmerSkeleton className="h-24 w-full rounded-lg" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : studentSubmissions.length === 0 ? (
                  <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Submissions</h3>
                      <p className="text-gray-600">
                      Students haven&apos;t submitted any resources for review yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {studentSubmissions.map((submission) => (
                      <Card key={submission.id} className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{submission.title}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {submission.student.name} ({submission.student.grade})
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(submission.submittedAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {submission.allTeachers.length} teacher{submission.allTeachers.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {submission.description && (
                                <p className="text-gray-600 mt-2">{submission.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={submission.hasMyRemark ? 'default' : 'secondary'}>
                                {submission.hasMyRemark ? 'Reviewed' : 'Needs Review'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Content Preview */}
                          {submission.content && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-2">Content:</p>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-4">
                                {submission.content}
                              </p>
                            </div>
                          )}

                          {/* File Attachment */}
                          {submission.fileUrl && submission.fileName && (
                            <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
                              <FileText className="h-6 w-6 text-slate-700" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{submission.fileName}</p>
                                {submission.fileSize && (
                                  <p className="text-xs text-slate-600">
                                    {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(submission.fileUrl, '_blank')}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = submission.fileUrl;
                                    link.download = submission.fileName;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* All Teachers */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Sent to teachers:</p>
                            <div className="flex flex-wrap gap-2">
                              {submission.allTeachers.map((teacher: any) => (
                                <Badge
                                  key={teacher.id}
                                  variant="outline"
                                  className={teacher.email === teacherEmail ? 'bg-slate-100 border-slate-300' : ''}
                                >
                                  {teacher.name} {teacher.email === teacherEmail && '(You)'}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Existing Remarks */}
                          {submission.teacherRemarks.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Your previous feedback:</p>
                              {submission.teacherRemarks.map((remark: any) => (
                                <div key={remark.id} className="bg-slate-100 p-3 rounded-lg border-l-4 border-slate-300">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-medium text-slate-900">Your Feedback</p>
                                    <p className="text-xs text-slate-600">
                                      {new Date(remark.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <p className="text-sm text-slate-700">{remark.remark}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add/Update Remark */}
                          <div className="pt-4 border-t">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={submission.hasMyRemark ? "outline" : "default"}
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setRemarkText(submission.teacherRemarks[0]?.remark || "");
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  {submission.hasMyRemark ? 'Update Feedback' : 'Add Feedback'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    {submission.hasMyRemark ? 'Update' : 'Add'} Feedback for &quot;{submission.title}&quot;
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="remark">Your Feedback</Label>
                                    <Textarea
                                      id="remark"
                                      placeholder="Provide constructive feedback for the student..."
                                      value={remarkText}
                                      onChange={(e) => setRemarkText(e.target.value)}
                                      rows={6}
                                    />
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    onClick={() => handleAddRemark(submission.id)}
                                    disabled={isAddingRemark || !remarkText.trim()}
                                  >
                                    {isAddingRemark ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {submission.hasMyRemark ? 'Update' : 'Send'} Feedback
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">Teaching Schedule</CardTitle>
                    <CardDescription>Manage upcoming sessions and time slots.</CardDescription>
                  </CardHeader>
                  <CardContent>
                  {(() => {
                    const StudentScheduler = require("../../components/teacher/StudentScheduler").default;
                    return <StudentScheduler teacherEmail={teacherEmail} />;
                  })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Progress Reports Tab */}
            {activeTab === "progress" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="border border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">Progress Reports</CardTitle>
                    <CardDescription>Review student performance trends and publish updates.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressReportManager teacherEmail={teacherEmail} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>

      {/* Chat Dialog for Students */}
      {teacher && selectedChatStudent && (
        <CustomChatDialog
          open={isChatOpen && !!selectedChatStudent}
          onOpenChange={(open) => {
            setIsChatOpen(open);
            if (!open) {
              setSelectedChatStudent(null);
            }
          }}
          userRole="teacher"
          userId={teacher.id}
          userName={teacher.name}
          recipientId={selectedChatStudent.id}
          recipientName={selectedChatStudent.name}
          recipientRole="student"
        />
      )}

      {/* Chat Dialog for Parents */}
      {teacher && selectedChatParent && (
        <CustomChatDialog
          open={isChatOpen && !!selectedChatParent}
          onOpenChange={(open) => {
            setIsChatOpen(open);
            if (!open) {
              setSelectedChatParent(null);
            }
          }}
          userRole="teacher"
          userId={teacher.id}
          userName={teacher.name}
          recipientId={selectedChatParent.id}
          recipientName={selectedChatParent.name}
          recipientRole="parent"
        />
      )}

      {/* Progress Modal */}
      {selectedProgressStudent && (
        <StudentProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          studentId={selectedProgressStudent.id}
          studentName={selectedProgressStudent.name}
          studentEmail={selectedProgressStudent.email}
        />
      )}
    </SidebarProvider>
  );
}
