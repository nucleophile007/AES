import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ui/dashboard-loading-skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Book, 
  RefreshCw,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { getUserTimezone, formatTime } from "@/lib/timezone";

// Setup the localizer by providing the moment object
const localizer = momentLocalizer(moment);

const scheduleColorPalette = [
  {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    detail: 'bg-blue-100 text-blue-800',
    calendar: 'bg-blue-200 border-blue-400 text-blue-800',
  },
  {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    detail: 'bg-emerald-100 text-emerald-800',
    calendar: 'bg-emerald-200 border-emerald-400 text-emerald-800',
  },
  {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    detail: 'bg-amber-100 text-amber-800',
    calendar: 'bg-amber-200 border-amber-400 text-amber-800',
  },
  {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    detail: 'bg-rose-100 text-rose-800',
    calendar: 'bg-rose-200 border-rose-400 text-rose-800',
  },
  {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    detail: 'bg-indigo-100 text-indigo-800',
    calendar: 'bg-indigo-200 border-indigo-400 text-indigo-800',
  },
  {
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    detail: 'bg-slate-100 text-slate-800',
    calendar: 'bg-slate-200 border-slate-400 text-slate-800',
  },
];

const getSubjectColorSet = (subject: string) => {
  const normalized = subject.trim().toLowerCase() || "general";
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return scheduleColorPalette[Math.abs(hash) % scheduleColorPalette.length];
};

interface ClassEvent {
  id: number;
  title: string;
  description?: string | null;
  date?: Date | null;
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
  subject: string;
  location?: string | null;
  status?: string | null;
  color?: string | null;
  meetingLink?: string | null;
  teacherId: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface StudentScheduleViewProps {
  studentEmail: string;
}

const StudentScheduleView: React.FC<StudentScheduleViewProps> = ({ studentEmail }) => {
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassEvent[]>([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/schedule?studentEmail=${encodeURIComponent(studentEmail)}`);
      
      // Get response data first, so we can include error message if available
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }
      
      if (data.success && Array.isArray(data.schedules)) {
        // Get user's timezone for display
        const userTimezone = getUserTimezone();
        
        // Convert schedule data to match calendar event format
        const formattedEvents = data.schedules.map((schedule: any) => {
          // Get the date from the schedule
          const eventDate = schedule.date ? new Date(schedule.date) : new Date();
          const datePart = eventDate.toISOString().split('T')[0];
          
          // Use startDateTime/endDateTime (UTC) if available for proper timezone conversion
          // Otherwise fall back to legacy startTime/endTime string fields
          let startDateTime: Date;
          let endDateTime: Date;
          
          if (schedule.startDateTime && schedule.endDateTime) {
            // Use UTC DateTime fields - browser will automatically convert to local time
            startDateTime = new Date(schedule.startDateTime);
            endDateTime = new Date(schedule.endDateTime);
          } else {
            // Fall back to legacy time string parsing
            let startHours = 0, startMinutes = 0, endHours = 0, endMinutes = 0;
            
            if (typeof schedule.startTime === 'string') {
              if (schedule.startTime.includes('T')) {
                const startDate = new Date(schedule.startTime);
                startHours = startDate.getHours();
                startMinutes = startDate.getMinutes();
              } else {
                [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
              }
            }
            
            if (typeof schedule.endTime === 'string') {
              if (schedule.endTime.includes('T')) {
                const endDate = new Date(schedule.endTime);
                endHours = endDate.getHours();
                endMinutes = endDate.getMinutes();
              } else {
                [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
              }
            }
            
            // Create Date objects for the calendar view
            startDateTime = new Date(datePart);
            startDateTime.setHours(startHours, startMinutes);
            
            endDateTime = new Date(datePart);
            endDateTime.setHours(endHours, endMinutes);
          }
          
          // Format display time in user's timezone
          const displayStartTime = formatTime(startDateTime, userTimezone);
          const displayEndTime = formatTime(endDateTime, userTimezone);
          
          return {
            id: schedule.id,
            title: schedule.title,
            description: schedule.description || '',
            start: startDateTime,
            end: endDateTime,
            date: eventDate,
            startTime: displayStartTime,
            endTime: displayEndTime,
            teacherId: schedule.teacherId,
            subject: schedule.subject,
            location: schedule.location || '',
            meetingLink: schedule.meetingLink || '',
            status: schedule.status || 'scheduled',
            color: schedule.color || '',
            teacher: schedule.teacher,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
          };
        });
        
        setEvents(formattedEvents);
        
        // Set upcoming classes (next 3 classes)
        const now = new Date();
        const upcoming = formattedEvents
          .filter((event: ClassEvent) => event.start > now)
          .sort((a: ClassEvent, b: ClassEvent) => a.start.getTime() - b.start.getTime())
          .slice(0, 3);
        
        setUpcomingClasses(upcoming);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
      // Set empty arrays to prevent undefined errors
      setEvents([]);
      setUpcomingClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentEmail) {
      fetchEvents();
    }
  }, [studentEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventSelect = (event: ClassEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 my-2 sm:my-4 rounded-r-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <span className="h-5 w-5 leading-none">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Classes Card */}
        <Card className="lg:col-span-1 border border-slate-200 bg-white shadow-sm">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-900">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2">
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`student-upcoming-loading-${index}`} className="rounded-lg border p-3 space-y-2">
                      <ShimmerSkeleton className="h-4 w-2/3" />
                      <ShimmerSkeleton className="h-3 w-1/2" />
                      <ShimmerSkeleton className="h-3 w-2/5" />
                    </div>
                  ))}
                </div>
              ) : upcomingClasses.length > 0 ? (
                upcomingClasses.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 break-words flex-1 min-w-[120px]">{event.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs shrink-0", getSubjectColorSet(event.subject || "General").badge)}
                      >
                        {event.subject || "General"}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{moment(event.date).format('MMM D, YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs sm:text-sm">No upcoming classes scheduled</p>
                </div>
              )}
              
              <div className="flex justify-center pt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchEvents}
                  disabled={loading}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-slate-900">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
              My Class Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {loading ? (
              <div className="space-y-3 py-4">
                <ShimmerSkeleton className="h-6 w-40" />
                <ShimmerSkeleton className="h-[400px] sm:h-[500px] w-full rounded-lg" />
              </div>
            ) : (
              <div className="h-[420px] sm:h-[520px] w-full overflow-x-auto">
                <div className="min-w-[300px] h-full">
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleEventSelect}
                    eventPropGetter={(event: ClassEvent) => {
                      const colorClass = event.color || getSubjectColorSet(event.subject || "General").calendar;
                      
                      return {
                        className: `${colorClass} border-l-4 rounded px-1.5 sm:px-2 text-xs`
                      };
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg break-words">{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4 py-2">
              {/* Subject Badge */}
              <div className="flex justify-center">
                <Badge 
                  className={cn("text-xs", getSubjectColorSet(selectedEvent.subject || "General").detail)}
                >
                  {selectedEvent.subject || "General"}
                </Badge>
              </div>
              
              {/* Teacher Info */}
              <div className="grid grid-cols-[20px_1fr] items-center gap-2.5 text-xs sm:text-sm">
                <User className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Teacher:</span>{' '}
                  {selectedEvent.teacher?.name || 'N/A'}
                </p>
              </div>
              
              {/* Date/Time Info */}
              <div className="grid grid-cols-[20px_1fr] items-start gap-2.5 text-xs sm:text-sm">
                <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Date:</span>{' '}
                    {moment(selectedEvent.date).format('dddd, MMMM D, YYYY')}
                  </p>
                  <p className="mt-0.5">
                    <span className="font-semibold text-slate-900">Time:</span>{' '}
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>
              
              {/* Subject Info */}
              <div className="grid grid-cols-[20px_1fr] items-center gap-2.5 text-xs sm:text-sm">
                <Book className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Subject:</span>{' '}
                  {selectedEvent.subject || "General"}
                </p>
              </div>
              
              {/* Location Info */}
              {selectedEvent.location && (
                <div className="grid grid-cols-[20px_1fr] items-center gap-2.5 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Location:</span>{' '}
                    {selectedEvent.location}
                  </p>
                </div>
              )}
              
              {/* Meeting Link */}
              {selectedEvent.meetingLink && (
                <div className="grid grid-cols-[20px_1fr] items-start gap-2.5 text-xs sm:text-sm">
                  <ExternalLink className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">Meeting Link:</p>
                    <a 
                      href={selectedEvent.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-0.5 break-all text-xs sm:text-sm"
                    >
                      <span className="break-all">{selectedEvent.meetingLink}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Description */}
              {selectedEvent.description && (
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold text-slate-900">Description:</p>
                  <p className="whitespace-pre-wrap text-slate-700 mt-1 p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-md break-words">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              {/* Status */}
              {selectedEvent.status && (
                <div className="text-xs sm:text-sm flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Status:</span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {selectedEvent.status}
                  </Badge>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              {selectedEvent.meetingLink && (
                <Button 
                  variant="default"
                  onClick={() => {
                    if (selectedEvent.meetingLink) {
                      window.open(selectedEvent.meetingLink, '_blank');
                    }
                  }}
                  className="w-full sm:w-auto bg-brand-blue text-white hover:bg-brand-blue/90 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Join Meeting
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentScheduleView;
