import { config } from "../config.js";

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

/**
 * Resend Email Provider
 * Requires RESEND_API_KEY in environment
 */
class ResendEmailProvider implements EmailProvider {
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = config.RESEND_API_KEY;
    this.from = `${config.EMAIL_FROM_NAME} <${config.EMAIL_FROM}>`;
  }

  async send(options: EmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("[Email] Resend API key not configured. Email not sent.");
      return false;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          from: this.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Email] Resend API error:", error);
        return false;
      }

      const data = await response.json() as { id?: string };
      console.log("[Email] Sent successfully:", data.id);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send:", error);
      return false;
    }
  }
}

/**
 * Console-only provider for development (logs emails instead of sending)
 */
class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<boolean> {
    console.log("=".repeat(60));
    console.log(`[DEV EMAIL] To: ${options.to}`);
    console.log(`[DEV EMAIL] Subject: ${options.subject}`);
    console.log(`[DEV EMAIL] Body Preview:`);
    console.log(options.html.substring(0, 500) + "...");
    console.log("=".repeat(60));
    return true;
  }
}

/**
 * Null provider (no-op)
 */
class NullEmailProvider implements EmailProvider {
  async send(_options: EmailOptions): Promise<boolean> {
    return false;
  }
}

/**
 * Get configured email provider based on environment
 */
export function getEmailProvider(): EmailProvider {
  if (config.RESEND_API_KEY) {
    return new ResendEmailProvider();
  }
  
  if (config.NODE_ENV === "development") {
    return new ConsoleEmailProvider();
  }

  return new NullEmailProvider();
}

// Email Templates
export const emailTemplates = {
  confirmEmail: (token: string, baseUrl: string) => ({
    subject: "Verify your Gigs Mtaani account",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Gigs Mtaani</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; margin-top: 0;">Verify your email address</h2>
              <p style="color: #666666; line-height: 1.6;">
                Welcome to Gigs Mtaani! To get started, please verify your email address by clicking the button below:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${baseUrl}/auth?mode=verify&token=${token}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #666666;">${baseUrl}/auth?mode=verify&token=${token}</span>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
              
              <p style="color: #999999; font-size: 12px; line-height: 1.6;">
                This link will expire in 24 hours. If you didn't create an account with Gigs Mtaani, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Gigs Mtaani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Verify your Gigs Mtaani account\n\nWelcome! Click the link below to verify your email:\n${baseUrl}/auth?mode=verify&token=${token}\n\nThis link expires in 24 hours.`
  }),

  passwordReset: (token: string, baseUrl: string) => ({
    subject: "Reset your Gigs Mtaani password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Gigs Mtaani</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; margin-top: 0;">Reset your password</h2>
              <p style="color: #666666; line-height: 1.6;">
                You requested to reset your password. Click the button below to create a new password:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${baseUrl}/auth?mode=reset&token=${token}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 12px; margin-top: 20px;">
                Or copy and paste this link:<br>
                <span style="color: #666666;">${baseUrl}/auth?mode=reset&token=${token}</span>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
              
              <p style="color: #999999; font-size: 12px; line-height: 1.6;">
                This link will expire in 30 minutes. If you didn't request a password reset, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Gigs Mtaani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Reset your Gigs Mtaani password\n\nClick the link below to reset your password:\n${baseUrl}/auth?mode=reset&token=${token}\n\nThis link expires in 30 minutes.`
  }),

  welcome: (displayName: string) => ({
    subject: "Welcome to Gigs Mtaani!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Gigs Mtaani</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; margin-top: 0;">Welcome, ${displayName}! 🎉</h2>
              <p style="color: #666666; line-height: 1.6;">
                Your account has been successfully verified. You're now part of the Gigs Mtaani community!
              </p>
              <p style="color: #666666; line-height: 1.6;">
                Here's what you can do:
              </p>
              <ul style="color: #666666; line-height: 1.8;">
                <li>Browse and apply for gigs near your campus</li>
                <li>Post your own gigs and earn money</li>
                <li>Chat with other students and giggers</li>
                <li>Build your trust score and reputation</li>
              </ul>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${config.WEB_ORIGIN.split(',')[0]}/app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #999999; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Gigs Mtaani. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Welcome to Gigs Mtaani!\n\nHi ${displayName}, your account is ready! Start browsing gigs at:\n${config.WEB_ORIGIN.split(',')[0]}/app`
  })
};

/**
 * Send confirmation email to user
 */
export async function sendConfirmationEmail(
  email: string,
  token: string,
  baseUrl: string = config.WEB_ORIGIN.split(",")[0]
): Promise<boolean> {
  const provider = getEmailProvider();
  const template = emailTemplates.confirmEmail(token, baseUrl);
  
  return provider.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  baseUrl: string = config.WEB_ORIGIN.split(",")[0]
): Promise<boolean> {
  const provider = getEmailProvider();
  const template = emailTemplates.passwordReset(token, baseUrl);
  
  return provider.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send welcome email (after email verification)
 */
export async function sendWelcomeEmail(
  email: string,
  displayName: string
): Promise<boolean> {
  const provider = getEmailProvider();
  const template = emailTemplates.welcome(displayName);
  
  return provider.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

