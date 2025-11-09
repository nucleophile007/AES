import React, { useState, useEffect, useCallback } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, PlusIcon, Trash2Icon, InfoIcon, RefreshCw, User, Clock, ExternalLink } from "lucide-react";

// Setup the localizer by providing the moment object
const localizer = momentLocalizer(moment);

interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  program: string;
}

interface ClassEvent {
  id: number;
  title: string;
  description?: string | null;
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
  studentId: number;
  teacherId: number;
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

interface StudentSchedulerProps {
  teacherEmail: string;
  selectedStudentId?: number;
}

const StudentScheduler: React.FC<StudentSchedulerProps> = ({ 
  teacherEmail,
  selectedStudentId
}) => {
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  
  // Form state
  const [selectedStudent, setSelectedStudent] = useState<number | null>(selectedStudentId || null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define fetch functions before useEffect hooks
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
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

  const fetchEvents = useCallback(async (studentId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/schedule?teacherEmail=${encodeURIComponent(teacherEmail)}&studentId=${studentId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      
      const data = await response.json();
      
      if (data.success && data.schedules) {
        // Convert schedule data to match calendar event format
        const formattedEvents = data.schedules.map((schedule: any) => {
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
            subject: schedule.subject,
            location: schedule.location || '',
            meetingLink: schedule.meetingLink || '',
            status: schedule.status || 'scheduled',
            color: schedule.color || '',
            student: schedule.student,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
          };
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
  
  // Fetch events when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      fetchEvents(selectedStudent);
    } else {
      setEvents([]);
    }
  }, [selectedStudent, fetchEvents]);

  const handleAddEvent = async () => {
    if (!selectedStudent || !eventTitle || !eventSubject || !eventStartDate || !eventStartTime || !eventEndTime) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const startDateTime = new Date(`${eventStartDate}T${eventStartTime}`);
      const endDateTime = new Date(`${eventStartDate}T${eventEndTime}`);
      
      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
      
      // Create event data matching ClassSchedule database schema
      // Get just the date part, without time
      const dateOnly = new Date(eventStartDate);
      
      const eventData = {
        title: eventTitle,
        description: eventDescription,
        studentId: selectedStudent,
        subject: eventSubject,
        date: dateOnly.toISOString(), // Store just the date for easier querying
        startTime: eventStartTime, // Store just the time string (HH:MM)
        endTime: eventEndTime, // Store just the time string (HH:MM)
        location: eventLocation || null,
        meetingLink: eventMeetingLink || null,
        status: "scheduled",
        color: null // Will be auto-generated on the server based on subject
      };
      
      const response = await fetch('/api/teacher/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save event');
      }
      
      // Refresh events
      await fetchEvents(selectedStudent);
      
      // Reset form
      resetForm();
      setIsAddEventDialogOpen(false);
      
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/teacher/schedule?id=${selectedEvent.id}`, {
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
      
      // Refresh events
      if (selectedStudent) {
        await fetchEvents(selectedStudent);
      }
      
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
      
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEventSelect = (event: ClassEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
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
    setError(null);
  };

  const openAddEventDialog = () => {
    resetForm();
    
    // Set default values for today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const roundedHour = Math.ceil(today.getHours() / 1) * 1;
    const defaultStartTime = `${roundedHour.toString().padStart(2, '0')}:00`;
    const defaultEndTime = `${(roundedHour + 1).toString().padStart(2, '0')}:00`;
    
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

  if (loading && !events.length && !students.length) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4">Loading scheduler...</p>
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
            disabled={!selectedStudent}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add Class
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              if (selectedStudent) fetchEvents(selectedStudent);
              else fetchStudents();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <InfoIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
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
        </div>
      )}

      {selectedStudent ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleEventSelect}
            eventPropGetter={(event: ClassEvent) => {
              // Generate consistent colors based on subject
              const subjectToColor = (subject: string) => {
                const colors = [
                  'bg-blue-200 border-blue-400 text-blue-800',
                  'bg-green-200 border-green-400 text-green-800',
                  'bg-purple-200 border-purple-400 text-purple-800',
                  'bg-red-200 border-red-400 text-red-800',
                  'bg-yellow-200 border-yellow-400 text-yellow-800',
                  'bg-pink-200 border-pink-400 text-pink-800'
                ];
                
                // Simple hash function to consistently map subject to color
                let hash = 0;
                for (let i = 0; i < subject.length; i++) {
                  hash = ((hash << 5) - hash) + subject.charCodeAt(i);
                  hash |= 0; // Convert to 32bit integer
                }
                
                return colors[Math.abs(hash) % colors.length];
              };
              
              const colorClass = subjectToColor(event.subject);
              
              return {
                className: `${colorClass} border-l-4 rounded px-2`
              };
            }}
          />
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
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
                onChange={(e) => setEventStartDate(e.target.value)}
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
                  onChange={(e) => setEventStartTime(e.target.value)}
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
                  onChange={(e) => setEventEndTime(e.target.value)}
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Class'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                  <span className="font-medium">Student:</span>{' '}
                  {selectedEvent.student.name}
                </p>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
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
              </div>
              
              <div>
                <p className="font-medium">Subject:</p>
                <p>{selectedEvent.subject}</p>
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
                  <a 
                    href={selectedEvent.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>{selectedEvent.meetingLink}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <p className="font-medium">Description:</p>
                  <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
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
              <Button 
                variant="destructive" 
                onClick={handleDeleteEvent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
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
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentScheduler;
