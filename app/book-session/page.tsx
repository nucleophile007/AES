"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/home/Header'
import Footer from '@/components/home/Footer'
import Link from 'next/link'

// Calendar Picker Component
interface CalendarPickerProps {
  selectedDate: string
  selectedTime: string
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  dateTimeMapping: Record<string, string[]>
}

function CalendarPicker({ selectedDate, selectedTime, onDateSelect, onTimeSelect, dateTimeMapping }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<number | null> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setCurrentMonth((prev) => {
      const n = new Date(prev)
      n.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1))
      return n
    })
  }

  const formatDate = (day: number) => {
    const month = currentMonth.getMonth() + 1
    const year = currentMonth.getFullYear()
    return `${month}/${day}/${year}`
  }

  const isSelectedDate = (day: number) => selectedDate === formatDate(day)
  const isDateAvailable = (day: number) => Object.prototype.hasOwnProperty.call(dateTimeMapping, formatDate(day))
  const getAvailableTimesForDate = (date: string) => dateTimeMapping[date] || []

  // Parse a time string like "9:00 AM" or "12:30 pm" to minutes since midnight
  const timeStringToMinutes = (input: string) => {
    const s = input.trim()
    const firstPart = s.split(/[–-]/)[0].trim()
    const match = firstPart.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])$/)
    if (!match) return Number.MAX_SAFE_INTEGER
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2] || "0", 10)
    const meridiem = match[3].toUpperCase()
    if (hours === 12) hours = 0
    if (meridiem === "PM") hours += 12
    return hours * 60 + minutes
  }

  const days = getDaysInMonth(currentMonth)
  const availableTimesForSelectedDate = getAvailableTimesForDate(selectedDate)
  const sortedTimesForSelectedDate = [...availableTimesForSelectedDate].sort(
    (a, b) => timeStringToMinutes(a) - timeStringToMinutes(b)
  )

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold theme-text-light mb-2">Select Date & Time</h3>
        <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" type="button" onClick={(e) => navigateMonth("prev", e)} className="p-2 hover:bg-white/10 rounded-full">
              <ChevronLeft className="h-4 w-4 text-white" />
            </Button>
            <h4 className="text-lg font-bold theme-text-light">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
            <Button variant="ghost" size="sm" type="button" onClick={(e) => navigateMonth("next", e)} className="p-2 hover:bg-white/10 rounded-full">
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium theme-text-muted py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square flex items-center justify-center">
                {day && (
                  <button
                    type="button"
                    onClick={() => { if (isDateAvailable(day)) { onDateSelect(formatDate(day)); onTimeSelect("") } }}
                    disabled={!isDateAvailable(day)}
                    className={`w-10 h-10 flex items-center justify-center text-sm rounded-full transition-all duration-200 ${
                      isSelectedDate(day)
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 shadow-lg"
                        : isDateAvailable(day)
                          ? "theme-text-light hover:bg-white/10 border border-white/20"
                          : "text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold theme-text-light text-sm">Available Times</h5>
          {selectedDate ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sortedTimesForSelectedDate.length > 0 ? (
                sortedTimesForSelectedDate.map((time) => (
                  <button key={time} type="button" onClick={() => onTimeSelect(time)} className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 border-yellow-400"
                        : "bg-white/5 theme-text-light border-white/20 hover:border-yellow-400/50"
                    }`}>
                    {time}
                  </button>
                ))
              ) : (
                <p className="theme-text-muted text-center py-4 text-sm">No times available</p>
              )}
            </div>
          ) : (
            <p className="theme-text-muted text-center py-4 text-sm">Select a date first</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookSessionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    studentName: "",
    grade: "",
    schoolName: "",
    programInterested: "",
    selectedDate: "",
    selectedTime: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Hardcoded availability for different programs
  const programAvailability: Record<string, Record<string, string[]>> = {
    "Academic Tutoring": {
      "8/20/2025": ["10:00 AM", "2:00 PM", "4:00 PM"],
      "8/21/2025": ["9:00 AM", "1:00 PM", "3:00 PM"],
      "8/22/2025": ["11:00 AM", "2:00 PM", "5:00 PM"],
    },
    "SAT Coaching": {
      "8/20/2025": ["9:00 AM", "11:00 AM", "3:00 PM"],
      "8/21/2025": ["10:00 AM", "2:00 PM", "4:00 PM"],
      "8/23/2025": ["9:00 AM", "1:00 PM", "3:00 PM"],
    },
    "College Prep": {
      "8/19/2025": ["10:00 AM", "1:00 PM", "3:00 PM"],
      "8/20/2025": ["9:00 AM", "11:00 AM", "2:00 PM"],
      "8/21/2025": ["10:00 AM", "1:00 PM", "4:00 PM"],
    },
    "Olympiads": {
      "8/20/2025": ["9:00 AM", "11:00 AM", "2:00 PM"],
      "8/22/2025": ["10:00 AM", "1:00 PM", "3:00 PM"],
      "8/23/2025": ["9:00 AM", "2:00 PM", "4:00 PM"],
    },
    "Research Program": {
      "8/19/2025": ["10:00 AM", "2:00 PM"],
      "8/21/2025": ["9:00 AM", "1:00 PM"],
      "8/22/2025": ["11:00 AM", "3:00 PM"],
    },
    "AES Creatoverse": {
      "8/20/2025": ["10:00 AM", "1:00 PM"],
      "8/21/2025": ["9:00 AM", "2:00 PM"],
      "8/23/2025": ["11:00 AM", "3:00 PM"],
    }
  }

  const availability = programAvailability[formData.programInterested] || {}

  // Program options
  const programOptions = [
    "Academic Tutoring",
    "SAT Coaching", 
    "College Prep",
    "Olympiads",
    "Research Program",
    "AES Creatoverse"
  ]

  // Grade options
  const gradeOptions = [
    '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ]

  // Clear date/time when program changes
  useEffect(() => {
    if (formData.programInterested) {
      setFormData(prev => ({ ...prev, selectedDate: "", selectedTime: "" }))
    }
  }, [formData.programInterested])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Send to QStash for Google Sheets integration
      const response = await fetch('/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentName: formData.parentName,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          studentName: formData.studentName,
          studentEmail: formData.email,
          grade: formData.grade,
          schoolName: formData.schoolName,
          program: formData.programInterested,
          preferredDateTime: `${formData.selectedDate} at ${formData.selectedTime}`,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          setCurrentStep(1)
          setFormData({
            email: "",
            parentName: "",
            parentEmail: "",
            parentPhone: "",
            studentName: "",
            grade: "",
            schoolName: "",
            programInterested: "",
            selectedDate: "",
            selectedTime: "",
          })
        }, 8000)
      } else {
        alert("Booking failed. Please try again.")
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert("Network error. Please check your connection and try again.")
    }

    setIsSubmitting(false)
  }

  const nextStep = () => setCurrentStep(2)
  const prevStep = () => setCurrentStep(1)

  const canProceedStep1 =
    formData.email &&
    formData.parentName &&
    formData.parentEmail &&
    formData.parentPhone &&
    formData.studentName &&
    formData.grade &&
    formData.schoolName &&
    formData.programInterested

  const canSubmit = canProceedStep1 && formData.selectedDate && formData.selectedTime

  if (showSuccessModal) {
    return (
      <main className="min-h-screen theme-bg-dark flex flex-col">
        <Header />
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Session Booked Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for booking with AES. We'll review your request and contact you within 24 hours.
            </p>
            <div className="space-y-2 text-left bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 flex items-center gap-2">
                <span className="text-lg">📅</span> {formData.selectedDate} at {formData.selectedTime}
              </p>
              <p className="text-blue-800 flex items-center gap-2">
                <span className="text-lg">📚</span> {formData.programInterested}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
                Redirecting shortly...
              </span>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="theme-bg-dark py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              📅 Book Your Session
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold theme-text-light mb-4">
              Schedule Your Free Discovery Session
            </h1>
            <p className="text-lg theme-text-muted max-w-2xl mx-auto">
              Take the first step towards academic excellence with our expert mentors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-12 theme-bg-dark">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-yellow-400/5 to-amber-500/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-yellow-400/20 shadow-2xl">
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step <= currentStep
                        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold theme-text-light mb-2">Personal Information</h3>
                    <p className="theme-text-muted">Tell us about yourself and your academic goals</p>
                  </div>

                  {/* Student Information */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block theme-text-light font-medium mb-2">Student Name *</label>
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Student's full name"
                      />
                    </div>
                    <div>
                      <label className="block theme-text-light font-medium mb-2">Student Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="student@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block theme-text-light font-medium mb-2">Current Grade *</label>
                      <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="">Select grade</option>
                        {gradeOptions.map(grade => (
                          <option key={grade} value={grade} className="bg-gray-800 text-white">
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block theme-text-light font-medium mb-2">School Name *</label>
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="School name"
                      />
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-lg font-semibold theme-text-light mb-4">Parent/Guardian Information</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block theme-text-light font-medium mb-2">Parent Name *</label>
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Parent's full name"
                        />
                      </div>
                      <div>
                        <label className="block theme-text-light font-medium mb-2">Parent Email *</label>
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block theme-text-light font-medium mb-2">Parent Phone *</label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="(209) 920-7147"
                      />
                    </div>
                  </div>

                  {/* Program Selection */}
                  <div>
                    <label className="block theme-text-light font-medium mb-2">Program of Interest *</label>
                    <select
                      name="programInterested"
                      value={formData.programInterested}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="">Select a program</option>
                      {programOptions.map(program => (
                        <option key={program} value={program} className="bg-gray-800 text-white">
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedStep1}
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 hover:from-yellow-300 hover:to-amber-400 px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold theme-text-light mb-2">Select Date & Time</h3>
                    <p className="theme-text-muted">Choose your preferred session schedule</p>
                  </div>

                  <CalendarPicker
                    selectedDate={formData.selectedDate}
                    selectedTime={formData.selectedTime}
                    onDateSelect={(date: string) => setFormData((prev) => ({ ...prev, selectedDate: date }))}
                    onTimeSelect={(time: string) => setFormData((prev) => ({ ...prev, selectedTime: time }))}
                    dateTimeMapping={availability}
                  />

                  <div className="bg-yellow-400/10 p-4 rounded-lg border border-yellow-400/20">
                    <p className="theme-text-light text-sm">
                      📋 This session is completely FREE with no commitment required. We'll confirm your booking within 24 hours.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !canSubmit}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Booking..." : "Book Session"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />

      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(16px); }
        }
        .animate-float-reverse {
          animation: floatReverse 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
