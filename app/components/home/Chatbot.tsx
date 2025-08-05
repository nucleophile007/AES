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
      text: "Hello! I'm AES Assistant. How can I help you today? I can answer questions about our programs, tutoring services, or help you get started.",
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
      <Button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90 shadow-lg"
      >
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
      </Button>
      {chatbotOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute bottom-16 sm:bottom-20 right-0 w-72 sm:w-80 h-80 sm:h-96 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="bg-gradient-to-r from-brand-blue to-brand-teal p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">AES Assistant</h3>
                  <p className="text-xs opacity-90">Online now</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatbotOpen(false)}
                className="text-white hover:bg-white/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <div className="flex-1 p-3 sm:p-4 h-56 sm:h-64 overflow-y-auto space-y-3 sm:space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-text-dark"
                  }`}
                >
                  <p className="text-xs sm:text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs sm:text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-brand-blue hover:bg-brand-blue/90 h-8 w-8 sm:h-9 sm:w-9 p-0"
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