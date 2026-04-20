"use client"

import type React from "react"
import { useState } from "react"
import { X, Mail, User, Phone, MessageSquare, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AccessModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: () => void
}

export function AccessModal({ isOpen, onClose, onSubmit }: AccessModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        reason: "",
    })
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const validateForm = () => {
        const newErrors: { name?: string; email?: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsSubmitting(false)
        onSubmit()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-yellow-400/10 to-transparent" />

                {/* Header */}
                <div className="relative p-6 pb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 theme-text-muted hover:text-yellow-400"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-xl flex items-center justify-center border border-yellow-400/20">
                            <Lock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold theme-text-light">Request Full Access</h2>
                            <p className="text-sm theme-text-muted">View all research materials</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                    {/* Name - Required */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm theme-text-light">
                            <User className="w-4 h-4 theme-text-muted" />
                            Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                    </div>

                    {/* Email - Required */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm theme-text-light">
                            <Mail className="w-4 h-4 theme-text-muted" />
                            Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                    </div>

                    {/* Phone - Optional */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm theme-text-light">
                            <Phone className="w-4 h-4 theme-text-muted" />
                            Phone <span className="theme-text-muted text-xs font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {/* Reason - Optional */}
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="flex items-center gap-2 text-sm theme-text-light">
                            <MessageSquare className="w-4 h-4 theme-text-muted" />
                            Reason <span className="theme-text-muted text-xs font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Tell us why you're interested..."
                            rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                            {isSubmitting ? (
                                "Submitting..."
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Get Access
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs theme-text-muted text-center pt-2">
                        By submitting, you agree to receive updates about this research.
                    </p>
                </form>
            </div>
        </div>
    )
}
