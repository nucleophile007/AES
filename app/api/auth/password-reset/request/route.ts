import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import {
  getClientIP,
  isSecureConnection,
  timingSafeDelay,
} from "@/lib/security-utils";
import {
  getRateLimitKey,
  passwordResetRequestRateLimiter,
} from "@/lib/rate-limiter";

const DEFAULT_TTL_MINUTES = 60;

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getBaseUrl(request: NextRequest) {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  // Fallback to request origin
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production" && !isSecureConnection(request)) {
      return NextResponse.json(
        { error: "Secure connection required. Please use HTTPS." },
        { status: 403 }
      );
    }

    const clientIP = getClientIP(request);

    const rateLimitKey = getRateLimitKey("passwordResetRequest", clientIP);
    const { success, resetAt } = await passwordResetRequestRateLimiter.limit(
      rateLimitKey
    );

    if (!success) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          resetAt,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      await timingSafeDelay();
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Match login precedence: student -> teacher -> parent
    const student = await prisma.student.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, password: true },
    });

    const teacher = student
      ? null
      : await prisma.teacher.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true, password: true },
        });

    const parent = student || teacher
      ? null
      : await prisma.parentAccount.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true, password: true, isActivated: true },
        });

    // Only allow reset for already-activated accounts (have a password set).
    // For parents, also require isActivated.
    if (!student && !teacher && !parent) {
      await timingSafeDelay();
      return NextResponse.json(
        { success: false, error: "Email does not exist." },
        { status: 404 }
      );
    }

    if (student && !student.password) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: "Account not activated. Please use your activation email first.",
        },
        { status: 400 }
      );
    }

    if (teacher && !teacher.password) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: "Account not activated. Please use your activation email first.",
        },
        { status: 400 }
      );
    }

    if (parent && (!parent.isActivated || !parent.password)) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          success: false,
          error: "Account not activated. Please use your activation email first.",
        },
        { status: 400 }
      );
    }

    let role: "STUDENT" | "TEACHER" | "PARENT" | null = null;
    let userId: number | null = null;

    if (student) {
      role = "STUDENT";
      userId = student.id;
    } else if (teacher) {
      role = "TEACHER";
      userId = teacher.id;
    } else if (parent) {
      role = "PARENT";
      userId = parent.id;
    }

    if (!role || !userId) {
      await timingSafeDelay();
      return NextResponse.json(
        { success: false, error: "Email does not exist." },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);

    const ttlMinutes = Number(
      process.env.PASSWORD_RESET_TTL_MINUTES ?? String(DEFAULT_TTL_MINUTES)
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await prisma.passwordResetRequest.create({
      data: {
        role,
        userId,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = getBaseUrl(request);
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;">
          <h2>Password reset</h2>
          <p>We received a request to reset your password.</p>
          <p>This link expires in ${ttlMinutes} minutes.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `.trim(),
      text: `Reset your password: ${resetUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: "Reset link sent to your email.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    await timingSafeDelay();
    return NextResponse.json(
      { success: false, error: "Server error: failed to send reset email." },
      { status: 500 }
    );
  }
}
