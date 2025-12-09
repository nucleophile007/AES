"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRequireAuth } from "../../contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ParentScheduleView from "../components/parent/ParentScheduleView";
import {
  Users,
  GraduationCap,
  Wallet,
  MessageSquare,
  CalendarDays,
  FileText,
  Upload,
  Star,
  Send,
  Video as VideoIcon,
  RefreshCw,
  LogOut,
  CheckCircle,
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

export default function ParentDashboard() {
  const { user: authUser, isLoading: authLoading } = useRequireAuth("parent");

  const parentEmail = authUser?.email || "";
  const [activeTab, setActiveTab] = useState("overview");

  // Overview / Progress
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

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

  // Feedback
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackVideo, setFeedbackVideo] = useState<File | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Testimonial
  const [testimonial, setTestimonial] = useState("");
  const [testimonialVideoLink, setTestimonialVideoLink] = useState("");
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  // useEffect(() => {
  //   // Progress
  //   const loadProgress = async () => {
  //     try {
  //       setProgressLoading(true);
  //       // Placeholder for future backend
  //       setProgress([]);
  //     } finally {
  //       setProgressLoading(false);
  //     }
  //   };

  //   // Calendar events
  //   const loadEvents = async () => {
  //     try {
  //       // Placeholder for future backend
  //       setEvents([]);
  //     } catch {}
  //   };

  //   if (parentEmail) {
  //     loadProgress();
  //     loadEvents();
  //   }
  // }, [parentEmail]);
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

// Calendar events
const loadEvents = async () => {
  // This is now handled by ParentScheduleView
};

  useEffect(() => {
    if (parentEmail) {
      loadProgress();
      loadEvents();
    }
  }, [parentEmail]);

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
          // Convert API mentors to chat contacts format
          const mentorContacts: ParentChatContact[] = data.mentors.map((mentor: any) => ({
            id: mentor.id,
            name: mentor.name,
            role: "mentor" as ParentChatRole,
            subtitle: mentor.subtitle,
            status: "online" as "online" | "away" | "offline", // Default status, can be enhanced later
          }));
          
          // Add admin contact
          const adminContact: ParentChatContact = {
            id: "admin-support",
            name: "AES Admin Team",
            role: "admin",
            subtitle: "Administration",
            status: "away",
          };
          
          // Combine mentors and admin
          const allContacts = [...mentorContacts, adminContact];
          
          setChatContacts(allContacts);
          
          // Auto-select first contact if none selected
          if (!selectedChatContact && allContacts.length > 0) {
            setSelectedChatContact(allContacts[0]);
          }
        } else {
          // Fallback to admin only if API fails
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
        // Fallback to admin only on error
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
        // Skip loading for admin (can be implemented later)
        if (selectedChatContact.role === "admin") {
          setChatMessages([]);
          setChatLoading(false);
          return;
        }

        // Extract teacher ID from contact ID (format: "mentor-{teacherId}")
        const teacherIdMatch = selectedChatContact.id.match(/mentor-(\d+)/);
        if (!teacherIdMatch) {
          console.error("Invalid mentor contact ID format");
          setChatMessages([]);
          return;
        }

        const teacherId = parseInt(teacherIdMatch[1]);
        const parentId = authUser.id;

        // Fetch messages from API
        const response = await fetch(
          `/api/messages/parent?parentId=${parentId}&teacherId=${teacherId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();

        if (data.success && data.messages) {
          // Convert API messages to ParentChatMessage format
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

    // Skip sending for admin (can be implemented later)
    if (selectedChatContact.role === "admin") {
      alert("Admin messaging will be available soon.");
      return;
    }

    // Extract teacher ID from contact ID (format: "mentor-{teacherId}")
    const teacherIdMatch = selectedChatContact.id.match(/mentor-(\d+)/);
    if (!teacherIdMatch) {
      console.error("Invalid mentor contact ID format");
      alert("Invalid mentor contact. Please refresh and try again.");
      return;
    }

    const teacherId = parseInt(teacherIdMatch[1]);
    const parentId = authUser.id;
    const messageContent = chatMessageInput.trim();

    // Optimistic update
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
      // Send message via API
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

      // Replace optimistic message with real one from server
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
      // Remove optimistic message on error
      setChatMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setChatMessageInput(messageContent);
      alert("Failed to send message. Please try again.");
    } finally {
      setChatSending(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!transactionAmount.trim() || !transactionDate || !transactionReceipt) {
      alert("Please fill in all required fields: Amount, Date, and Transaction Receipt");
      return;
    }
    try {
      setSubmittingTransaction(true);
      
      // Step 1: Upload the file first
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
      
      // Step 2: Create transaction receipt record
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
        alert("Transaction receipt uploaded successfully. It will be reviewed shortly.");
      } else {
        throw new Error(data.error || "Failed to submit transaction receipt");
      }
    } catch (error) {
      console.error("Error uploading transaction:", error);
      alert("Failed to upload transaction receipt. Please try again.");
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert('Please enter feedback before submitting.');
      return;
    }

    try {
      setSubmittingFeedback(true);
      const payload: any = { message: feedbackText };
      // Note: video upload is not supported by this endpoint yet.
      const res = await fetch('/api/parent/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackText('');
        setFeedbackVideo(null);
        alert('Feedback submitted successfully.');
      } else {
        console.error('Feedback error', data);
        alert('Failed to submit feedback: ' + (data.error || 'unknown'));
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitTestimonial = async () => {
    if (!testimonial.trim()) {
      alert("Please enter your testimonial before submitting.");
      return;
    }

    try {
      setSubmittingTestimonial(true);
      const payload: any = {
        content: testimonial,
      };
      
      if (testimonialVideoLink.trim()) {
        payload.videoLink = testimonialVideoLink.trim();
      }

      const res = await fetch('/api/parent/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setTestimonial("");
        setTestimonialVideoLink("");
        alert("Thank you for your testimonial! It has been submitted for review.");
      } else {
        throw new Error(data.error || 'Failed to submit testimonial');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit testimonial. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" /> Parent Dashboard
            </h1>
            <p className="text-gray-600 text-sm">Welcome! Track your child’s progress, manage payments, and stay connected.</p>
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              } catch {}
              window.location.href = '/';
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap gap-2">
            <TabsTrigger value="overview"><GraduationCap className="h-4 w-4 mr-2" /> Student Progress</TabsTrigger>
            <TabsTrigger value="payments"><Wallet className="h-4 w-4 mr-2" /> Payments</TabsTrigger>
            <TabsTrigger value="feedback"><FileText className="h-4 w-4 mr-2" /> Feedback</TabsTrigger>
            <TabsTrigger value="testimonial"><Star className="h-4 w-4 mr-2" /> Testimonial</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" /> Chat</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-2" /> Calendar</TabsTrigger>
          </TabsList>

          {/* Student Progress */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressLoading ? (
                    <div className="text-gray-500 text-sm">Loading progress...</div>
                  ) : progress.length === 0 ? (
                    <div className="text-gray-500 text-sm">No progress data available.</div>
                  ) : (
                    <div className="space-y-5">
                      {progress.map((p, i) => (
                        <div key={i} className="p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{p.studentName}</div>
                            <Badge variant="secondary">{p.program}</Badge>
                          </div>
                          <Progress value={p.completionPercent} className="h-2" />
                          <div className="text-xs text-gray-500 mt-2">{p.completionPercent}% completed</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {progress.flatMap((p) => p.recentMilestones.map((m, idx) => (
                        <div key={`${p.studentName}-${idx}`} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{m.title}</div>
                            <div className="text-xs text-gray-500">{p.studentName}</div>
                          </div>
                          <div className="text-xs text-gray-500">{m.date}</div>
                        </div>
                      )))}
                      {progress.length === 0 && <div className="text-gray-500 text-sm">No milestones yet.</div>}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments - Transaction Upload */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Upload Transaction Receipt</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Upload a screenshot or image of your payment transaction to verify the payment.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transactionAmount}
                      onChange={(e) => setTransactionAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionDate">Transaction Date *</Label>
                    <Input
                      id="transactionDate"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID / Reference Number</Label>
                  <Input
                    id="transactionId"
                    type="text"
                    placeholder="Enter transaction ID if available"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionDescription">Description</Label>
                  <Textarea
                    id="transactionDescription"
                    placeholder="Brief description of the payment (e.g., Monthly fee, Registration fee)"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Transaction Receipt / Screenshot *</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setTransactionReceipt(e.target.files?.[0] || null)}
                    required
                  />
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Upload className="h-3.5 w-3.5 mr-1" /> Supported: JPG, PNG, PDF (Max 10MB)
                  </div>
                  {transactionReceipt && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {transactionReceipt.name} selected
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSubmitTransaction} disabled={submittingTransaction}>
                    <Upload className="h-4 w-4 mr-2" />
                    {submittingTransaction ? "Uploading..." : "Upload Transaction Receipt"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback with video upload */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Share Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea id="feedback" placeholder="Share your thoughts..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Optional Video</Label>
                  <Input id="video" type="file" accept="video/*" onChange={(e) => setFeedbackVideo(e.target.files?.[0] || null)} />
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <VideoIcon className="h-3.5 w-3.5 mr-1" /> Supported: mp4, webm, mov
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSubmitFeedback} disabled={submittingFeedback}>
                    <Upload className="h-4 w-4 mr-2" /> {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonial */}
          <TabsContent value="testimonial">
            <Card>
              <CardHeader>
                <CardTitle>Submit Testimonial</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Share your experience with ACHARYA Educational Services. You can optionally include a link to a video testimonial from Google Drive.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testimonial">Your Testimonial *</Label>
                  <Textarea 
                    id="testimonial"
                    placeholder="Share your experience with ACHARYA Educational Services. How did we help your child achieve their goals?" 
                    value={testimonial} 
                    onChange={(e) => setTestimonial(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoLink">Video Testimonial Link (Optional)</Label>
                  <Input
                    id="videoLink"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={testimonialVideoLink}
                    onChange={(e) => setTestimonialVideoLink(e.target.value)}
                  />
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <VideoIcon className="h-3.5 w-3.5 mr-1" /> Paste your Google Drive video link here (make sure the link is set to `&quot;Anyone with the link can view&quot;`)
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button onClick={handleSubmitTestimonial} disabled={submittingTestimonial}>
                    <Star className="h-4 w-4 mr-2" /> {submittingTestimonial ? "Submitting..." : "Submit Testimonial"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle>Channels</CardTitle>
                  <p className="text-sm text-gray-500">Chat with mentors or the AES admin desk.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chatContacts.map((contact) => {
                      const isActive = selectedChatContact?.id === contact.id;
                      const accent = getContactAccent(contact.role);
                      return (
                        <button
                          key={contact.id}
                          onClick={() => setSelectedChatContact(contact)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className={`h-11 w-11 border ${accent}`}>
                              <AvatarFallback className="text-sm font-semibold">
                                {getContactInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold truncate">{contact.name}</p>
                                  <p className="text-xs text-gray-500">{contact.subtitle}</p>
                                </div>
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    contact.status === "online"
                                      ? "bg-green-500"
                                      : contact.status === "away"
                                      ? "bg-yellow-400"
                                      : "bg-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="mt-2 text-xs text-gray-400 uppercase">
                                {contact.role === "mentor" ? "Mentor" : "Admin"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Conversation */}
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {selectedChatContact ? selectedChatContact.name : "Select a contact"}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {selectedChatContact
                          ? selectedChatContact.role === "mentor"
                            ? "Direct mentor support"
                            : "Administrative support desk"
                          : "Choose who you want to message"}
                      </p>
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
                    <div className="flex flex-1 items-center justify-center text-gray-400">
                      Select a channel to start chatting.
                    </div>
                  ) : (
                    <>
                      <ScrollArea ref={chatScrollRef} className="h-80 border rounded-lg p-4 mb-4">
                        {chatLoading ? (
                          <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading messages...
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No messages yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((message) => {
                              const isParent = message.sender === "parent";
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isParent ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow ${
                                      isParent
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-white border text-gray-800 rounded-bl-none"
                                    }`}
                                  >
                                    <p>{message.content}</p>
                                    <span
                                      className={`block text-[11px] mt-1 ${
                                        isParent ? "text-blue-100" : "text-gray-400"
                                      }`}
                                    >
                                      {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
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
                        />
                        <Button
                          onClick={handleSendChatMessage}
                          disabled={chatSending || !chatMessageInput.trim()}
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
            </div>
          </TabsContent>

          {/* Calendar */}
          <TabsContent value="calendar">
            {activeTab === 'calendar' && <ParentScheduleView parentEmail={parentEmail} />}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}


