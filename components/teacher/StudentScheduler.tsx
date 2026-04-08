import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, PlusIcon, Trash2Icon, InfoIcon, RefreshCw, User, Clock, ExternalLink, Link2, Link2Off } from "lucide-react";
import { getUserTimezone } from "@/lib/timezone";

// Setup the localizer by providing the moment object
const localizer = momentLocalizer(moment);

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  program: string;
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

interface ClassEvent {
  id: number;
  title: string;
  description?: string | null;
  meetingMinutes?: string | null;
  date?: Date | null;
  start: Date;  // Required for calendar display (from startTime)
  end: Date;    // Required for calendar display (from endTime)
  startTime: string;
  endTime: string;
  subject: string;
  location?: string | null;
  status?: string | null;
  color?: string | null;
  meetingLink?: string | null;
  googleCalendarEventId?: string | null;
  studentId: number;
  teacherId: number;
  groupId?: number | null;  // Group ID if scheduled via a group
  group?: {
    id: number;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  student: {
    id: number;
    name: string;
    email: string;
    grade: string;
    program: string;
  };
}

type GoogleSyncEventData = {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  studentName?: string;
  subject?: string;
  googleCalendarEventId?: string | null;
};

type GoogleSyncResult = {
  ok: boolean;
  error?: string;
  needsReconnect?: boolean;
};

interface StudentSchedulerProps {
  teacherEmail: string;
  selectedStudentId?: number;
}

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

const toLocalDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toLocalTimeInput = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const clamped = Math.min(Math.max(totalMinutes, 0), 23 * 60 + 59);
  const nextHours = String(Math.floor(clamped / 60)).padStart(2, '0');
  const nextMinutes = String(clamped % 60).padStart(2, '0');
  return `${nextHours}:${nextMinutes}`;
};

const GOOGLE_SYNC_TIMEOUT_MS = 8000;
const DELETE_UNDO_WINDOW_MS = 3000;

// Color palette for students (used in "all" view mode)
const STUDENT_COLORS = [
  { bg: 'bg-blue-200', border: 'border-blue-500', text: 'text-blue-800', hex: '#93C5FD' },
  { bg: 'bg-green-200', border: 'border-green-500', text: 'text-green-800', hex: '#86EFAC' },
  { bg: 'bg-purple-200', border: 'border-purple-500', text: 'text-purple-800', hex: '#C4B5FD' },
  { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-800', hex: '#FED7AA' },
  { bg: 'bg-pink-200', border: 'border-pink-500', text: 'text-pink-800', hex: '#FBCFE8' },
  { bg: 'bg-teal-200', border: 'border-teal-500', text: 'text-teal-800', hex: '#99F6E4' },
  { bg: 'bg-yellow-200', border: 'border-yellow-500', text: 'text-yellow-800', hex: '#FEF08A' },
  { bg: 'bg-red-200', border: 'border-red-500', text: 'text-red-800', hex: '#FECACA' },
  { bg: 'bg-indigo-200', border: 'border-indigo-500', text: 'text-indigo-800', hex: '#A5B4FC' },
  { bg: 'bg-cyan-200', border: 'border-cyan-500', text: 'text-cyan-800', hex: '#A5F3FC' },
];

// Color palette for groups (distinct from student colors)
const GROUP_COLORS = [
  { bg: 'bg-emerald-300', border: 'border-emerald-700', text: 'text-emerald-950', hex: '#34D399' },
  { bg: 'bg-amber-300', border: 'border-amber-700', text: 'text-amber-950', hex: '#F59E0B' },
  { bg: 'bg-rose-300', border: 'border-rose-700', text: 'text-rose-950', hex: '#FB7185' },
  { bg: 'bg-lime-300', border: 'border-lime-700', text: 'text-lime-950', hex: '#84CC16' },
  { bg: 'bg-fuchsia-300', border: 'border-fuchsia-700', text: 'text-fuchsia-950', hex: '#E879F9' },
  { bg: 'bg-slate-300', border: 'border-slate-700', text: 'text-slate-950', hex: '#94A3B8' },
  { bg: 'bg-orange-300', border: 'border-orange-700', text: 'text-orange-950', hex: '#FB923C' },
  { bg: 'bg-teal-300', border: 'border-teal-700', text: 'text-teal-950', hex: '#2DD4BF' },
];

const StudentScheduler: React.FC<StudentSchedulerProps> = ({
  teacherEmail,
  selectedStudentId
}) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View mode: 'selected' shows only selected student, 'all' shows all students
  const [viewMode, setViewMode] = useState<'selected' | 'all'>('all');
  
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<number | null>(selectedStudentId || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState(""); // This is actually the event date
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventSubject, setEventSubject] = useState("");
  const [eventProgram, setEventProgram] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventMeetingLink, setEventMeetingLink] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentNow, setCurrentNow] = useState<Date>(new Date());
  
  // Google Calendar state
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false);
  const [isSyncingToGoogle, setIsSyncingToGoogle] = useState(false);
  const [googleSyncInFlightCount, setGoogleSyncInFlightCount] = useState(0);
  const [googleSyncFailureCount, setGoogleSyncFailureCount] = useState(0);
  const [deletePendingEventId, setDeletePendingEventId] = useState<number | null>(null);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventStartTime, setEditEventStartTime] = useState("");
  const [editEventEndTime, setEditEventEndTime] = useState("");
  const [editEventSubject, setEditEventSubject] = useState("");
  const [editEventDescription, setEditEventDescription] = useState("");
  const [editEventMeetingLink, setEditEventMeetingLink] = useState("");
  const [editEventMeetingMinutes, setEditEventMeetingMinutes] = useState("");
  const schedulerActionInFlightRef = useRef(false);
  const pendingDeleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeletedEventRef = useRef<ClassEvent | null>(null);

  const schedulerDraftStorageKey = `aes:teacher:schedule:draft:${teacherEmail}:${selectedStudent ?? "none"}`;
  const todayLocalDate = toLocalDateInput(currentNow);
  const minStartTimeForToday = toLocalTimeInput(new Date(currentNow.getTime() + 60 * 1000));
  const minStartTime = eventStartDate === todayLocalDate ? minStartTimeForToday : undefined;
  const isDeleteBusy = deletePendingEventId !== null || isDeleteInProgress;
  const isActionLocked = isSubmitting || isDeleteBusy;

  const groupNameById = useMemo(() => {
    const map = new Map<number, string>();
    studentGroups.forEach((group) => map.set(group.id, group.name));
    return map;
  }, [studentGroups]);
  
  // Get deterministic color for a student by ID
  const getStudentColor = useCallback((studentId: number) => {
    const paletteIndex = Math.abs(studentId) % STUDENT_COLORS.length;
    return STUDENT_COLORS[paletteIndex];
  }, []);

  // Get deterministic color for a group by ID
  const getGroupColor = useCallback((groupId: number) => {
    const paletteIndex = Math.abs(groupId) % GROUP_COLORS.length;
    return GROUP_COLORS[paletteIndex];
  }, []);

  // Define fetch functions before useEffect hooks
  const fetchStudents = useCallback(async () => {
    try {
      if (!teacherEmail) {
        setStudents([]);
        setSelectedStudent(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students');
      }

      if (data.students && Array.isArray(data.students)) {
        setStudents(data.students);

        // If selectedStudentId is provided, verify it exists in the fetched students
        if (selectedStudentId && data.students.some((s: Student) => s.id === selectedStudentId)) {
          setSelectedStudent(selectedStudentId);
        } else if (data.students.length > 0 && !selectedStudentId) {
          // If no student is selected and we have students, select the first one
          setSelectedStudent(data.students[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [teacherEmail, selectedStudentId]);

  const fetchStudentGroups = useCallback(async () => {
    try {
      if (!teacherEmail) {
        setStudentGroups([]);
        return;
      }
      const response = await fetch(`/api/teacher/student-groups?teacherEmail=${encodeURIComponent(teacherEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student groups');
      }

      if (data.groups && Array.isArray(data.groups)) {
        setStudentGroups(data.groups);
      }
    } catch (err: any) {
      console.error('Error fetching student groups:', err);
    }
  }, [teacherEmail]);

  // Google Calendar functions
  const checkGoogleCalendarStatus = useCallback(async () => {
    if (!teacherEmail) return;
    try {
      const response = await fetch(`/api/teacher/calendar/status?email=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      setGoogleCalendarConnected(data.connected || false);
      if (data.connected) {
        setGoogleSyncFailureCount(0);
      }
      if (data.needsReconnect) {
        toast({
          title: "Google Calendar needs reconnection",
          description: "Your Google Calendar connection has expired. Please reconnect.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error checking Google Calendar status:', err);
    }
  }, [teacherEmail, toast]);

  const connectGoogleCalendar = async () => {
    try {
      setGoogleCalendarLoading(true);
      const response = await fetch(`/api/auth/google-calendar?email=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Error connecting Google Calendar:', err);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      setGoogleCalendarLoading(true);
      const response = await fetch(`/api/teacher/calendar/status?email=${encodeURIComponent(teacherEmail)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setGoogleCalendarConnected(false);
        setGoogleSyncFailureCount(0);
        toast({
          title: "Disconnected",
          description: "Google Calendar has been disconnected.",
        });
      }
    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const syncEventToGoogleCalendar = async (
    action: 'create' | 'update' | 'delete',
    scheduleId: number,
    eventData?: GoogleSyncEventData
  ): Promise<GoogleSyncResult> => {
    if (!googleCalendarConnected) {
      return { ok: false, error: 'Google Calendar not connected' };
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    setGoogleSyncInFlightCount((count) => count + 1);

    try {
      const userTimezone = getUserTimezone();
      const requestPromise = fetch('/api/teacher/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail,
          action,
          scheduleId,
          eventData,
          timezone: userTimezone,
        }),
      });

      const timeoutPromise = new Promise<Response>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Google Calendar sync timed out'));
        }, GOOGLE_SYNC_TIMEOUT_MS);
      });

      const response = await Promise.race([requestPromise, timeoutPromise]);
      
      const data = await response.json();
      if (!response.ok) {
        if (data.needsReconnect) {
          setGoogleCalendarConnected(false);
          toast({
            title: "Google Calendar disconnected",
            description: "Please reconnect your Google Calendar.",
            variant: "destructive",
          });
        }
        console.error('Failed to sync with Google Calendar:', data.error);
        setGoogleSyncFailureCount((count) => count + 1);
        return {
          ok: false,
          error: data.error || 'Google Calendar sync failed',
          needsReconnect: Boolean(data.needsReconnect),
        };
      }
      return { ok: true };
    } catch (err) {
      console.error('Error syncing to Google Calendar:', err);
      const isTimeoutError = err instanceof Error && err.message === 'Google Calendar sync timed out';
      setGoogleSyncFailureCount((count) => count + 1);
      return {
        ok: false,
        error: isTimeoutError ? 'Google Calendar sync timed out' : 'Google Calendar sync failed',
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setGoogleSyncInFlightCount((count) => Math.max(0, count - 1));
    }
  };

  const bulkSyncToGoogleCalendar = async () => {
    if (!googleCalendarConnected) return;
    
    try {
      setIsSyncingToGoogle(true);
      const userTimezone = getUserTimezone();
      const response = await fetch('/api/teacher/calendar/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, timezone: userTimezone }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setGoogleSyncFailureCount(0);
        toast({
          title: "Sync complete",
          description: `Synced ${data.synced} events to Google Calendar.${data.failed > 0 ? ` ${data.failed} failed.` : ''}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error bulk syncing:', err);
      toast({
        title: "Sync failed",
        description: "Failed to sync events to Google Calendar.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingToGoogle(false);
    }
  };

  const fetchEvents = useCallback(async (studentId?: number | null) => {
    try {
      if (!teacherEmail) {
        setEvents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      
      // Build URL - if studentId is provided, filter by it; otherwise fetch all
      let url = `/api/teacher/schedule?teacherEmail=${encodeURIComponent(teacherEmail)}`;
      if (studentId) {
        url += `&studentId=${studentId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }

      if (data.success && data.schedules) {
        // Convert schedule data to match calendar event format
        const mappedEvents = data.schedules.map((schedule: any) => {
          // Get the date from the schedule
          const eventDate = schedule.date ? new Date(schedule.date) : new Date();
          const datePart = eventDate.toISOString().split('T')[0];

          // Parse time strings and create Date objects for calendar
          const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
          const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

          // Create Date objects for the calendar view
          const startDateTime = new Date(datePart);
          startDateTime.setHours(startHours, startMinutes);

          const endDateTime = new Date(datePart);
          endDateTime.setHours(endHours, endMinutes);

          return {
            id: schedule.id,
            title: schedule.title,
            description: schedule.description || '',
            start: startDateTime,
            end: endDateTime,
            date: eventDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            studentId: schedule.studentId,
            teacherId: schedule.teacherId,
            groupId: schedule.groupId ?? null,
            group: schedule.group ? { id: schedule.group.id, name: schedule.group.name } : null,
            subject: schedule.subject,
            location: schedule.location || '',
            meetingLink: schedule.meetingLink || '',
            googleCalendarEventId: schedule.googleCalendarEventId || null,
            meetingMinutes: schedule.meetingMinutes || '',
            status: schedule.status || 'scheduled',
            color: schedule.color || '',
            student: schedule.student,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
          };
        });

        // Collapse legacy duplicated group rows (same group + same slot + same title)
        const seenGroupSignatures = new Set<string>();
        const formattedEvents = mappedEvents.filter((event: ClassEvent) => {
          if (!event.groupId) return true;
          const signature = [
            event.groupId,
            event.title,
            moment(event.start).format('YYYY-MM-DD'),
            event.startTime,
            event.endTime,
          ].join('|');

          if (seenGroupSignatures.has(signature)) {
            return false;
          }

          seenGroupSignatures.add(signature);
          return true;
        });

        setEvents(formattedEvents);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [teacherEmail]);

  // Fetch students assigned to this teacher
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudentGroups();
  }, [fetchStudentGroups]);

  // Check Google Calendar connection status
  useEffect(() => {
    checkGoogleCalendarStatus();
    
    // Check URL params for Google Calendar connection result
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const calendarConnected = urlParams.get('calendar_connected');
      const calendarError = urlParams.get('calendar_error');
      
      if (calendarConnected === 'true') {
        setGoogleCalendarConnected(true);
        setGoogleSyncFailureCount(0);
        toast({
          title: "Google Calendar Connected",
          description: "Your schedule will now sync to Google Calendar.",
        });
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (calendarError) {
        const errorMessages: Record<string, string> = {
          access_denied: "You denied access to Google Calendar.",
          missing_params: "Missing authorization parameters.",
          invalid_state: "Invalid authorization state.",
          token_exchange_failed: "Failed to authenticate with Google.",
          server_error: "Server error occurred.",
        };
        toast({
          title: "Connection Failed",
          description: errorMessages[calendarError] || "Failed to connect Google Calendar.",
          variant: "destructive",
        });
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [checkGoogleCalendarStatus, toast]);

  // Fetch events when selectedStudent or viewMode changes
  useEffect(() => {
    if (viewMode === 'all') {
      // Fetch all events for all students
      fetchEvents(null);
    } else if (selectedStudent) {
      // Fetch events for selected student only
      fetchEvents(selectedStudent);
    } else {
      setEvents([]);
    }
  }, [selectedStudent, viewMode, fetchEvents]);

  const handleAddEvent = async () => {
    if (schedulerActionInFlightRef.current || isSubmitting || isDeleteBusy) {
      if (isDeleteBusy) {
        toast({
          title: "Please wait",
          description: "A class deletion is still in progress.",
        });
      }
      return;
    }
    if (!eventTitle || !eventSubject || !eventStartDate || !eventStartTime || !eventEndTime) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedGroup = selectedGroupId
      ? studentGroups.find((group) => group.id.toString() === selectedGroupId)
      : null;
    const targetStudentId = selectedGroup
      ? selectedGroup.members[0]?.id
      : selectedStudent || null;

    if (!targetStudentId) {
      setError('Please select a student or group');
      return;
    }

    try {
      schedulerActionInFlightRef.current = true;
      setIsSubmitting(true);

      const startDateTime = new Date(`${eventStartDate}T${eventStartTime}`);
      const endDateTime = new Date(`${eventStartDate}T${eventEndTime}`);

      if (startDateTime <= new Date()) {
        setError('Start time must be in the future');
        setIsSubmitting(false);
        schedulerActionInFlightRef.current = false;
        return;
      }

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        setIsSubmitting(false);
        schedulerActionInFlightRef.current = false;
        return;
      }

      const eventData = {
        title: eventTitle,
        description: eventDescription,
        subject: eventSubject,
        date: eventStartDate,
        startTime: eventStartTime, // Store just the time string (HH:MM)
        endTime: eventEndTime, // Store just the time string (HH:MM)
        timezone: getUserTimezone(), // Client's timezone for UTC conversion
        location: eventLocation || null,
        meetingLink: eventMeetingLink || null,
        status: "scheduled",
        color: null, // Will be auto-generated on the server based on subject
        // Group ID for group-based scheduling
        groupId: selectedGroup ? selectedGroup.id : null,
        // Recurrence fields
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : null,
        recurrenceEndDate: isRecurring ? recurrenceEndDate : null
      };

      const response = await fetch('/api/teacher/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ ...eventData, studentId: targetStudentId })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save event');
      }

      // Sync to Google Calendar if connected
      if (googleCalendarConnected) {
        const student = students.find(s => s.id === targetStudentId);
        
        if (responseData.schedule?.id) {
          void syncEventToGoogleCalendar('create', responseData.schedule.id, {
            title: eventTitle,
            description: eventDescription,
            date: eventStartDate,
            startTime: eventStartTime,
            endTime: eventEndTime,
            location: eventLocation || undefined,
            meetingLink: eventMeetingLink || undefined,
            studentName: selectedGroup ? `${selectedGroup.name} (${selectedGroup.members.length} students)` : student?.name,
            subject: eventSubject,
          }).then((syncResult) => {
            if (syncResult.ok) return;
            toast({
              title: "Class saved",
              description: "Saved in AES, but Google Calendar sync needs attention.",
              variant: "destructive",
            });
          });
        }
      }

      if (responseData.invitationStatus) {
        const { attempted, sent, failed } = responseData.invitationStatus as {
          attempted: number;
          sent: number;
          failed: number;
        };

        if (attempted > 0 && failed > 0) {
          toast({
            title: "Class created with invite warning",
            description: `${sent}/${attempted} invitation emails sent successfully. ${failed} failed.`,
            variant: "destructive",
          });
        } else if (attempted > 0 && failed === 0) {
          toast({
            title: "Class created",
            description: `All ${sent} invitation email${sent === 1 ? '' : 's'} sent successfully.`,
          });
        }
      }

      if (!isRecurring && responseData.schedule?.id) {
        const optimisticDate = new Date(eventStartDate);
        const optimisticStart = new Date(`${eventStartDate}T${eventStartTime}`);
        const optimisticEnd = new Date(`${eventStartDate}T${eventEndTime}`);
        const fallbackStudent = students.find((s) => s.id === targetStudentId);

        const optimisticEvent: ClassEvent = {
          id: responseData.schedule.id,
          title: eventTitle,
          description: eventDescription || '',
          meetingMinutes: '',
          date: optimisticDate,
          start: optimisticStart,
          end: optimisticEnd,
          startTime: eventStartTime,
          endTime: eventEndTime,
          subject: eventSubject,
          location: eventLocation || '',
          status: "scheduled",
          color: responseData.schedule.color || null,
          meetingLink: eventMeetingLink || '',
          googleCalendarEventId: responseData.schedule.googleCalendarEventId || null,
          studentId: targetStudentId,
          teacherId: responseData.schedule.teacherId || 0,
          groupId: selectedGroup ? selectedGroup.id : null,
          group: selectedGroup ? { id: selectedGroup.id, name: selectedGroup.name } : null,
          createdAt: responseData.schedule.createdAt || new Date().toISOString(),
          updatedAt: responseData.schedule.updatedAt || new Date().toISOString(),
          student: fallbackStudent || {
            id: targetStudentId,
            name: selectedGroup?.members[0]?.name || 'Student',
            email: selectedGroup?.members[0]?.email || '',
            grade: selectedGroup?.members[0]?.grade || '',
            program: selectedGroup?.members[0]?.program || '',
          },
        };

        setEvents((prev) => {
          if (prev.some((event) => event.id === optimisticEvent.id)) return prev;
          return [...prev, optimisticEvent].sort((a, b) => a.start.getTime() - b.start.getTime());
        });
      }

      // Reset form
      clearSchedulerDraft();
      resetForm();
      setIsAddEventDialogOpen(false);
      setSelectedGroupId("");

      // Refresh in background to hydrate any recurring/group expansions from server.
      if (viewMode === 'all') {
        void fetchEvents(null);
      } else if (selectedStudent) {
        void fetchEvents(selectedStudent);
      }

    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
      schedulerActionInFlightRef.current = false;
    }
  };

  const handleDeleteEvent = async () => {
    if (schedulerActionInFlightRef.current || isSubmitting || isDeleteBusy) {
      if (isDeleteBusy) {
        toast({
          title: "Delete in progress",
          description: "Please wait for the current delete to finish.",
        });
      }
      return;
    }
    if (!selectedEvent) return;
    if (pendingDeleteTimeoutRef.current) return;
    const eventToDelete = selectedEvent;

    try {
      setDeletePendingEventId(eventToDelete.id);
      setEvents((prev) => prev.filter((event) => event.id !== eventToDelete.id));
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
      pendingDeletedEventRef.current = eventToDelete;

      const finalizeDelete = async () => {
        try {
          schedulerActionInFlightRef.current = true;
          setIsSubmitting(true);
          setIsDeleteInProgress(true);

          // Kick off Google deletion immediately, but don't block AES deletion UX on it.
          const googleDeletePromise = googleCalendarConnected
            ? syncEventToGoogleCalendar('delete', eventToDelete.id, {
                googleCalendarEventId: eventToDelete.googleCalendarEventId || null,
              })
            : Promise.resolve<GoogleSyncResult>({ ok: true });

          const response = await fetch(`/api/teacher/schedule?id=${eventToDelete.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete event');
          }

          // Refresh in background to keep UI snappy after optimistic removal.
          if (viewMode === 'all') {
            void fetchEvents(null);
          } else if (selectedStudent) {
            void fetchEvents(selectedStudent);
          }

          void googleDeletePromise.then((syncResult) => {
            if (syncResult.ok) return;
            toast({
              title: "Class deleted",
              description: "Deleted in AES, but Google Calendar sync needs attention.",
              variant: "destructive",
            });
          });
        } catch (err: any) {
          setEvents((prev) => {
            if (prev.some((event) => event.id === eventToDelete.id)) return prev;
            return [...prev, eventToDelete].sort((a, b) => a.start.getTime() - b.start.getTime());
          });
          setError(err.message || 'Failed to delete event');
        } finally {
          pendingDeleteTimeoutRef.current = null;
          pendingDeletedEventRef.current = null;
          schedulerActionInFlightRef.current = false;
          setIsSubmitting(false);
          setDeletePendingEventId(null);
          setIsDeleteInProgress(false);
        }
      };

      pendingDeleteTimeoutRef.current = setTimeout(finalizeDelete, DELETE_UNDO_WINDOW_MS);

      toast({
        title: "Class removed",
        description: `Undo within ${Math.floor(DELETE_UNDO_WINDOW_MS / 1000)} seconds to keep it.`,
        action: (
          <ToastAction
            altText="Undo delete"
            onClick={() => {
              const pendingTimeout = pendingDeleteTimeoutRef.current;
              const pendingEvent = pendingDeletedEventRef.current;
              if (!pendingTimeout || !pendingEvent) return;

              clearTimeout(pendingTimeout);
              pendingDeleteTimeoutRef.current = null;
              pendingDeletedEventRef.current = null;
              setDeletePendingEventId(null);
              setIsDeleteInProgress(false);

              setEvents((prev) => {
                if (prev.some((event) => event.id === pendingEvent.id)) return prev;
                return [...prev, pendingEvent].sort((a, b) => a.start.getTime() - b.start.getTime());
              });

              toast({
                title: "Delete cancelled",
                description: "Class restored.",
              });
            }}
          >
            Undo
          </ToastAction>
        ),
      });

    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
      setDeletePendingEventId(null);
      setIsDeleteInProgress(false);
    }
  };

  const handleEventSelect = (event: ClassEvent) => {
    if (isDeleteBusy) {
      toast({
        title: "Delete in progress",
        description: "Please wait until the current delete finishes.",
      });
      return;
    }
    setEditEventDate(event.date ? toLocalDateInput(new Date(event.date)) : toLocalDateInput(new Date(event.start)));
    setEditEventStartTime(event.startTime);
    setEditEventEndTime(event.endTime);
    setEditEventSubject(event.subject || '');
    setEditEventDescription(event.description || '');
    setEditEventMeetingLink(event.meetingLink || '');
    setEditEventMeetingMinutes(event.meetingMinutes || '');
    setIsEditingEvent(false);
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  const resetSelectedEventEditFields = () => {
    if (!selectedEvent) return;
    setEditEventDate(selectedEvent.date ? toLocalDateInput(new Date(selectedEvent.date)) : toLocalDateInput(new Date(selectedEvent.start)));
    setEditEventStartTime(selectedEvent.startTime);
    setEditEventEndTime(selectedEvent.endTime);
    setEditEventSubject(selectedEvent.subject || '');
    setEditEventDescription(selectedEvent.description || '');
    setEditEventMeetingLink(selectedEvent.meetingLink || '');
    setEditEventMeetingMinutes(selectedEvent.meetingMinutes || '');
  };

  const handleUpdateEvent = async () => {
    if (schedulerActionInFlightRef.current || isSubmitting || isDeleteBusy) {
      if (isDeleteBusy) {
        toast({
          title: "Please wait",
          description: "A class deletion is still in progress.",
        });
      }
      return;
    }
    if (!selectedEvent) return;

    const isPastEvent = selectedEvent.end.getTime() <= Date.now();

    if (!isPastEvent) {
      if (!editEventDate || !editEventStartTime || !editEventEndTime || !editEventSubject.trim()) {
        setError('Please fill in required fields: subject, date, start time and end time');
        return;
      }

      if (editEventEndTime <= editEventStartTime) {
        setError('End time must be after start time');
        return;
      }
    }

    try {
      schedulerActionInFlightRef.current = true;
      setIsSubmitting(true);

      const payload = isPastEvent
        ? {
            id: selectedEvent.id,
            studentId: selectedEvent.studentId,
            title: selectedEvent.title,
            subject: selectedEvent.subject,
            description: selectedEvent.description || null,
            meetingMinutes: editEventMeetingMinutes || null,
            date: selectedEvent.date ? toLocalDateInput(new Date(selectedEvent.date)) : toLocalDateInput(new Date(selectedEvent.start)),
            startTime: selectedEvent.startTime,
            endTime: selectedEvent.endTime,
            location: selectedEvent.location || null,
            meetingLink: selectedEvent.meetingLink || null,
            status: selectedEvent.status || 'scheduled',
            timezone: getUserTimezone(),
          }
        : {
            id: selectedEvent.id,
            studentId: selectedEvent.studentId,
            title: selectedEvent.title,
            subject: editEventSubject,
            description: editEventDescription || null,
            meetingMinutes: editEventMeetingMinutes || null,
            date: editEventDate,
            startTime: editEventStartTime,
            endTime: editEventEndTime,
            location: selectedEvent.location || null,
            meetingLink: editEventMeetingLink || null,
            status: selectedEvent.status || 'scheduled',
            timezone: getUserTimezone(),
          };

      const response = await fetch('/api/teacher/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update class');
      }

      if (googleCalendarConnected && !isPastEvent) {
        void syncEventToGoogleCalendar('update', selectedEvent.id, {
          title: selectedEvent.title,
          description: editEventDescription,
          date: editEventDate,
          startTime: editEventStartTime,
          endTime: editEventEndTime,
          location: selectedEvent.location || undefined,
          meetingLink: editEventMeetingLink || undefined,
          studentName: selectedEvent.groupId
            ? `${selectedEvent.group?.name || 'Group'}`
            : selectedEvent.student.name,
          subject: editEventSubject,
        }).then((syncResult) => {
          if (syncResult.ok) return;
          toast({
            title: "Class updated",
            description: "Saved in AES, but Google Calendar sync needs attention.",
            variant: "destructive",
          });
        });
      }

      const optimisticUpdatedAt = new Date().toISOString();
      setEvents((prev) => prev.map((event) => {
        if (event.id !== selectedEvent.id) return event;

        if (isPastEvent) {
          return {
            ...event,
            meetingMinutes: editEventMeetingMinutes || '',
            updatedAt: optimisticUpdatedAt,
          };
        }

        return {
          ...event,
          subject: editEventSubject,
          description: editEventDescription || '',
          meetingLink: editEventMeetingLink || '',
          date: new Date(editEventDate),
          start: new Date(`${editEventDate}T${editEventStartTime}`),
          end: new Date(`${editEventDate}T${editEventEndTime}`),
          startTime: editEventStartTime,
          endTime: editEventEndTime,
          updatedAt: optimisticUpdatedAt,
        };
      }));

      if (viewMode === 'all') {
        void fetchEvents(null);
      } else if (selectedStudent) {
        void fetchEvents(selectedStudent);
      }

      setIsEditingEvent(false);
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);

      toast({
        title: isPastEvent ? 'Meeting minutes updated' : 'Class updated',
        description: isPastEvent
          ? 'Custom minutes notification email sent to student(s).'
          : 'Students have been notified by email.',
      });
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message || 'Failed to update class');
    } finally {
      setIsSubmitting(false);
      schedulerActionInFlightRef.current = false;
    }
  };

  const calendarHeight = useMemo(() => {
    if (calendarView === 'week') return 860;
    if (calendarView === 'day') return 900;
    return 600;
  }, [calendarView]);

  const getSubjectColorHex = useCallback((subject: string) => {
    const colors = ['#93C5FD', '#86EFAC', '#C4B5FD', '#FECACA', '#FEF08A', '#FBCFE8'];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = ((hash << 5) - hash) + subject.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const getEventVisualStyle = useCallback((event: ClassEvent) => {
    const isGroupEvent = Boolean(event.groupId);

    if (viewMode === 'all') {
      if (isGroupEvent && event.groupId) {
        const groupColor = getGroupColor(event.groupId);
        return {
          backgroundColor: groupColor.hex,
          borderLeft: '4px solid #0f172a',
          border: '1px dashed #0f172a',
          color: '#0f172a',
          borderRadius: '0.375rem',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
        } as const;
      }

      const color = getStudentColor(event.studentId);
      return {
        backgroundColor: color.hex,
        borderLeft: '4px solid #0f172a',
        border: '1px solid #0f172a',
        color: '#0f172a',
        borderRadius: '0.375rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
      } as const;
    }

    const colorHex = getSubjectColorHex(event.subject);
    return {
      backgroundColor: colorHex,
      borderLeft: '4px solid #0f172a',
      border: isGroupEvent ? '1px dashed #0f172a' : '1px solid #0f172a',
      color: '#0f172a',
      borderRadius: '0.375rem',
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem',
    } as const;
  }, [viewMode, getGroupColor, getStudentColor, getSubjectColorHex]);

  const isSelectedEventPast = Boolean(selectedEvent && selectedEvent.end.getTime() <= Date.now());
  const canEditFullSelectedEvent = isEditingEvent && !isSelectedEventPast;

  const monthGridDates = useMemo(() => {
    const start = moment(calendarDate).startOf('month').startOf('week');
    const end = moment(calendarDate).endOf('month').endOf('week');
    const dates: Date[] = [];

    const cursor = start.clone();
    while (cursor.isSameOrBefore(end, 'day')) {
      dates.push(cursor.toDate());
      cursor.add(1, 'day');
    }

    return dates;
  }, [calendarDate]);

  const monthEventsByDate = useMemo(() => {
    const map = new Map<string, ClassEvent[]>();

    events.forEach((event) => {
      const key = moment(event.start).format('YYYY-MM-DD');
      const list = map.get(key) || [];
      list.push(event);
      map.set(key, list);
    });

    map.forEach((list) => list.sort((first, second) => first.start.getTime() - second.start.getTime()));
    return map;
  }, [events]);

  const calendarTitle = useMemo(() => {
    if (calendarView === 'month') return moment(calendarDate).format('MMMM YYYY');
    if (calendarView === 'week') {
      const start = moment(calendarDate).startOf('week');
      const end = moment(calendarDate).endOf('week');
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    }
    if (calendarView === 'day') return moment(calendarDate).format('dddd, MMM D, YYYY');
    return moment(calendarDate).format('MMMM YYYY');
  }, [calendarDate, calendarView]);

  const navigateCalendar = (action: 'today' | 'prev' | 'next') => {
    if (action === 'today') {
      setCalendarDate(new Date());
      return;
    }

    const base = moment(calendarDate);
    if (calendarView === 'month' || calendarView === 'agenda') {
      setCalendarDate(base.add(action === 'next' ? 1 : -1, 'month').toDate());
      return;
    }

    if (calendarView === 'week') {
      setCalendarDate(base.add(action === 'next' ? 1 : -1, 'week').toDate());
      return;
    }

    setCalendarDate(base.add(action === 'next' ? 1 : -1, 'day').toDate());
  };

  const resetForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventStartDate("");
    setEventStartTime("");
    setEventEndTime("");
    setEventSubject("");
    setEventProgram("");
    setEventLocation("");
    setEventMeetingLink("");
    setIsRecurring(false);
    setRecurrencePattern("");
    setRecurrenceEndDate("");
    setSelectedGroupId("");
    setError(null);
  };

  const clearSchedulerDraft = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(schedulerDraftStorageKey);
  };

  const restoreSchedulerDraft = () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(schedulerDraftStorageKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<{
        selectedGroupId: string;
        eventTitle: string;
        eventDescription: string;
        eventStartDate: string;
        eventStartTime: string;
        eventEndTime: string;
        eventSubject: string;
        eventProgram: string;
        eventLocation: string;
        eventMeetingLink: string;
        isRecurring: boolean;
        recurrencePattern: string;
        recurrenceEndDate: string;
      }>;

      setSelectedGroupId(parsed.selectedGroupId || "");
      setEventTitle(parsed.eventTitle || "");
      setEventDescription(parsed.eventDescription || "");
      setEventStartDate(parsed.eventStartDate || "");
      setEventStartTime(parsed.eventStartTime || "");
      setEventEndTime(parsed.eventEndTime || "");
      setEventSubject(parsed.eventSubject || "");
      setEventProgram(parsed.eventProgram || "");
      setEventLocation(parsed.eventLocation || "");
      setEventMeetingLink(parsed.eventMeetingLink || "");
      setIsRecurring(Boolean(parsed.isRecurring));
      setRecurrencePattern(parsed.recurrencePattern || "");
      setRecurrenceEndDate(parsed.recurrenceEndDate || "");
      return true;
    } catch {
      return false;
    }
  };

  const hasUnsavedAddEventDraft = Boolean(
    eventTitle.trim() ||
    eventDescription.trim() ||
    eventStartDate ||
    eventStartTime ||
    eventEndTime ||
    eventSubject.trim() ||
    eventProgram.trim() ||
    eventLocation.trim() ||
    eventMeetingLink.trim() ||
    isRecurring ||
    recurrencePattern ||
    recurrenceEndDate ||
    selectedGroupId
  );

  const handleAddDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedAddEventDraft && !isSubmitting) {
      setIsDiscardDialogOpen(true);
      return;
    }
    if (!nextOpen) {
      clearSchedulerDraft();
      resetForm();
    }
    setIsAddEventDialogOpen(nextOpen);
  };

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!(isAddEventDialogOpen && hasUnsavedAddEventDraft)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isAddEventDialogOpen, hasUnsavedAddEventDraft]);

  useEffect(() => {
    if (!(isAddEventDialogOpen && hasUnsavedAddEventDraft)) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        schedulerDraftStorageKey,
        JSON.stringify({
          selectedGroupId,
          eventTitle,
          eventDescription,
          eventStartDate,
          eventStartTime,
          eventEndTime,
          eventSubject,
          eventProgram,
          eventLocation,
          eventMeetingLink,
          isRecurring,
          recurrencePattern,
          recurrenceEndDate,
        })
      );
    } catch {
      // Ignore storage errors.
    }
  }, [
    isAddEventDialogOpen,
    hasUnsavedAddEventDraft,
    schedulerDraftStorageKey,
    selectedGroupId,
    eventTitle,
    eventDescription,
    eventStartDate,
    eventStartTime,
    eventEndTime,
    eventSubject,
    eventProgram,
    eventLocation,
    eventMeetingLink,
    isRecurring,
    recurrencePattern,
    recurrenceEndDate,
  ]);

  const discardAddEventChanges = () => {
    clearSchedulerDraft();
    resetForm();
    setIsAddEventDialogOpen(false);
    setIsDiscardDialogOpen(false);
  };

  useEffect(() => {
    return () => {
      if (pendingDeleteTimeoutRef.current) {
        clearTimeout(pendingDeleteTimeoutRef.current);
        pendingDeleteTimeoutRef.current = null;
      }
      pendingDeletedEventRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isAddEventDialogOpen) return;
    const timer = setInterval(() => setCurrentNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, [isAddEventDialogOpen]);

  useEffect(() => {
    if (!isAddEventDialogOpen) return;
    if (eventStartDate !== todayLocalDate) return;

    if (eventStartTime && minStartTime && eventStartTime < minStartTime) {
      const nextStart = minStartTime;
      setEventStartTime(nextStart);
      if (!eventEndTime || eventEndTime <= nextStart) {
        setEventEndTime(addMinutesToTime(nextStart, 60));
      }
      return;
    }

    if (eventEndTime && eventStartTime && eventEndTime <= eventStartTime) {
      setEventEndTime(addMinutesToTime(eventStartTime, 60));
    }
  }, [isAddEventDialogOpen, eventStartDate, eventStartTime, eventEndTime, minStartTime, todayLocalDate]);

  const openAddEventDialog = () => {
    resetForm();

    if (restoreSchedulerDraft()) {
      setIsAddEventDialogOpen(true);
      return;
    }

    // Set default values for today in local timezone
    const now = new Date();
    const formattedDate = toLocalDateInput(now);
    const defaultStartTime = toLocalTimeInput(new Date(now.getTime() + 60 * 1000));
    const defaultEndTime = addMinutesToTime(defaultStartTime, 60);

    setEventStartDate(formattedDate);
    setEventStartTime(defaultStartTime);
    setEventEndTime(defaultEndTime);

    // Use selected student if available
    if (selectedStudent) {
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        setEventProgram(student.program);
      }
    }

    setIsAddEventDialogOpen(true);
  };

  const handleEventDateChange = (nextDate: string) => {
    const safeDate = nextDate < todayLocalDate ? todayLocalDate : nextDate;
    setEventStartDate(safeDate);

    if (safeDate === todayLocalDate) {
      const nextMinStart = toLocalTimeInput(new Date(Date.now() + 60 * 1000));
      if (!eventStartTime || eventStartTime < nextMinStart) {
        setEventStartTime(nextMinStart);
      }
      if (!eventEndTime || eventEndTime <= (eventStartTime || nextMinStart)) {
        setEventEndTime(addMinutesToTime(eventStartTime || nextMinStart, 60));
      }
    }
  };

  const handleEventStartTimeChange = (nextStartTime: string) => {
    let safeStartTime = nextStartTime;
    if (eventStartDate === todayLocalDate && minStartTime && safeStartTime < minStartTime) {
      safeStartTime = minStartTime;
    }

    setEventStartTime(safeStartTime);

    if (!eventEndTime || eventEndTime <= safeStartTime) {
      setEventEndTime(addMinutesToTime(safeStartTime, 60));
    }
  };

  const handleEventEndTimeChange = (nextEndTime: string) => {
    if (eventStartTime && nextEndTime <= eventStartTime) {
      setEventEndTime(addMinutesToTime(eventStartTime, 60));
      return;
    }
    setEventEndTime(nextEndTime);
  };

  if (loading && !events.length && !students.length) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-7 w-64" />
            <ShimmerSkeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-9 w-52 rounded-lg" />
            <ShimmerSkeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <ShimmerSkeleton className="h-6 w-40" />
          <ShimmerSkeleton className="h-[520px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Class Schedule Management
          </h3>
          <p className="text-gray-600">Manage class schedules for your students</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Students
            </button>
            <button
              onClick={() => setViewMode('selected')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'selected' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Selected Only
            </button>
          </div>
          
          <Select
            value={selectedStudent?.toString() || ""}
            onValueChange={(value) => setSelectedStudent(parseInt(value))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} ({student.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={openAddEventDialog}
            disabled={isActionLocked || (!selectedStudent && studentGroups.length === 0)}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Class
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (viewMode === 'all') {
                fetchEvents(null);
              } else if (selectedStudent) {
                fetchEvents(selectedStudent);
              } else {
                fetchStudents();
              }
            }}
            disabled={loading || isActionLocked}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          {/* Google Calendar Integration */}
          {googleCalendarConnected ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={bulkSyncToGoogleCalendar}
                disabled={isSyncingToGoogle}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncingToGoogle ? "animate-spin" : ""}`} />
                Sync All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectGoogleCalendar}
                disabled={googleCalendarLoading}
                className="text-gray-500 hover:text-red-600"
                title="Disconnect Google Calendar"
              >
                <Link2Off className="h-4 w-4" />
              </Button>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {googleSyncInFlightCount > 0 ? `Syncing (${googleSyncInFlightCount})` : 'Google Calendar'}
                {googleSyncFailureCount > 0 ? ` • ${googleSyncFailureCount} issue${googleSyncFailureCount === 1 ? '' : 's'}` : ''}
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={connectGoogleCalendar}
              disabled={googleCalendarLoading}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Link2 className={`h-4 w-4 mr-2 ${googleCalendarLoading ? "animate-pulse" : ""}`} />
              Connect Google Calendar
            </Button>
          )}
        </div>
      </div>

      {isDeleteBusy && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Deleting class in background. Please wait a moment before opening or editing another class.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <InfoIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'all') {
                    fetchEvents(null);
                  } else if (selectedStudent) {
                    fetchEvents(selectedStudent);
                  } else {
                    fetchStudents();
                  }
                }}
              >
                Retry
              </Button>
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <span className="h-5 w-5">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Color Legend - shown in 'all' view mode */}
      {viewMode === 'all' && students.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Student Legend</h4>
          <div className="flex flex-wrap gap-3">
            {students.map((student) => {
              const color = getStudentColor(student.id);
              return (
                <div key={student.id} className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded ${color.bg} ${color.border} border-2`}
                  />
                  <span className="text-sm text-gray-600">{student.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group Color Legend - shown in 'all' view mode when groups exist */}
      {viewMode === 'all' && studentGroups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Group Legend</h4>
          <div className="flex flex-wrap gap-3">
            {studentGroups.map((group) => {
              const color = getGroupColor(group.id);
              return (
                <div key={group.id} className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded ${color.bg} ${color.border} border-2`}
                  />
                  <span className="text-sm text-gray-600">{group.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Schedule Type</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 border-2 border-slate-500" />
            <span className="text-sm text-gray-600">Individual schedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 border-2 border-dashed border-slate-700" />
            <span className="text-sm text-gray-600">Group schedule</span>
          </div>
        </div>
      </div>

      {(viewMode === 'all' || selectedStudent) ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b px-3 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('today')}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('prev')}>Back</Button>
              <Button variant="outline" size="sm" onClick={() => navigateCalendar('next')}>Next</Button>
            </div>
            <div className="text-base font-semibold text-slate-800">{calendarTitle}</div>
            <div className="flex items-center gap-1 border rounded-md p-1">
              {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarView(mode)}
                  className={`px-3 py-1 text-sm rounded ${calendarView === mode ? 'bg-slate-200 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {calendarView === 'month' ? (
            <div>
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-semibold text-slate-700 border-r last:border-r-0 border-slate-200">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 auto-rows-[140px]">
                {monthGridDates.map((dayDate) => {
                  const dayKey = moment(dayDate).format('YYYY-MM-DD');
                  const dayEvents = monthEventsByDate.get(dayKey) || [];
                  const total = dayEvents.length;
                  const isCurrentMonth = moment(dayDate).month() === moment(calendarDate).month();

                  return (
                    <div key={dayKey} className={`border-r border-b border-slate-200 p-1 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-slate-100/60 text-slate-500'}`}>
                      <div className="text-right text-sm font-medium">{moment(dayDate).format('DD')}</div>
                      <div className="mt-1 flex-1 flex flex-col gap-1">
                        {dayEvents.map((event) => {
                          const prefix = event.groupId ? '👥' : '👤';
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => handleEventSelect(event)}
                              className="w-full text-left text-xs font-medium truncate"
                              style={{
                                ...getEventVisualStyle(event),
                                flex: '1 1 0%',
                                minHeight: 0,
                              }}
                              title={`${event.title} (${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')})`}
                            >
                              {prefix} {event.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              views={['week', 'day', 'agenda']}
              view={calendarView as 'week' | 'day' | 'agenda'}
              toolbar={false}
              date={calendarDate}
              onNavigate={(nextDate: Date) => setCalendarDate(nextDate)}
              startAccessor="start"
              endAccessor="end"
              titleAccessor={(event: ClassEvent) => {
                const prefix = event.groupId ? '👥' : '👤';
                return `${prefix} ${event.title}`;
              }}
              style={{ height: calendarHeight }}
              step={60}
              timeslots={1}
              showMultiDayTimes
              dayLayoutAlgorithm="no-overlap"
              allDayMaxRows={8}
              popup={true}
              onSelectEvent={handleEventSelect}
              eventPropGetter={(event: ClassEvent) => ({ style: getEventVisualStyle(event) })}
            />
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Student Selected</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please select a student to view and manage their class schedule.
          </p>
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={handleAddDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-group" className="text-right">
                Assign to Group
              </Label>
              <Select
                value={selectedGroupId || "none"}
                onValueChange={(value) => setSelectedGroupId(value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group (use selected student)</SelectItem>
                  {studentGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name} ({group.members.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event-title" className="text-right">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Math Session"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-subject" className="text-right">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-subject"
                  value={eventSubject}
                  onChange={(e) => setEventSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="event-location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Room 101, Online"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-meeting-link" className="text-right">
                Meeting Link
              </Label>
              <Input
                id="event-meeting-link"
                value={eventMeetingLink}
                onChange={(e) => setEventMeetingLink(e.target.value)}
                placeholder="e.g. https://zoom.us/j/123456789"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="event-date" className="text-right">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="event-date"
                type="date"
                value={eventStartDate}
                onChange={(e) => handleEventDateChange(e.target.value)}
                min={todayLocalDate}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-start-time" className="text-right">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => handleEventStartTimeChange(e.target.value)}
                  min={minStartTime}
                  step={60}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="event-end-time" className="text-right">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => handleEventEndTimeChange(e.target.value)}
                  min={eventStartTime || minStartTime}
                  step={60}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add details about this class..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="event-recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <label
                htmlFor="event-recurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This is a recurring class
              </label>
            </div>

            {isRecurring && (
              <div>
                <Label htmlFor="recurrence-pattern" className="text-right">
                  Recurrence Pattern
                </Label>
                <Select
                  value={recurrencePattern}
                  onValueChange={setRecurrencePattern}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isRecurring && (
              <div>
                <Label htmlFor="recurrence-end-date" className="text-right">
                  Recurrence End Date
                </Label>
                <Input
                  id="recurrence-end-date"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="mt-1"
                  min={eventStartDate} // Cannot end before start date
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleAddDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEvent}
              disabled={isActionLocked}
            >
              {isActionLocked ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isDeleteBusy ? 'Please wait...' : 'Saving...'}
                </>
              ) : (
                'Add Class'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard schedule draft?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved schedule changes. Discarding will remove this draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardAddEventChanges}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View/Edit Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <p>
                  <span className="font-medium">{selectedEvent.groupId ? 'Group:' : 'Student:'}</span>{' '}
                  {selectedEvent.groupId
                    ? (selectedEvent.group?.name || groupNameById.get(selectedEvent.groupId) || `Group #${selectedEvent.groupId}`)
                    : selectedEvent.student.name}
                </p>
              </div>

              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <InfoIcon className="h-5 w-5 text-blue-600" />
                <p>
                  <span className="font-medium">Schedule Type:</span>{' '}
                  {selectedEvent.groupId ? 'Group' : 'Individual'}
                  {selectedEvent.groupId && (
                    <>
                      {' '}
                      ({selectedEvent.group?.name || groupNameById.get(selectedEvent.groupId) || `Group #${selectedEvent.groupId}`})
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {canEditFullSelectedEvent ? (
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <div>
                      <Label htmlFor="edit-event-date">Date</Label>
                      <Input
                        id="edit-event-date"
                        type="date"
                        value={editEventDate}
                        onChange={(e) => setEditEventDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="edit-event-start-time">Start Time</Label>
                        <Input
                          id="edit-event-start-time"
                          type="time"
                          value={editEventStartTime}
                          onChange={(e) => setEditEventStartTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-event-end-time">End Time</Label>
                        <Input
                          id="edit-event-end-time"
                          type="time"
                          value={editEventEndTime}
                          onChange={(e) => setEditEventEndTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>
                      <span className="font-medium">Start:</span>{' '}
                      {moment(selectedEvent.start).format('MMM D, YYYY h:mm A')}
                    </p>
                    <p>
                      <span className="font-medium">End:</span>{' '}
                      {moment(selectedEvent.end).format('MMM D, YYYY h:mm A')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium">Subject:</p>
                {canEditFullSelectedEvent ? (
                  <Input
                    value={editEventSubject}
                    onChange={(e) => setEditEventSubject(e.target.value)}
                    placeholder="Subject"
                    className="mt-1"
                  />
                ) : (
                  <p>{selectedEvent.subject}</p>
                )}
              </div>

              {selectedEvent.location && (
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.meetingLink && (
                <div>
                  <p className="font-medium">Meeting Link:</p>
                  {canEditFullSelectedEvent ? (
                    <Input
                      value={editEventMeetingLink}
                      onChange={(e) => setEditEventMeetingLink(e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>{selectedEvent.meetingLink}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {canEditFullSelectedEvent && !selectedEvent.meetingLink && (
                <div>
                  <p className="font-medium">Meeting Link:</p>
                  <Input
                    value={editEventMeetingLink}
                    onChange={(e) => setEditEventMeetingLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <p className="font-medium">Description:</p>
                  {canEditFullSelectedEvent ? (
                    <Textarea
                      value={editEventDescription}
                      onChange={(e) => setEditEventDescription(e.target.value)}
                      placeholder="Description"
                      className="mt-1"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
                  )}
                </div>
              )}

              {canEditFullSelectedEvent && !selectedEvent.description && (
                <div>
                  <p className="font-medium">Description:</p>
                  <Textarea
                    value={editEventDescription}
                    onChange={(e) => setEditEventDescription(e.target.value)}
                    placeholder="Description"
                    className="mt-1"
                  />
                </div>
              )}

              {isSelectedEventPast && (
                <div>
                  <p className="font-medium">Meeting Minutes:</p>
                  {isEditingEvent ? (
                    <Textarea
                      value={editEventMeetingMinutes}
                      onChange={(e) => setEditEventMeetingMinutes(e.target.value)}
                      placeholder="Add meeting minutes"
                      className="mt-1"
                    />
                  ) : (
                    selectedEvent.meetingMinutes?.trim() ? (
                      <p className="whitespace-pre-wrap">{selectedEvent.meetingMinutes}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No meeting minutes added yet.</p>
                    )
                  )}
                </div>
              )}

              {isEditingEvent && isSelectedEventPast && (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  This meeting is in the past. Only Minutes of Meeting can be updated.
                </div>
              )}

              {selectedEvent.status && (
                <div>
                  <p className="font-medium">Status:</p>
                  <p className="capitalize">{selectedEvent.status}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                <p>Created: {moment(selectedEvent.createdAt).format('MMM D, YYYY')}</p>
                {selectedEvent.updatedAt && selectedEvent.createdAt !== selectedEvent.updatedAt && (
                  <p>Last updated: {moment(selectedEvent.updatedAt).format('MMM D, YYYY')}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              {isEditingEvent ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetSelectedEventEditFields();
                      setIsEditingEvent(false);
                    }}
                    disabled={isActionLocked}
                  >
                    Cancel Edit
                  </Button>
                  <Button
                    onClick={handleUpdateEvent}
                    disabled={isActionLocked}
                  >
                    {isActionLocked ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isDeleteBusy ? 'Please wait...' : 'Saving...'}
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetSelectedEventEditFields();
                      setIsEditingEvent(true);
                    }}
                    disabled={isActionLocked}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteEvent}
                    disabled={isActionLocked}
                  >
                    {isActionLocked ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isDeleteBusy ? 'Delete pending...' : 'Deleting...'}
                      </>
                    ) : (
                      <>
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentScheduler;
