/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * General-purpose raw mail sender
   */
  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${to} with subject: "${subject}"...`);
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
      this.logger.log(`Email successfully sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Scenario: Restaurant Request Received (Onboarding submission confirmation)
   */
  async sendRestaurantRequestReceived(
    to: string,
    name: string,
    restaurantName: string,
  ): Promise<boolean> {
    const subject = `We received your request for ${restaurantName}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Hello ${name},</h2>
        <p>Thank you for requesting early access for <strong>${restaurantName}</strong> on the TheSmartBills platform!</p>
        <p>Our team is currently reviewing your request. We will verify the details and get back to you with login instructions within 24-48 business hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">This is an automated email from TheSmartBills Support. Please do not reply directly to this message.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  /**
   * Scenario: Restaurant Request Approved (Onboarding complete)
   */
  async sendRestaurantRequestApproved(
    to: string,
    name: string,
    restaurantName: string,
    setupLink: string,
  ): Promise<boolean> {
    const subject = `Congratulations! Your request for ${restaurantName} has been approved`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #10B981;">Welcome to TheSmartBills!</h2>
        <p>Hello ${name},</p>
        <p>We are excited to inform you that your registration request for <strong>${restaurantName}</strong> has been approved!</p>
        <p>You can now set up your owner account and start configuring your outlets by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Set Up Account</a>
        </div>
        <p>If the button above does not work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;"><a href="${setupLink}">${setupLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Best regards,<br/>The TheSmartBills Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  /**
   * Scenario: Password Reset OTP
   */
  async sendPasswordResetOtp(to: string, otp: string): Promise<boolean> {
    const subject = `Your Password Reset Code - ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>We received a request to reset your password. Use the following verification code to complete the process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #F3F4F6; padding: 10px 20px; border-radius: 4px; display: inline-block;">${otp}</span>
        </div>
        <p>This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">TheSmartBills Security Team</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
