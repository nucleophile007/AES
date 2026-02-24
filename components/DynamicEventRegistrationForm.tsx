"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormSkeleton from "@/components/skeletons/FormSkeleton";

interface CustomField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "number" | "date";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface RegistrationFormConfig {
  studentPhone?: "required" | "optional" | "hidden";
  studentGrade?: "required" | "optional" | "hidden";
  schoolName?: "required" | "optional" | "hidden";
  parentPhone?: "required" | "optional" | "hidden";
  specialRequirements?: "required" | "optional" | "hidden";
}

interface EventDetails {
  id: number;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventTime: string;
  location: string;
  image: string;
  maxParticipants: number | null;
  availableSpots: number | null;
  registrationDeadline: string | null;
  targetAudience: string | null;
  requirements: string | null;
  agenda: string | null;
  speakers: any;
  tags: string[];
  registrationFormConfig: RegistrationFormConfig | null;
  customFields: CustomField[] | null;
  registrationFee: number;
  earlyBirdFee: number | null;
  earlyBirdDeadline: string | null;
  requiresPayment: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
}

interface DynamicEventRegistrationFormProps {
  eventId: number;
}

export default function DynamicEventRegistrationForm({ eventId }: DynamicEventRegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [formData, setFormData] = useState<any>({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    studentGrade: "",
    schoolName: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    specialRequirements: "",
    howDidYouHear: "",
    customFieldResponses: {},
  });

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      customFieldResponses: {
        ...prev.customFieldResponses,
        [fieldName]: value,
      },
    }));
  };

  const isFieldRequired = (fieldName: keyof RegistrationFormConfig): boolean => {
    if (!event?.registrationFormConfig) return false;
    return event.registrationFormConfig[fieldName] === "required";
  };

  const isFieldVisible = (fieldName: keyof RegistrationFormConfig): boolean => {
    if (!event?.registrationFormConfig) return true;
    return event.registrationFormConfig[fieldName] !== "hidden";
  };

  const calculateFee = (): number => {
    if (!event?.requiresPayment) return 0;

    const now = new Date();
    const earlyBirdDeadline = event.earlyBirdDeadline ? new Date(event.earlyBirdDeadline) : null;

    if (earlyBirdDeadline && now <= earlyBirdDeadline && event.earlyBirdFee !== null) {
      return event.earlyBirdFee;
    }

    return event.registrationFee || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          ...formData,
          paymentAmount: calculateFee(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();

      toast({
        title: "Registration Successful!",
        description: "You have been registered for the event. Check your email for confirmation.",
      });

      // Redirect to success page or events page
      router.push("/events/registration-success?id=" + result.registrationId);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Event Not Found</h2>
          <p className="text-gray-400">The event you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const registrationFee = calculateFee();
  const isEarlyBird = event.earlyBirdDeadline && new Date() <= new Date(event.earlyBirdDeadline);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Event Details Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">{event.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-5 w-5 text-yellow-400" />
            <span>{new Date(event.eventDate).toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-5 w-5 text-yellow-400" />
            <span>{event.eventTime}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="h-5 w-5 text-yellow-400" />
            <span>{event.location}</span>
          </div>
          
          {event.availableSpots !== null && (
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-5 w-5 text-yellow-400" />
              <span>{event.availableSpots} spots remaining</span>
            </div>
          )}
        </div>

        {event.requiresPayment && (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <DollarSign className="h-6 w-6 text-yellow-400" />
            <span className="text-yellow-400">${registrationFee}</span>
            {isEarlyBird && event.registrationFee !== registrationFee && (
              <span className="text-sm text-gray-400 line-through">${event.registrationFee}</span>
            )}
            {isEarlyBird && (
              <span className="text-sm bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded">
                Early Bird Pricing!
              </span>
            )}
          </div>
        )}

        <p className="text-gray-300 mt-4">{event.description}</p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Registration Form</h2>

        {/* Student Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Student Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName" className="text-gray-300">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="studentName"
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => handleInputChange("studentName", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="studentEmail" className="text-gray-300">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="studentEmail"
                type="email"
                required
                value={formData.studentEmail}
                onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
              />
            </div>

            {isFieldVisible("studentPhone") && (
              <div>
                <Label htmlFor="studentPhone" className="text-gray-300">
                  Phone Number {isFieldRequired("studentPhone") && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="studentPhone"
                  type="tel"
                  required={isFieldRequired("studentPhone")}
                  value={formData.studentPhone}
                  onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                  className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                />
              </div>
            )}

            {isFieldVisible("studentGrade") && (
              <div>
                <Label htmlFor="studentGrade" className="text-gray-300">
                  Grade {isFieldRequired("studentGrade") && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="studentGrade"
                  type="text"
                  required={isFieldRequired("studentGrade")}
                  value={formData.studentGrade}
                  onChange={(e) => handleInputChange("studentGrade", e.target.value)}
                  placeholder="e.g., 9th, 10th, 11th, 12th"
                  className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                />
              </div>
            )}

            {isFieldVisible("schoolName") && (
              <div className="md:col-span-2">
                <Label htmlFor="schoolName" className="text-gray-300">
                  School Name {isFieldRequired("schoolName") && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="schoolName"
                  type="text"
                  required={isFieldRequired("schoolName")}
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Parent/Guardian Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentName" className="text-gray-300">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="parentName"
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => handleInputChange("parentName", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="parentEmail" className="text-gray-300">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="parentEmail"
                type="email"
                required
                value={formData.parentEmail}
                onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
              />
            </div>

            {isFieldVisible("parentPhone") && (
              <div>
                <Label htmlFor="parentPhone" className="text-gray-300">
                  Phone Number {isFieldRequired("parentPhone") && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  required={isFieldRequired("parentPhone")}
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Custom Fields */}
        {event.customFields && event.customFields.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.customFields.map((field: CustomField) => (
                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <Label htmlFor={field.name} className="text-gray-300">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </Label>
                  
                  {field.type === "select" ? (
                    <Select
                      required={field.required}
                      value={formData.customFieldResponses[field.name] || ""}
                      onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                    >
                      <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200">
                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      required={field.required}
                      value={formData.customFieldResponses[field.name] || ""}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      required={field.required}
                      value={formData.customFieldResponses[field.name] || ""}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Requirements */}
        {isFieldVisible("specialRequirements") && (
          <div className="mb-6">
            <Label htmlFor="specialRequirements" className="text-gray-300">
              Special Requirements {isFieldRequired("specialRequirements") && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id="specialRequirements"
              required={isFieldRequired("specialRequirements")}
              value={formData.specialRequirements}
              onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
              placeholder="Any dietary restrictions, accessibility needs, or other requirements..."
              className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200"
              rows={3}
            />
          </div>
        )}

        {/* How Did You Hear About Us */}
        <div className="mb-6">
          <Label htmlFor="howDidYouHear" className="text-gray-300">
            How did you hear about this event?
          </Label>
          <Select
            value={formData.howDidYouHear}
            onValueChange={(value) => handleInputChange("howDidYouHear", value)}
          >
            <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-700 text-gray-200">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
              <SelectItem value="email">Email Newsletter</SelectItem>
              <SelectItem value="friend">Friend/Family</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting || (event.availableSpots !== null && event.availableSpots <= 0)}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg py-6"
        >
          {submitting ? (
            <>
              <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : event.availableSpots !== null && event.availableSpots <= 0 ? (
            "Event Full - Registration Closed"
          ) : event.requiresPayment ? (
            `Register & Pay $${registrationFee}`
          ) : (
            "Complete Registration"
          )}
        </Button>

        {event.requiresPayment && (
          <p className="text-sm text-gray-400 mt-4 text-center">
            Payment will be processed after form submission
          </p>
        )}
      </form>
    </div>
  );
}
