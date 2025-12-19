"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "../../contexts/AuthContext";
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
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParentScheduleView from "../components/parent/ParentScheduleView";
import { cn } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  Wallet,
  MessageSquare,
  CalendarDays,
  Upload,
  Star,
  Send,
  RefreshCw,
  LogOut,
  CheckCircle,
  TrendingUp,
  Receipt,
  Clock,
  Award,
  BarChart3,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface StudentProgress {
  studentName: string;
  program: string;
  completionPercent: number;
  recentMilestones: { title: string; date: string }[];
}

type ParentChatRole = "mentor" | "admin";

interface ParentChatContact {
  id: string;
  name: string;
  role: ParentChatRole;
  subtitle: string;
  status: "online" | "away" | "offline";
}

interface ParentChatMessage {
  id: string;
  sender: "parent" | ParentChatRole;
  content: string;
  timestamp: string;
}

// Admin Meet Calendar Component
interface AdminMeetCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  dateTimeMapping: Record<string, string[]>;
}

function AdminMeetCalendar({ 
  selectedDate, 
  selectedTime, 
  onDateSelect, 
  onTimeSelect, 
  dateTimeMapping 
}: AdminMeetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<number | null> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const n = new Date(prev);
      n.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return n;
    });
  };

  const formatDate = (day: number) => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const isSelectedDate = (day: number) => selectedDate === formatDate(day);
  const isDateAvailable = (day: number) => Object.prototype.hasOwnProperty.call(dateTimeMapping, formatDate(day));
  const getAvailableTimesForDate = (date: string) => dateTimeMapping[date] || [];

  const days = getDaysInMonth(currentMonth);
  const availableTimesForSelectedDate = getAvailableTimesForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border-2 border-blue-100 shadow-lg p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="h-9 w-9 p-0 border-2 hover:border-brand-blue hover:bg-blue-50 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-blue" />
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="h-9 w-9 p-0 border-2 hover:border-brand-blue hover:bg-blue-50 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-brand-blue py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const available = isDateAvailable(day);
            const selected = isSelectedDate(day);

            return (
              <button
                key={day}
                onClick={() => available && onDateSelect(formatDate(day))}
                disabled={!available}
                className={cn(
                  "aspect-square rounded-xl text-sm font-semibold transition-all duration-200 relative",
                  available
                    ? "hover:scale-105 hover:shadow-md cursor-pointer transform"
                    : "text-gray-300 cursor-not-allowed bg-gray-50",
                  selected
                    ? "bg-gradient-to-br from-brand-blue to-blue-600 text-white shadow-lg scale-105 ring-4 ring-blue-200"
                    : available
                    ? "bg-white border-2 border-blue-200 text-gray-700 hover:border-brand-blue hover:bg-blue-50"
                    : ""
                )}
              >
                {day}
                {available && !selected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-teal rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-xl border-2 border-teal-100 shadow-lg p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 pb-3 border-b-2 border-teal-100">
            <Clock className="h-5 w-5 text-brand-teal" />
            Available Times for {selectedDate}
          </h4>
          {availableTimesForSelectedDate.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No times available for this date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTimesForSelectedDate.map((time: string) => (
                <button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2 transform hover:scale-105",
                    selectedTime === time
                      ? "bg-gradient-to-br from-brand-teal to-teal-600 text-white border-brand-teal shadow-lg ring-4 ring-teal-200"
                      : "bg-white border-teal-200 text-gray-700 hover:border-brand-teal hover:bg-teal-50 hover:shadow-md"
                  )}
                >
                  <Clock className="h-4 w-4 mx-auto mb-1" />
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ParentDashboard() {
  const { user: authUser, isLoading: authLoading } = useRequireAuth("parent");
  const { toast } = useToast();

  const parentEmail = authUser?.email || "";
  const [activeTab, setActiveTab] = useState("progress");

  // Overview / Progress
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  // Admin Meet
  const [profileAvailability, setProfileAvailability] = useState<Record<string, string[]>>({});
  const [profileSlotsLoading, setProfileSlotsLoading] = useState(false);
  const [profileStudents, setProfileStudents] = useState<any[]>([]);
  const [profileStudentsLoading, setProfileStudentsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [profileFormData, setProfileFormData] = useState({
    studentName: "",
    grade: "",
    schoolName: "",
    parentPhone: "",
    selectedDate: "",
    selectedTime: "",
  });
  const [bookingProfileSlot, setBookingProfileSlot] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  // Transaction Upload
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionReceipt, setTransactionReceipt] = useState<File | null>(null);
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  // Chat
  const [chatContacts, setChatContacts] = useState<ParentChatContact[]>([]);
  const [selectedChatContact, setSelectedChatContact] = useState<ParentChatContact | null>(null);
  const [chatMessages, setChatMessages] = useState<ParentChatMessage[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const getContactInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const getContactAccent = (role: ParentChatRole) =>
    role === "mentor"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  // Progress
const loadProgress = async () => {
  try {
    setProgressLoading(true);
    const response = await fetch('/api/parent/student-progress', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      setProgress(data.progress);
    } else {
      console.error('Failed to load progress:', data.error);
      setProgress([]);
    }
  } catch (error) {
    console.error('Error loading progress:', error);
    setProgress([]);
  } finally {
    setProgressLoading(false);
  }
};

  useEffect(() => {
    if (parentEmail) {
      loadProgress();
    }
  }, [parentEmail]);

  // Fetch students when Admin Meet tab becomes active
  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab !== "profile-building") return;
      
      try {
        setProfileStudentsLoading(true);
        const response = await fetch('/api/parent/students', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.students) {
          setProfileStudents(data.students);
          
          console.log('✅ Loaded students:', data.students.length);
          console.log('Student data:', data.students);
          
          // Auto-select first student if only one exists
          if (data.students.length === 1) {
            const student = data.students[0];
            console.log('Auto-filling with student:', student);
            console.log('Student grade:', student.grade, 'Type:', typeof student.grade);
            setSelectedStudentId(student.id.toString());
            setProfileFormData(prev => ({
              ...prev,
              studentName: student.name || "",
              grade: student.grade || "",
              schoolName: student.schoolName || "",
              parentPhone: student.parentPhone || "",
            }));
          }
          
        } else {
          console.error('Failed to load students:', data.error);
          setProfileStudents([]);
        }
      } catch (error) {
        console.error('Error loading students:', error);
        setProfileStudents([]);
      } finally {
        setProfileStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [activeTab]);

  // Fetch admin meet availability when tab is active
  useEffect(() => {
    const fetchProfileAvailability = async () => {
      if (activeTab !== "profile-building") return;
      
      try {
        setProfileSlotsLoading(true);
        const response = await fetch('/api/availability?program=Parent%20Meet', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          const availabilityMap: Record<string, string[]> = {};
          
          data.data.forEach((item: any) => {
            if (item.program === "Parent Meet" && item.date && Array.isArray(item.times)) {
              availabilityMap[item.date] = item.times;
            }
          });
          
          console.log('✅ Loaded Admin Meet availability:', {
            totalRows: data.totalRows,
            availableDates: Object.keys(availabilityMap).length,
          });
          
          setProfileAvailability(availabilityMap);
        } else {
          console.error('Failed to load admin meet availability:', data.error);
          setProfileAvailability({});
        }
      } catch (error) {
        console.error('Error loading admin meet availability:', error);
        setProfileAvailability({});
      } finally {
        setProfileSlotsLoading(false);
      }
    };

    fetchProfileAvailability();
  }, [activeTab]);

  // Handle student selection change
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = profileStudents.find(s => s.id.toString() === studentId);
    if (student) {
      console.log('Selected student:', student);
      console.log('Student grade:', student.grade, 'Type:', typeof student.grade);
      setProfileFormData(prev => ({
        ...prev,
        studentName: student.name || "",
        grade: student.grade || "",
        schoolName: student.schoolName || "",
        parentPhone: student.parentPhone || "",
      }));
    }
  };

  // Fetch chat contacts (mentors from database and admin)
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch("/api/parent/mentors", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch mentors");
        }
        
        const data = await response.json();
        
        if (data.success && data.mentors) {
          const mentorContacts: ParentChatContact[] = data.mentors.map((mentor: any) => ({
            id: mentor.id,
            name: mentor.name,
            role: "mentor" as ParentChatRole,
            subtitle: mentor.subtitle,
            status: "online" as "online" | "away" | "offline",
          }));
          
          const adminContact: ParentChatContact = {
            id: "admin-support",
            name: "AES Admin Team",
            role: "admin",
            subtitle: "Administration",
            status: "away",
          };
          
          const allContacts = [...mentorContacts, adminContact];
          setChatContacts(allContacts);
          
          if (!selectedChatContact && allContacts.length > 0) {
            setSelectedChatContact(allContacts[0]);
          }
        } else {
          const fallbackContacts: ParentChatContact[] = [
            {
              id: "admin-support",
              name: "AES Admin Team",
              role: "admin",
              subtitle: "Administration",
              status: "away",
            },
          ];
          setChatContacts(fallbackContacts);
          if (!selectedChatContact) {
            setSelectedChatContact(fallbackContacts[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
        const fallbackContacts: ParentChatContact[] = [
          {
            id: "admin-support",
            name: "AES Admin Team",
            role: "admin",
            subtitle: "Administration",
            status: "away",
          },
        ];
        setChatContacts(fallbackContacts);
        if (!selectedChatContact) {
          setSelectedChatContact(fallbackContacts[0]);
        }
      }
    };

    if (parentEmail) {
      fetchMentors();
    }
  }, [parentEmail, selectedChatContact]);

  // Load messages for selected contact
  useEffect(() => {
    if (!selectedChatContact || !authUser) return;

    const loadChat = async () => {
      setChatLoading(true);
      try {
        if (selectedChatContact.role === "admin") {
          setChatMessages([]);
          setChatLoading(false);
          return;
        }

        const teacherIdMatch = selectedChatContact.id.match(/mentor-(\d+)/);
        if (!teacherIdMatch) {
          console.error("Invalid mentor contact ID format");
          setChatMessages([]);
          return;
        }

        const teacherId = parseInt(teacherIdMatch[1]);
        const parentId = authUser.id;

        const response = await fetch(
          `/api/messages/parent?parentId=${parentId}&teacherId=${teacherId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();

        if (data.success && data.messages) {
          const formattedMessages: ParentChatMessage[] = data.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.senderRole === "teacher" ? "mentor" : "parent",
            content: msg.content,
            timestamp: msg.timestamp,
          }));

          setChatMessages(formattedMessages);
        } else {
          setChatMessages([]);
        }
      } catch (error) {
        console.error("Error loading chat messages:", error);
        setChatMessages([]);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [selectedChatContact, authUser]);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (authLoading || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const handleSendChatMessage = async () => {
    if (!selectedChatContact || !chatMessageInput.trim() || !authUser) return;

    if (selectedChatContact.role === "admin") {
      toast({
        title: "Coming soon",
        description: "Admin messaging will be available soon.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }

    const teacherIdMatch = selectedChatContact.id.match(/mentor-(\d+)/);
    if (!teacherIdMatch) {
      console.error("Invalid mentor contact ID format");
      toast({
        variant: "destructive",
        title: "Invalid mentor contact",
        description: "Please refresh the page and try again.",
      });
      return;
    }

    const teacherId = parseInt(teacherIdMatch[1]);
    const parentId = authUser.id;
    const messageContent = chatMessageInput.trim();

    const optimisticMessage: ParentChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "parent",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, optimisticMessage]);
    setChatMessageInput("");
    setChatSending(true);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          senderId: parentId,
          senderRole: "parent",
          recipientId: teacherId,
          recipientRole: "teacher",
          content: messageContent,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                id: data.messageId,
                sender: "parent",
                content: messageContent,
                timestamp: data.message.timestamp,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending chat message:", error);
      setChatMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setChatMessageInput(messageContent);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again.",
      });
    } finally {
      setChatSending(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!transactionAmount.trim() || !transactionDate || !transactionReceipt) {
      toast({
        title: "Missing information",
        description: "Please fill in Amount, Date, and upload the Transaction Receipt.",
        className: "border-yellow-500 bg-yellow-50 text-yellow-900",
      });
      return;
    }
    try {
      setSubmittingTransaction(true);
      
      const formData = new FormData();
      formData.append("file", transactionReceipt);
      
      const uploadRes = await fetch("/api/parent/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload receipt file");
      }
      
      const uploadData = await uploadRes.json();
      const receiptUrl = uploadData.url;
      
      const receiptData = {
        amount: transactionAmount,
        transactionDate: transactionDate,
        transactionId: transactionId || null,
        description: transactionDescription || null,
        receiptUrl: receiptUrl,
        receiptFileName: transactionReceipt.name,
        receiptFileSize: transactionReceipt.size,
      };
      
      const res = await fetch("/api/parent/transaction-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(receiptData),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTransactionAmount("");
        setTransactionDate("");
        setTransactionId("");
        setTransactionDescription("");
        setTransactionReceipt(null);
        toast({
          title: "Receipt uploaded",
          description: "Your transaction receipt has been submitted and will be reviewed shortly.",
          className: "border-green-500 bg-green-50 text-green-900",
        });
      } else {
        throw new Error(data.error || "Failed to submit transaction receipt");
      }
    } catch (error) {
      console.error("Error uploading transaction:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload transaction receipt. Please try again.",
      });
    } finally {
      setSubmittingTransaction(false);
    }
  };

  // Sidebar items
  const sidebarItems = [
    {
      title: "Student Progress",
      icon: GraduationCap,
      isActive: activeTab === "progress",
      onClick: () => setActiveTab("progress"),
    },
    {
      title: "Payments",
      icon: Wallet,
      isActive: activeTab === "payments",
      onClick: () => setActiveTab("payments"),
    },
    {
      title: "Admin Meet",
      icon: Award,
      isActive: activeTab === "profile-building",
      onClick: () => setActiveTab("profile-building"),
    },
    {
      title: "Testimonial",
      icon: Star,
      isActive: activeTab === "testimonial",
      onClick: () => setActiveTab("testimonial"),
    },
    {
      title: "Messages",
      icon: MessageSquare,
      isActive: activeTab === "chat",
      onClick: () => setActiveTab("chat"),
    },
    {
      title: "Calendar",
      icon: CalendarDays,
      isActive: activeTab === "calendar",
      onClick: () => setActiveTab("calendar"),
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Sidebar variant="inset" className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-brand-blue">
                <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white font-semibold">
                  {authUser?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {authUser?.name || "Parent"}
                </p>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {authUser?.email || ""}
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
                        isActive={item.isActive}
                        onClick={item.onClick}
                        className="w-full"
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
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              } catch {}
              window.location.href = '/';
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-lg font-semibold bg-gradient-to-r from-brand-blue to-brand-teal bg-clip-text text-transparent">
                Parent Dashboard
              </h1>
        </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {/* Student Progress Tab */}
            {activeTab === "progress" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-blue" />
                      Detailed Student Progress
                    </CardTitle>
                    <CardDescription>Comprehensive view of your children&apos;s academic journey</CardDescription>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-brand-blue" />
                      </div>
                  ) : progress.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No progress data available</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                      {progress.map((p, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-xl border-2 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold mb-1">{p.studentName}</h3>
                                <Badge className="bg-brand-blue text-white">{p.program}</Badge>
                          </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-brand-blue">{p.completionPercent}%</div>
                                <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                    </div>
                            <Progress value={p.completionPercent} className="h-4 mb-4" />
                            {p.recentMilestones.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Award className="h-4 w-4 text-brand-orange" />
                                  Recent Milestones
                                </h4>
                                <div className="space-y-2">
                                  {p.recentMilestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-accent/50">
                                      <span>{m.title}</span>
                                      <span className="text-xs text-muted-foreground">{m.date}</span>
                          </div>
                                  ))}
                        </div>
                    </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-brand-teal" />
                      Upload Transaction Receipt
                    </CardTitle>
                    <CardDescription>Upload payment receipts for verification and tracking</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-semibold">Amount *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                            className="pl-10"
                      required
                    />
                        </div>
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="transactionDate" className="text-sm font-semibold">Transaction Date *</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="transactionDate"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                            className="pl-10"
                      required
                    />
                        </div>
                  </div>
                </div>
                <div className="space-y-2">
                      <Label htmlFor="transactionId" className="text-sm font-semibold">Transaction ID / Reference Number</Label>
                  <Input
                    id="transactionId"
                    type="text"
                    placeholder="Enter transaction ID if available"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="transactionDescription" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="transactionDescription"
                    placeholder="Brief description of the payment (e.g., Monthly fee, Registration fee)"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                        rows={3}
                  />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="receipt" className="text-sm font-semibold">Transaction Receipt / Screenshot *</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-brand-teal transition-colors">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setTransactionReceipt(e.target.files?.[0] || null)}
                          className="hidden"
                  />
                        <label htmlFor="receipt" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-brand-teal" />
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF (Max 10MB)</p>
                        </label>
                  </div>
                  {transactionReceipt && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">{transactionReceipt.name}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitTransaction}
                        disabled={submittingTransaction}
                        className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
                        size="lg"
                      >
                        {submittingTransaction ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                    <Upload className="h-4 w-4 mr-2" />
                            Upload Transaction Receipt
                          </>
                        )}
                  </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            )}

            {/* Testimonial Tab */}
            {activeTab === "testimonial" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-brand-orange" />
                      Submit Testimonial
                    </CardTitle>
                    <CardDescription>
                      Share your experience with ACHARYA Educational Services. Your responses will be collected and may be featured on our website and marketing materials.
                    </CardDescription>
              </CardHeader>
                  <CardContent>
                    <div className="w-full rounded-lg overflow-hidden border-2" style={{ minHeight: '800px' }}>
                      <iframe
                        src="https://docs.google.com/forms/d/1sCKCQT-vvSPHKwBuCBdWOEFkKBGTpMMVyTbtk_jg8JE/viewform?embedded=true"
                        width="100%"
                        height="800"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        className="w-full border-0"
                        title="Parent Testimonial Form"
                      >
                        Loading…
                      </iframe>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid gap-6 lg:grid-cols-3"
              >
                <Card className="border-2 lg:col-span-1">
              <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-brand-blue" />
                      Channels
                    </CardTitle>
                    <CardDescription>Chat with mentors or the AES admin desk</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-2">
                    {chatContacts.map((contact) => {
                      const isActive = selectedChatContact?.id === contact.id;
                      const accent = getContactAccent(contact.role);
                      return (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedChatContact(contact)}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border-2 transition-all",
                                isActive
                                  ? "border-brand-blue bg-gradient-to-r from-blue-50 to-teal-50 shadow-md"
                                  : "border-transparent hover:border-brand-blue/50 hover:bg-accent/50"
                              )}
                        >
                          <div className="flex items-center gap-3">
                                <Avatar className={cn("h-11 w-11 border-2", accent)}>
                              <AvatarFallback className="text-sm font-semibold">
                                {getContactInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold truncate">{contact.name}</p>
                                      <p className="text-xs text-muted-foreground">{contact.subtitle}</p>
                                </div>
                                <span
                                      className={cn(
                                        "h-2 w-2 rounded-full",
                                    contact.status === "online"
                                      ? "bg-green-500"
                                      : contact.status === "away"
                                      ? "bg-yellow-400"
                                      : "bg-gray-400"
                                      )}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                    </ScrollArea>
                </CardContent>
              </Card>

                <Card className="border-2 lg:col-span-2 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedChatContact ? selectedChatContact.name : "Select a contact"}
                      </CardTitle>
                        <CardDescription>
                        {selectedChatContact
                          ? selectedChatContact.role === "mentor"
                            ? "Direct mentor support"
                            : "Administrative support desk"
                          : "Choose who you want to message"}
                        </CardDescription>
                    </div>
                    {selectedChatContact && (
                      <Badge variant="secondary" className="capitalize">
                        {selectedChatContact.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  {!selectedChatContact ? (
                      <div className="flex flex-1 items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Select a channel to start chatting</p>
                        </div>
                    </div>
                  ) : (
                    <>
                        <ScrollArea ref={chatScrollRef} className="h-[500px] border rounded-lg p-4 mb-4 bg-gradient-to-b from-gray-50/50 to-white">
                        {chatLoading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading messages...
                          </div>
                        ) : chatMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <div className="text-center">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No messages yet. Start the conversation!</p>
                              </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((message) => {
                              const isParent = message.sender === "parent";
                              return (
                                  <motion.div
                                  key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex", isParent ? "justify-end" : "justify-start")}
                                >
                                  <div
                                      className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md",
                                      isParent
                                          ? "bg-gradient-to-r from-brand-blue to-brand-teal text-white rounded-br-none"
                                          : "bg-white border-2 text-gray-800 rounded-bl-none"
                                      )}
                                  >
                                    <p>{message.content}</p>
                                    <span
                                        className={cn(
                                          "block text-[11px] mt-1",
                                          isParent ? "text-blue-100" : "text-muted-foreground"
                                        )}
                                    >
                                      {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={chatMessageInput}
                          onChange={(e) => setChatMessageInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChatMessage();
                            }
                          }}
                          disabled={chatSending}
                            className="flex-1"
                        />
                        <Button
                          onClick={handleSendChatMessage}
                          disabled={chatSending || !chatMessageInput.trim()}
                            className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
                        >
                          {chatSending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Admin Meet Tab */}
            {activeTab === "profile-building" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {showProfileSuccess ? (
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Successful!</h2>
                        <p className="text-gray-600 mb-6">
                          Your Admin Meet session has been booked successfully. We&apos;ll contact you within 24 hours to confirm.
                        </p>
                        <div className="space-y-2 bg-white p-4 rounded-lg mb-6 max-w-md mx-auto">
                          <p className="text-blue-800 flex items-center justify-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{profileFormData.selectedDate} at {profileFormData.selectedTime}</span>
                          </p>
                          <p className="text-blue-800 flex items-center justify-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{profileFormData.studentName}</span>
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowProfileSuccess(false);
                            setSelectedStudentId("");
                            setProfileFormData({
                              studentName: "",
                              grade: "",
                              schoolName: "",
                              parentPhone: "",
                              selectedDate: "",
                              selectedTime: "",
                            });
                            // Re-fetch students to refresh the list
                            setActiveTab("progress");
                            setTimeout(() => setActiveTab("profile-building"), 100);
                          }}
                          className="bg-gradient-to-r from-brand-blue to-brand-teal"
                        >
                          Book Another Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-brand-teal" />
                        Book Admin Meet Session
                      </CardTitle>
                      <CardDescription>Fill in the details and select your preferred date and time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Student Selection / Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-brand-blue" />
                            Student Information
                          </h3>
                          
                          {profileStudentsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <RefreshCw className="h-5 w-5 animate-spin text-brand-blue" />
                              <span className="ml-3 text-sm text-muted-foreground">Loading student information...</span>
                            </div>
                          ) : profileStudents.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm text-yellow-800">
                                <strong>No students found.</strong> Please contact AES admin to register your student first.
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Student Selector - Only show if multiple students */}
                              {profileStudents.length > 1 && (
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="profile-student-selector">Select Student *</Label>
                                  <select
                                    id="profile-student-selector"
                                    value={selectedStudentId}
                                    onChange={(e) => handleStudentSelection(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    required
                                  >
                                    <option value="">Choose a student</option>
                                    {profileStudents.map((student) => (
                                      <option key={student.id} value={student.id.toString()}>
                                        {student.name} - {student.grade}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              {/* Auto-filled fields - Read-only if student is selected */}
                              <div className="space-y-2">
                                <Label htmlFor="profile-student-name">Student Name *</Label>
                                <Input
                                  id="profile-student-name"
                                  value={profileFormData.studentName}
                                  onChange={(e) => setProfileFormData(prev => ({ ...prev, studentName: e.target.value }))}
                                  placeholder="Enter student name"
                                  disabled={profileStudents.length > 0}
                                  className={profileStudents.length > 0 ? "bg-gray-50" : ""}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="profile-grade">Grade *</Label>
                                <Input
                                  id="profile-grade"
                                  value={profileFormData.grade}
                                  onChange={(e) => setProfileFormData(prev => ({ ...prev, grade: e.target.value }))}
                                  placeholder="Enter grade"
                                  disabled={profileStudents.length > 0}
                                  className={profileStudents.length > 0 ? "bg-gray-50" : ""}
                                  required
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="profile-school">School Name *</Label>
                                <Input
                                  id="profile-school"
                                  value={profileFormData.schoolName}
                                  onChange={(e) => setProfileFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                                  placeholder="Enter school name"
                                  disabled={profileStudents.length > 0}
                                  className={profileStudents.length > 0 ? "bg-gray-50" : ""}
                                  required
                                />
                              </div>
                              
                              {profileStudents.length > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    Student information loaded from your account
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Date and Time Selection */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-brand-blue" />
                            Select Date & Time
                          </h3>
                          
                          {profileSlotsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <RefreshCw className="h-6 w-6 animate-spin text-brand-blue" />
                              <span className="ml-3 text-sm text-muted-foreground">Loading availability...</span>
                            </div>
                          ) : Object.keys(profileAvailability).length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                              <p className="text-muted-foreground">No admin meet slots available at the moment.</p>
                              <p className="text-sm text-muted-foreground mt-2">Please check back later.</p>
                            </div>
                          ) : (
                            <AdminMeetCalendar
                              selectedDate={profileFormData.selectedDate}
                              selectedTime={profileFormData.selectedTime}
                              onDateSelect={(date: string) => setProfileFormData(prev => ({ ...prev, selectedDate: date, selectedTime: "" }))}
                              onTimeSelect={(time: string) => setProfileFormData(prev => ({ ...prev, selectedTime: time }))}
                              dateTimeMapping={profileAvailability}
                            />
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            onClick={async () => {
                              if (!profileFormData.studentName || !profileFormData.grade || !profileFormData.schoolName) {
                                toast({
                                  title: "Missing information",
                                  description: "Please fill in all student information fields.",
                                  className: "border-yellow-500 bg-yellow-50 text-yellow-900",
                                });
                                return;
                              }
                              
                              if (!profileFormData.selectedDate || !profileFormData.selectedTime) {
                                toast({
                                  title: "No date/time selected",
                                  description: "Please select a date and time for your admin meet session.",
                                  className: "border-yellow-500 bg-yellow-50 text-yellow-900",
                                });
                                return;
                              }
                              
                              try {
                                setBookingProfileSlot(true);
                                const response = await fetch('/api/book-session', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  credentials: 'include',
                                  body: JSON.stringify({
                                    parentName: authUser?.name || "",
                                    parentEmail: authUser?.email || "",
                                    parentPhone: profileFormData.parentPhone || "",
                                    studentName: profileFormData.studentName,
                                    studentEmail: authUser?.email || "",
                                    grade: profileFormData.grade,
                                    schoolName: profileFormData.schoolName,
                                    program: "Parent Meet",
                                    preferredDateTime: `${profileFormData.selectedDate} at ${profileFormData.selectedTime}`,
                                    submittedAt: new Date().toISOString(),
                                  }),
                                });
                                
                                const data = await response.json();
                                
                                if (data.success) {
                                  console.log('✅ Admin Meet booking successful:', data.bookingId);
                                  setShowProfileSuccess(true);
                                  
                                  toast({
                                    title: "Booking confirmed!",
                                    description: "Your admin meet session has been booked successfully.",
                                    className: "border-green-500 bg-green-50 text-green-900",
                                  });
                                  
                                  // Auto-hide success after 8 seconds
                                  setTimeout(() => {
                                    setShowProfileSuccess(false);
                                    setSelectedStudentId("");
                                    setProfileFormData({
                                      studentName: "",
                                      grade: "",
                                      schoolName: "",
                                      parentPhone: "",
                                      selectedDate: "",
                                      selectedTime: "",
                                    });
                                  }, 8000);
                                } else {
                                  toast({
                                    title: "Booking failed",
                                    description: data.error || "Failed to book the session. Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              } catch (error) {
                                console.error('Error booking admin meet session:', error);
                                toast({
                                  title: "Booking failed",
                                  description: "An error occurred while booking. Please try again.",
                                  variant: "destructive",
                                });
                              } finally {
                                setBookingProfileSlot(false);
                              }
                            }}
                            disabled={
                              !profileFormData.studentName ||
                              !profileFormData.grade ||
                              !profileFormData.schoolName ||
                              !profileFormData.selectedDate ||
                              !profileFormData.selectedTime ||
                              bookingProfileSlot
                            }
                            className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
                          >
                            {bookingProfileSlot ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Booking...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Book Session
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-brand-teal" />
                      Schedule & Calendar
                    </CardTitle>
                    <CardDescription>View upcoming sessions and events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ParentScheduleView parentEmail={parentEmail} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
      </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
