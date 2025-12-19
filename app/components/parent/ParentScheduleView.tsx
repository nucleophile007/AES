"use client";

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
  AlertCircle,
  Users
} from "lucide-react";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start: Date;
  end: Date;
  startTime: string;
  endTime: string;
  subject: string;
  location?: string | null;
  status?: string | null;
  color?: string | null;
  meetingLink?: string | null;
  teacherName?: string;
  studentName: string;
  type: 'session' | 'due';
}

interface ParentScheduleViewProps {
  parentEmail: string;
}

const ParentScheduleView: React.FC<ParentScheduleViewProps> = ({ parentEmail }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parent/calender`, { credentials: "include" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch schedule");
      }

      // FIX: use data.schedules instead of data.events
      if (Array.isArray(data.schedules)) {
        const formattedEvents = data.schedules.map((event: any) => {
          const eventDate = new Date(event.date);

          const [startH, startM] = event.startTime?.split(":").map(Number) || [0, 0];
          const [endH, endM] = event.endTime?.split(":").map(Number) || [0, 0];

          const start = new Date(eventDate);
          start.setHours(startH, startM, 0, 0);

          const end = new Date(eventDate);
          end.setHours(endH, endM, 0, 0);

          return {
            id: event.id,
            title: event.title,
            description: event.description,
            start,
            end,
            startTime: event.startTime,
            endTime: event.endTime,
            subject: event.subject,
            location: event.location,
            meetingLink: event.meetingLink,
            teacherName: event.teacher?.name || "N/A",
            studentName: event.student?.name || "Unknown",
            type: "session"
          };
        });

        setEvents(formattedEvents);

        // Upcoming events logic
        const now = new Date();
        const upcoming = formattedEvents
          .filter((e:any)=> e.start > now)
          .sort((a:any, b:any) => a.start.getTime() - b.start.getTime())
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      }
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to fetch events");
      setEvents([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [parentEmail]);

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const style = {
      borderLeft: `4px solid #3b82f6`,
      backgroundColor: `#DBEAFE`,
      borderRadius: "3px",
      opacity: 0.9,
      display: "block"
    } as React.CSSProperties;

    return { style };
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                No upcoming events found.
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer mb-3"
                  onClick={() => handleEventSelect(event)}
                >
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {moment(event.start).format("MMM D, YYYY")} — {event.startTime}
                  </p>
                  <p className="text-xs text-gray-500">Student: {event.studentName}</p>
                </div>
              ))
            )}

            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" /> Student&apos;s Schedule
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
                  onSelectEvent={handleEventSelect}
                  eventPropGetter={getEventStyle}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        {selectedEvent && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p><strong>Student:</strong> {selectedEvent.studentName}</p>
              <p><strong>Teacher:</strong> {selectedEvent.teacherName}</p>
              <p><strong>Date:</strong> {moment(selectedEvent.start).format("MMM D, YYYY")}</p>
              <p><strong>Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}</p>
              <p><strong>Subject:</strong> {selectedEvent.subject}</p>
            </div>

            <DialogFooter>
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

export default ParentScheduleView;
