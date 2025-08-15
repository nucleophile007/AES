"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

function getBotResponse(message: string) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("program") || lowerMessage.includes("course")) {
    return "We offer tutoring in Mathematics, Physics, Chemistry, Biology, SAT coaching, College Prep, and Research Programs. Which subject interests you most?";
  } else if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
    return "Our tutoring sessions have custom packages available. Would you like me to connect you with our admissions team for specific pricing?";
  } else if (lowerMessage.includes("schedule") || lowerMessage.includes("time")) {
    return "We offer flexible scheduling with both online and in-person options. What time zone are you in and what days work best for you?";
  } else if (lowerMessage.includes("sat") || lowerMessage.includes("test")) {
    return "Our SAT coaching program has helped students achieve an average score improvement of 280+ points. Would you like to know more about our test prep methodology?";
  } else if (lowerMessage.includes("research")) {
    return "Our Research Programs help students conduct real scientific research and have led to Intel Science Fair finals and published papers. Are you interested in a specific research area?";
  } else {
    return "Thank you for your question! For specific details, I'd recommend scheduling a consultation with our team. Would you like me to help you set up a free assessment call?";
  }
}

export default function Chatbot() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
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
    const newMessage = {
      id: chatMessages.length + 1,
      text: messageInput,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput("");
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        text: getBotResponse(messageInput),
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 1000);
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
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 shadow-2xl border-2 border-yellow-300/30 relative overflow-hidden group"
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
          className="absolute bottom-16 sm:bottom-20 right-0 w-72 sm:w-80 h-80 sm:h-96 bg-gradient-to-br from-[#1a2236]/95 to-[#1a2236]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-yellow-400/20 overflow-hidden"
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
                className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 sm:p-4 h-56 sm:h-64 overflow-y-auto space-y-3 sm:space-y-4 bg-gradient-to-b from-[#1a2236]/50 to-[#1a2236]/30">
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg"
                      : "bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-100 border border-slate-600/50"
                  }`}
                >
                  <p className="text-xs sm:text-sm">{message.text}</p>
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
                placeholder="Type your message..."
                className="flex-1 text-xs sm:text-sm bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg shadow-lg border border-yellow-300/30"
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