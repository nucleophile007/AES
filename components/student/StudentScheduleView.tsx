import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Setup the localizer by providing the moment object
const localizer = momentLocalizer(moment);

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

  useEffect(() => {
    fetchEvents();
  }, [studentEmail]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/schedule?studentEmail=${encodeURIComponent(studentEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          // Use the same auth header pattern as other components
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token')}`
        }
      });
      
      // Get response data first, so we can include error message if available
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schedule');
      }
      
      if (data.success && Array.isArray(data.schedules)) {
        // Convert schedule data to match calendar event format
        const formattedEvents = data.schedules.map((schedule: any) => {
          // Get the date from the schedule
          const eventDate = schedule.date ? new Date(schedule.date) : new Date();
          const datePart = eventDate.toISOString().split('T')[0];
          
          // Parse time strings and create Date objects for calendar
          // Handle different time formats (both "HH:MM" string and ISO datetime string)
          let startHours = 0, startMinutes = 0, endHours = 0, endMinutes = 0;
          
          if (typeof schedule.startTime === 'string') {
            if (schedule.startTime.includes('T')) {
              // It's an ISO date string
              const startDate = new Date(schedule.startTime);
              startHours = startDate.getHours();
              startMinutes = startDate.getMinutes();
            } else {
              // It's a time string like "14:30"
              [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
            }
          }
          
          if (typeof schedule.endTime === 'string') {
            if (schedule.endTime.includes('T')) {
              // It's an ISO date string
              const endDate = new Date(schedule.endTime);
              endHours = endDate.getHours();
              endMinutes = endDate.getMinutes();
            } else {
              // It's a time string like "15:30"
              [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
            }
          }
          
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

  const handleEventSelect = (event: ClassEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : upcomingClasses.length > 0 ? (
                upcomingClasses.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEventSelect(event)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${
                          event.subject === 'Mathematics' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          event.subject === 'Science' ? 'bg-green-50 text-green-700 border-green-200' :
                          event.subject === 'English' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {event.subject}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{moment(event.date).format('MMM D, YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No upcoming classes scheduled</p>
                </div>
              )}
              
              <div className="flex justify-center mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchEvents}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              My Class Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="h-[500px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
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
                    
                    const colorClass = event.color ? event.color : subjectToColor(event.subject);
                    
                    return {
                      className: `${colorClass} border-l-4 rounded px-2`
                    };
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Subject Badge */}
              <div className="flex justify-center">
                <Badge 
                  className={`${
                    selectedEvent.subject === 'Mathematics' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.subject === 'Science' ? 'bg-green-100 text-green-800' :
                    selectedEvent.subject === 'English' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedEvent.subject}
                </Badge>
              </div>
              
              {/* Teacher Info */}
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <p>
                  <span className="font-medium">Teacher:</span>{' '}
                  {selectedEvent.teacher?.name || 'N/A'}
                </p>
              </div>
              
              {/* Date/Time Info */}
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {moment(selectedEvent.date).format('dddd, MMMM D, YYYY')}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>
              
              {/* Subject Info */}
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Book className="h-5 w-5 text-blue-600" />
                <p>
                  <span className="font-medium">Subject:</span>{' '}
                  {selectedEvent.subject}
                </p>
              </div>
              
              {/* Location Info */}
              {selectedEvent.location && (
                <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {selectedEvent.location}
                  </p>
                </div>
              )}
              
              {/* Meeting Link */}
              {selectedEvent.meetingLink && (
                <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Meeting Link:</p>
                    <a 
                      href={selectedEvent.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      <span>{selectedEvent.meetingLink}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <p className="font-medium">Description:</p>
                  <p className="whitespace-pre-wrap text-gray-700 text-sm mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              {/* Status */}
              {selectedEvent.status && (
                <div>
                  <p className="font-medium">Status:</p>
                  <div className="capitalize text-sm">
                    <Badge variant="outline">
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {selectedEvent.meetingLink && (
                <Button 
                  variant="default"
                  onClick={() => {
                    if (selectedEvent.meetingLink) {
                      window.open(selectedEvent.meetingLink, '_blank');
                    }
                  }}
                  className="mr-auto"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
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

export default StudentScheduleView;