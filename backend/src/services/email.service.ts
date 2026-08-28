import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT),
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - DailyPizza',
    html: `
      <h2>Welcome to DailyPizza!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="background: #E8722A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - DailyPizza',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #E8722A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendLowStockAlert = async (items: Array<{ item: string; quantity: number; threshold: number }>): Promise<void> => {
  const itemList = items.map(i => `<li>${i.item}: ${i.quantity} (threshold: ${i.threshold})</li>`).join('');

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: env.EMAIL_USER,
    subject: 'Low Stock Alert - DailyPizza',
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following items are below their threshold:</p>
      <ul>${itemList}</ul>
      <p>Please restock these items soon.</p>
    `,
  });
};
