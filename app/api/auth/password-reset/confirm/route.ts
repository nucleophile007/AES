import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  getClientIP,
  isSecureConnection,
  timingSafeDelay,
} from "@/lib/security-utils";
import {
  getRateLimitKey,
  passwordResetConfirmRateLimiter,
} from "@/lib/rate-limiter";
import {
  validatePasswordStrength,
  isCommonPassword,
} from "@/lib/security-utils";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
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
    const userAgent = request.headers.get("user-agent") || "unknown";

    const rateLimitKey = getRateLimitKey("passwordResetConfirm", clientIP);
    const { success, resetAt } = await passwordResetConfirmRateLimiter.limit(
      rateLimitKey
    );

    if (!success) {
      await timingSafeDelay();
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
          resetAt,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const token = String(body?.token ?? "").trim();
    const password = String(body?.password ?? body?.newPassword ?? "");

    if (!token || !password) {
      await timingSafeDelay();
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error, strength: passwordValidation.strength },
        { status: 400 }
      );
    }

    if (isCommonPassword(password)) {
      return NextResponse.json(
        { error: "This password is too common. Please choose a more unique password." },
        { status: 400 }
      );
    }

    const tokenHash = sha256(token);

    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { tokenHash },
    });

    if (
      !resetRequest ||
      resetRequest.isUsed ||
      new Date() > resetRequest.expiresAt
    ) {
      await timingSafeDelay();
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the correct user table based on the stored role
    if (resetRequest.role === "STUDENT") {
      await prisma.student.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      });
    } else if (resetRequest.role === "TEACHER") {
      await prisma.teacher.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword },
      });
    } else if (resetRequest.role === "PARENT") {
      await prisma.parentAccount.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword, updatedAt: new Date() },
      });
    } else {
      await timingSafeDelay();
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    await prisma.passwordResetRequest.update({
      where: { id: resetRequest.id },
      data: { isUsed: true },
    });

    // Best-effort security log
    try {
      await prisma.securityLog.create({
        data: {
          event: "PASSWORD_RESET",
          userId: resetRequest.userId,
          userRole: resetRequest.role,
          success: true,
          ipAddress: clientIP,
          userAgent,
        },
      });
    } catch (e) {
      console.error("Failed to log password reset event:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset confirm error:", error);
    await timingSafeDelay();
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
