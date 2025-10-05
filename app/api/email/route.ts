import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const cart = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password", // use App Password
    },
  });

  await transporter.sendMail({
    from: '"Cracker Store" <your-email@gmail.com>',
    to: "your-email@gmail.com",
    subject: "Cart Order",
    text: JSON.stringify(cart, null, 2),
  });

  return NextResponse.json({ success: true });
}
