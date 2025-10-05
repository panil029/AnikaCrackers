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

    // Create SMTP transporter using your Gmail or SMTP service
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL; // your email to receive orders

    const mailOptions = {
      from: userEmail || process.env.SMTP_USER, // show user's email if provided
      to: adminEmail,
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
