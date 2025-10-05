// app/api/email/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { subject, message, userEmail } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
        console.error("Missing critical SMTP environment variables!");
        return NextResponse.json(
            { error: "Server configuration error: Email credentials missing." },
            { status: 500 }
        );
    }

    // Create SMTP transporter using your Gmail or SMTP service
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: true, // true for port 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: userEmail || SMTP_USER, // show user's email if provided
      to: ADMIN_EMAIL,
      subject: subject,
      text: `
📦 New Order Received

${message}

----------------------------
From: ${userEmail || "No email provided"}
`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email send failed:", err);
    return NextResponse.json(
      { error: "Email send failed", details: err.message },
      { status: 500 }
    );
  }
}