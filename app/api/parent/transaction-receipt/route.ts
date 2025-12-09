import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "parent") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const amount = typeof body.amount === "string" ? body.amount.trim() : "";
    const transactionDate = typeof body.transactionDate === "string" ? body.transactionDate.trim() : "";
    const receiptUrl = typeof body.receiptUrl === "string" ? body.receiptUrl.trim() : "";
    const receiptFileName = typeof body.receiptFileName === "string" ? body.receiptFileName : "";
    const receiptFileSize = typeof body.receiptFileSize === "number" ? body.receiptFileSize : 0;
    
    // Optional fields
    const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : null;
    const description = typeof body.description === "string" ? body.description.trim() : null;

    if (!amount || !transactionDate || !receiptUrl) {
      return NextResponse.json({ 
        success: false, 
        error: "Amount, transaction date, and receipt file are required" 
      }, { status: 400 });
    }

    const receipt = await prisma.transactionReceipt.create({
      data: {
        parentId: user.id,
        parentName: user.name ?? "",
        parentEmail: user.email ?? "",
        amount,
        transactionDate,
        transactionId,
        description,
        receiptUrl,
        receiptFileName,
        receiptFileSize,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, receipt }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction receipt:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to upload transaction receipt" 
    }, { status: 500 });
  }
}
