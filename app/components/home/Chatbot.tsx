"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

type ChatMessage = {
  id: number;
  text?: string;
  sender: "bot" | "user";
  time: string;
  links?: { label: string; href: string }[];
};

const ROUTES = [
  { label: "Home", href: "/", kw: ["home", "site", "main", "homepage"] },
  { label: "SAT Coaching", href: "/satcoaching", kw: ["sat", "psat", "practice", "score", "test", "prep"] },
  { label: "College Prep", href: "/collegeprep", kw: ["college", "admission", "essay", "essays", "application", "uachieve"] },
  { label: "Academic Tutoring", href: "/academictutoring", kw: ["tutor", "tutoring", "math", "physics", "chem", "bio", "subject", "academic"] },
  { label: "Research Programs", href: "/aes-explorers", kw: ["research", "paper", "publication", "mentor", "project"] },
  { label: "Math Competitions", href: "/mathcompetition", kw: ["competition", "olympiad", "amc", "aime", "contest"] },
  { label: "AES Explorers", href: "/aes-explorers", kw: ["explorer", "explorers"] },
  { label: "Book a Session", href: "/book-session", kw: ["book", "consult", "session", "call", "meeting"] },
];

function scoreRoute(msg: string, route: (typeof ROUTES)[number]) {
  const m = msg.toLowerCase();
  let score = 0;
  for (const k of route.kw) {
    if (m.includes(k)) score += k.length >= 5 ? 2 : 1;
  }
  if (m.includes(route.label.toLowerCase())) score += 2;
  return score;
}

function matchRoutes(message: string) {
  const scored = ROUTES
    .map((r) => ({ ...r, score: scoreRoute(message, r) }))
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const next = scored[1];
  const confident = !!top && top.score >= 3 && (top.score - (next?.score ?? 0) >= 2);
  const candidates = scored.filter((r) => r.score > 0).slice(0, 3);
  return { confident, top, candidates };
}

function getBotResponse(message: string): Pick<ChatMessage, "text" | "links"> {
  const lower = message.toLowerCase().trim();

  // 1) Small talk / greetings: no links, just conversational replies
  const isGreeting = /^(hi|hello|hey|yo|hola|namaste|good\s*(morning|afternoon|evening))\b/.test(lower);
  const isThanks = /(thank\s*you|thanks|thx|appreciate)/.test(lower);
  const isHowAreYou = /(how\s*are\s*you|how's\s*it\s*going)/.test(lower);

  if (isGreeting) {
    return { text: "Hi! How can I help today? You can ask about SAT, College Prep, Tutoring, Research, or bookings." };
  }
  if (isHowAreYou) {
    return { text: "I'm great and ready to help! What would you like to explore?" };
  }
  if (isThanks) {
    return { text: "You're welcome! If you need anything else, just ask." };
  }

  // 2) Intent matching with confidence gating
  const { confident, top, candidates } = matchRoutes(message);

  // Only surface links when we are confident OR the user clearly asked for info/navigation
  const askedForInfo = /(tell\s*me|more\s*info|details|learn\s*more|show\s*me|where|how\s*to|book|apply|enroll|join)/.test(lower);

  if (confident && top) {
    return {
      text: askedForInfo
        ? `Here you go: ${top.label}`
        : `I think this matches what you asked: ${top.label}. Want to check it out?`,
      links: [{ label: top.label, href: top.href }],
    };
  }

  if (candidates.length && askedForInfo) {
    return {
      text: "Did you mean one of these?",
      links: candidates.map((c) => ({ label: c.label, href: c.href })),
    };
  }

  // 3) Default conversational reply without links
  return {
    text: "Got it. Could you share a bit more? For example: 'SAT practice', 'College essays', 'Book a session', or 'Research mentorship'.",
  };
}

export default function Chatbot() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm AcharyaES Assistant. How can I help you today? I can answer questions about our programs, tutoring services, or help you get started.",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;
    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: messageInput,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput("");
    setTimeout(() => {
      const resp = getBotResponse(messageInput);
      const botResponse: ChatMessage = {
        id: Date.now(),
        text: resp.text,
        links: resp.links,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 700);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Chatbot Icon Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 shadow-2xl border-2 border-yellow-300/30 relative overflow-hidden group focus-visible:ring-0 focus-visible:outline-none"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 animate-pulse"></div>
          <div className="absolute inset-2 bg-gradient-to-r from-yellow-300/30 to-amber-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Icon with Glow Effect */}
          <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-200" />
          
          {/* Floating Particles */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-200 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-200 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.3s' }}></div>
        </Button>
      </motion.div>

      {/* Chat Window */}
      {chatbotOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-16 sm:bottom-20 right-0 w-[19rem] sm:w-[22rem] lg:w-[24rem] h-[22rem] sm:h-[26rem] lg:h-[28rem] bg-gradient-to-br from-[#1a2236]/95 to-[#1a2236]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-yellow-400/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-3 sm:p-4 text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/10 rounded-full blur-xl animate-pulse"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">AcharyaES Assistant</h3>
                  <p className="text-xs opacity-90">Online now</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatbotOpen(false)}
                className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200 focus-visible:ring-0 focus-visible:outline-none"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 sm:p-4 h-[14rem] sm:h-[17rem] overflow-y-auto space-y-3 sm:space-y-4 bg-gradient-to-b from-[#1a2236]/50 to-[#1a2236]/30 scrollbar-hide">
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 sm:px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg rounded-2xl rounded-br-sm"
                      : "bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-100 border border-slate-600/50 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {message.text && <p className="text-xs sm:text-sm">{message.text}</p>}
                  {message.sender === "bot" && message.links && message.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.links.map((l, i) => (
                        <Link key={`${l.href}-${i}`} href={l.href} className="text-xs sm:text-sm px-2 py-1 rounded-md border border-yellow-400/40 text-yellow-300 hover:text-slate-900 hover:bg-yellow-400 transition-colors focus-visible:outline-none">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-yellow-400/20 bg-gradient-to-r from-[#1a2236]/80 to-[#1a2236]/60">
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask your doubts here..."
                className="flex-1 text-xs sm:text-sm bg-slate-800/60 border-yellow-400 text-slate-100 placeholder:text-slate-400 rounded-lg outline-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg shadow-lg border border-yellow-300/30 focus-visible:ring-0 focus-visible:outline-none"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 