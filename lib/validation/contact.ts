import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid email is required"),
  phone: z
    .preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(7, "Phone number should be at least 7 characters")
        .max(25, "Phone number is too long"),
    )
    .optional(),
  role: z.preprocess(emptyToUndefined, z.string().max(50)).optional(),
  programInterest: z
    .preprocess(emptyToUndefined, z.string().max(100))
    .optional(),
  subject: z.string().trim().min(3, "Subject is required").max(120),
  message: z.string().trim().min(10, "Message is required").max(2000),
  preferredContact: z.preprocess(
    emptyToUndefined,
    z.enum(["email", "phone", "either"]).optional(),
  ),
  studentName: z.preprocess(emptyToUndefined, z.string().max(100)).optional(),
  studentGrade: z.preprocess(emptyToUndefined, z.string().max(50)).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
