"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Button } from "@/components/ui/button";
import {
  contactFormSchema,
  type ContactFormInput,
} from "@/lib/validation/contact";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Send } from "lucide-react";

const initialForm: ContactFormInput = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  programInterest: "",
  subject: "",
  message: "",
  preferredContact: "email",
  studentName: "",
  studentGrade: "",
};

const fieldOrder: Array<keyof ContactFormInput> = [
  "fullName",
  "email",
  "phone",
  "role",
  "studentName",
  "studentGrade",
  "programInterest",
  "preferredContact",
  "subject",
  "message",
];

const baseFieldClass =
  "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg theme-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent";

const getFieldClassName = (hasError: boolean) =>
  `${baseFieldClass} ${hasError ? "border-red-400/70 focus:ring-red-400" : ""}`;

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitLockRef = useRef(false);

  const fieldErrors = useMemo(() => formErrors, [formErrors]);

  const focusFirstInvalidField = (errors: Record<string, string>) => {
    const firstInvalidField = fieldOrder.find((field) =>
      Boolean(errors[field]),
    );
    if (!firstInvalidField || !formRef.current) return;

    const input = formRef.current.querySelector<HTMLElement>(
      `[name="${firstInvalidField}"]`,
    );
    if (!input) return;

    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onChange = (field: keyof ContactFormInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    if (isSubmitted) setIsSubmitted(false);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitLockRef.current || isSubmitting) return;

    const parsed = contactFormSchema.safeParse(formData);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0];
        if (typeof key === "string") {
          nextErrors[key] = err.message;
        }
      });
      setFormErrors(nextErrors);
      focusFirstInvalidField(nextErrors);

      const firstFieldWithError = fieldOrder.find((field) =>
        Boolean(nextErrors[field]),
      );
      toast({
        variant: "destructive",
        title: "Please check the form",
        description:
          firstFieldWithError && nextErrors[firstFieldWithError]
            ? nextErrors[firstFieldWithError]
            : "Some fields need attention before submitting.",
      });
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiFieldErrors = (data?.issues?.fieldErrors ?? {}) as Record<
          string,
          string[] | undefined
        >;
        const normalizedErrors = Object.entries(apiFieldErrors).reduce<
          Record<string, string>
        >((acc, [key, messages]) => {
          if (messages && messages.length > 0) {
            acc[key] = messages[0];
          }
          return acc;
        }, {});

        if (Object.keys(normalizedErrors).length > 0) {
          setFormErrors(normalizedErrors);
          focusFirstInvalidField(normalizedErrors);
        }

        throw new Error(data?.error || "Failed to submit form");
      }

      setIsSubmitted(true);
      setFormData(initialForm);
      setFormErrors({});
      toast({
        title: "Message sent",
        description: "Thanks for reaching out. We received your message.",
        className: "border-slate-300 bg-slate-100 text-slate-900",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="theme-bg-dark pt-28 pb-12 lg:pt-32 lg:pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm theme-text-yellow uppercase tracking-[0.2em]">
              Contact
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light mt-3">
              We are here to help.
            </h1>
            <p className="theme-text-muted mt-4 text-base md:text-lg">
              Share a question, request, or program inquiry, and our team will
              follow up.
            </p>
          </div>
        </div>
      </section>

      <section className="theme-bg-dark pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-effect rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-semibold theme-text-light mb-4">
                  Reach us directly
                </h2>
                <div className="space-y-4 text-sm theme-text-muted">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 theme-text-yellow mt-0.5" />
                    <div>
                      <p className="theme-text-light">
                        acharya.folsom@gmail.com
                      </p>
                      <p>Preferred for detailed requests.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 theme-text-yellow mt-0.5" />
                    <div>
                      <p className="theme-text-light">(209) 920-7147</p>
                      <p>Mon-Fri, 9:00 AM - 6:00 PM PT.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-lg font-semibold theme-text-light">
                  What happens next
                </h3>
                <ul className="mt-4 space-y-3 text-sm theme-text-muted">
                  <li>
                    We review your message and route it to the right team.
                  </li>
                  <li>We reply with next steps or follow-up questions.</li>
                  <li>If needed, we schedule a call at your preferred time.</li>
                </ul>
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-effect rounded-2xl p-6 md:p-8 border border-white/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold theme-text-light">
                    Send a message
                  </h2>
                  <span className="text-xs theme-text-muted">* Required</span>
                </div>

                {isSubmitted && (
                  <div className="mt-4 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-sm theme-text-light">
                    Thanks for reaching out. We will follow up shortly.
                  </div>
                )}

                {isSubmitting && (
                  <div
                    className="mt-4 rounded-xl border border-yellow-300/30 bg-yellow-300/10 p-3 text-sm theme-text-light"
                    aria-live="polite"
                  >
                    Sending your message. Please wait a moment...
                  </div>
                )}

                <form
                  ref={formRef}
                  onSubmit={onSubmit}
                  className="mt-6 space-y-6"
                  noValidate
                >
                  <fieldset
                    disabled={isSubmitting}
                    className="space-y-6 disabled:opacity-90"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Full name *
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={(e) => onChange("fullName", e.target.value)}
                          className={getFieldClassName(
                            Boolean(fieldErrors.fullName),
                          )}
                          placeholder="Your name"
                          aria-invalid={Boolean(fieldErrors.fullName)}
                          aria-describedby={
                            fieldErrors.fullName ? "fullName-error" : undefined
                          }
                        />
                        {fieldErrors.fullName && (
                          <p
                            id="fullName-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Email *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => onChange("email", e.target.value)}
                          className={getFieldClassName(
                            Boolean(fieldErrors.email),
                          )}
                          placeholder="you@email.com"
                          aria-invalid={Boolean(fieldErrors.email)}
                          aria-describedby={
                            fieldErrors.email ? "email-error" : undefined
                          }
                        />
                        {fieldErrors.email && (
                          <p
                            id="email-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                          className={getFieldClassName(
                            Boolean(fieldErrors.phone),
                          )}
                          placeholder="(555) 123-4567"
                          aria-invalid={Boolean(fieldErrors.phone)}
                          aria-describedby={
                            fieldErrors.phone ? "phone-error" : undefined
                          }
                        />
                        {fieldErrors.phone && (
                          <p
                            id="phone-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="role"
                          className="block theme-text-light font-medium mb-2"
                        >
                          I am a
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={(e) => onChange("role", e.target.value)}
                          className={getFieldClassName(
                            Boolean(fieldErrors.role),
                          )}
                          aria-invalid={Boolean(fieldErrors.role)}
                          aria-describedby={
                            fieldErrors.role ? "role-error" : undefined
                          }
                        >
                          <option value="">Select</option>
                          <option value="Parent">Parent</option>
                          <option value="Student">Student</option>
                          <option value="Educator">Educator</option>
                          <option value="Partner">Partner</option>
                          <option value="Other">Other</option>
                        </select>
                        {fieldErrors.role && (
                          <p
                            id="role-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.role}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="studentName"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Student name
                        </label>
                        <input
                          id="studentName"
                          name="studentName"
                          value={formData.studentName}
                          onChange={(e) =>
                            onChange("studentName", e.target.value)
                          }
                          className={getFieldClassName(
                            Boolean(fieldErrors.studentName),
                          )}
                          placeholder="Student name (optional)"
                          aria-invalid={Boolean(fieldErrors.studentName)}
                          aria-describedby={
                            fieldErrors.studentName
                              ? "studentName-error"
                              : undefined
                          }
                        />
                        {fieldErrors.studentName && (
                          <p
                            id="studentName-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.studentName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="studentGrade"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Student grade
                        </label>
                        <input
                          id="studentGrade"
                          name="studentGrade"
                          value={formData.studentGrade}
                          onChange={(e) =>
                            onChange("studentGrade", e.target.value)
                          }
                          className={getFieldClassName(
                            Boolean(fieldErrors.studentGrade),
                          )}
                          placeholder="Grade (optional)"
                          aria-invalid={Boolean(fieldErrors.studentGrade)}
                          aria-describedby={
                            fieldErrors.studentGrade
                              ? "studentGrade-error"
                              : undefined
                          }
                        />
                        {fieldErrors.studentGrade && (
                          <p
                            id="studentGrade-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.studentGrade}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="programInterest"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Program interest
                        </label>
                        <select
                          id="programInterest"
                          name="programInterest"
                          value={formData.programInterest}
                          onChange={(e) =>
                            onChange("programInterest", e.target.value)
                          }
                          className={getFieldClassName(
                            Boolean(fieldErrors.programInterest),
                          )}
                          aria-invalid={Boolean(fieldErrors.programInterest)}
                          aria-describedby={
                            fieldErrors.programInterest
                              ? "programInterest-error"
                              : undefined
                          }
                        >
                          <option value="">Select</option>
                          <option value="Academic Tutoring">
                            Academic Tutoring
                          </option>
                          <option value="College Prep">College Prep</option>
                          <option value="AES Explorers">AES Explorers</option>
                          <option value="AES Champions">AES Champions</option>
                          <option value="AES Creatorverse">
                            AES Creatorverse
                          </option>
                          <option value="SAT Coaching">SAT Coaching</option>
                          <option value="Other">Other</option>
                        </select>
                        {fieldErrors.programInterest && (
                          <p
                            id="programInterest-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.programInterest}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="preferredContact"
                          className="block theme-text-light font-medium mb-2"
                        >
                          Preferred contact
                        </label>
                        <select
                          id="preferredContact"
                          name="preferredContact"
                          value={formData.preferredContact}
                          onChange={(e) =>
                            onChange("preferredContact", e.target.value)
                          }
                          className={getFieldClassName(
                            Boolean(fieldErrors.preferredContact),
                          )}
                          aria-invalid={Boolean(fieldErrors.preferredContact)}
                          aria-describedby={
                            fieldErrors.preferredContact
                              ? "preferredContact-error"
                              : undefined
                          }
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="either">Either</option>
                        </select>
                        {fieldErrors.preferredContact && (
                          <p
                            id="preferredContact-error"
                            className="mt-1 text-xs text-red-400"
                          >
                            {fieldErrors.preferredContact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block theme-text-light font-medium mb-2"
                      >
                        Subject *
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => onChange("subject", e.target.value)}
                        className={getFieldClassName(
                          Boolean(fieldErrors.subject),
                        )}
                        placeholder="How can we help?"
                        aria-invalid={Boolean(fieldErrors.subject)}
                        aria-describedby={
                          fieldErrors.subject ? "subject-error" : undefined
                        }
                      />
                      {fieldErrors.subject && (
                        <p
                          id="subject-error"
                          className="mt-1 text-xs text-red-400"
                        >
                          {fieldErrors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block theme-text-light font-medium mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => onChange("message", e.target.value)}
                        className={`${getFieldClassName(Boolean(fieldErrors.message))} min-h-[140px]`}
                        placeholder="Share details about your request"
                        maxLength={2000}
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={
                          fieldErrors.message ? "message-error" : undefined
                        }
                      />
                      {fieldErrors.message && (
                        <p
                          id="message-error"
                          className="mt-1 text-xs text-red-400"
                        >
                          {fieldErrors.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-xs theme-text-muted">
                        We respect your privacy. Your information is used only
                        to respond to your inquiry.
                      </p>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send message"}
                        <Send
                          className={`ml-2 h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`}
                        />
                      </Button>
                    </div>
                  </fieldset>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </main>
  );
}
