import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

// Initialize transporter asynchronously to support test account generation
const getTransporter = async () => {
  if (transporter) return transporter;

  const hasCredentials = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasCredentials) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log("No SMTP credentials found. Generating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

/**
 * Send an email notification to channel owners when a new submission is uploaded.
 * 
 * @param {object} submission - The created submission document
 * @param {string} uploaderName - Name of the user who uploaded
 * @param {string[]} ownerEmails - Array of owner email addresses
 */
export const sendSubmissionNotification = async (submission, uploaderName, ownerEmails) => {
  if (!ownerEmails || ownerEmails.length === 0) return;

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const submissionLink = `${clientUrl}/submissions/${submission._id}`;

  const mailOptions = {
    from: `"ReelOps Notifications" <${process.env.SMTP_USER || "noreply@reelops.com"}>`,
    to: ownerEmails.join(", "),
    subject: `New Submission Requires Review: ${submission.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #6366f1; margin-top: 0;">New Submission Ready for Review</h2>
        <p>Hello,</p>
        <p><strong>${uploaderName}</strong> has uploaded a new submission titled "<strong>${submission.title}</strong>" for platform <strong>${submission.platform}</strong>.</p>
        <p>Please review the submission by clicking the link below:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${submissionLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review Submission</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">If the button above does not work, copy and paste this link into your browser:</p>
        <p style="color: #6b7280; font-size: 14px; word-break: break-all;"><a href="${submissionLink}" style="color: #6366f1;">${submissionLink}</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from ReelOps.</p>
      </div>
    `,
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`📧 Submission notification email sent: ${info.messageId}`);
    
    // For ethereal email testing, log the preview URL
    if (info.messageId) {
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error("❌ Error sending submission notification email:", error);
    // Don't throw, we don't want to fail the submission upload if email fails
  }
};

/**
 * Send an email notification when a schedule is created.
 * @param {Object} automation - The automation document
 * @param {string} submissionTitle - The submission title
 * @param {string} platform - The target platform
 * @param {string[]} ownerEmails - Array of owner email addresses
 */
export const sendScheduleNotification = async (automation, submissionTitle, platform, ownerEmails) => {
  if (!ownerEmails || ownerEmails.length === 0) return;

  const formattedDate = new Date(automation.scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const sourceLabel = automation.scheduleSource === "AI" ? "AI Recommendation" : "Custom User Selection";

  const mailOptions = {
    from: `"ReelOps Automations" <${process.env.GMAIL_USER}>`,
    to: ownerEmails.join(', '), // Send to all owners
    subject: `ReelOps Schedule Created: ${submissionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-4 border rounded-lg bg-gray-50">
        <h2 style="color: #4F46E5;">Schedule Created Successfully</h2>
        <p>A new automation has been scheduled for your channel.</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1F2937;">${submissionTitle}</h3>
          
          <table style="width: 100%; margin-top: 15px;">
            <tr>
              <td style="color: #6B7280; padding-bottom: 8px; width: 120px;">Platform:</td>
              <td style="font-weight: bold; padding-bottom: 8px;">${platform}</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding-bottom: 8px;">Scheduled Time:</td>
              <td style="font-weight: bold; padding-bottom: 8px;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="color: #6B7280;">Source:</td>
              <td style="font-weight: bold;">${sourceLabel}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #6B7280; font-size: 0.9em; margin-top: 30px;">
          This video will be automatically published at the scheduled time. You can view or cancel this automation from your ReelOps dashboard.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Schedule notification email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("🔥 Error sending schedule email:", error);
    throw error;
  }
};

/**
 * Send an email notification when an automation succeeds (video published).
 *
 * @param {object} params
 * @param {string} params.submissionTitle
 * @param {string} params.platform
 * @param {Date}   params.publishedAt
 * @param {string} params.youtubeUrl
 * @param {string[]} params.ownerEmails
 */
export const sendAutomationSuccessEmail = async ({
  submissionTitle,
  platform,
  publishedAt,
  youtubeUrl,
  ownerEmails,
}) => {
  if (!ownerEmails || ownerEmails.length === 0) return;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

  const mailOptions = {
    from: `"ReelOps Automations" <${process.env.SMTP_USER || "noreply@reelops.com"}>`,
    to: ownerEmails.join(", "),
    subject: `✅ Published Successfully: ${submissionTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #10B981; margin-top: 0;">Video Published</h2>
        <p>Your automation has successfully published a video.</p>

        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1F2937;">${submissionTitle}</h3>

          <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
            <tr>
              <td style="color: #6B7280; padding-bottom: 10px; width: 140px;">Platform:</td>
              <td style="font-weight: bold; padding-bottom: 10px;">${platform}</td>
            </tr>
            <tr>
              <td style="color: #6B7280; padding-bottom: 10px;">Published Time:</td>
              <td style="font-weight: bold; padding-bottom: 10px;">${formatDate(publishedAt)}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${youtubeUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View on YouTube</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from ReelOps.</p>
      </div>
    `,
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`📧 Automation success email sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error sending automation success email:", error);
  }
};

/**
 * Send an email notification when an automation fails.
 *
 * @param {object} params
 * @param {string} params.submissionTitle
 * @param {string} params.automationId
 * @param {string} params.failureReason
 * @param {string[]} params.ownerEmails
 */
export const sendAutomationFailureEmail = async ({
  submissionTitle,
  automationId,
  failureReason,
  ownerEmails,
}) => {
  if (!ownerEmails || ownerEmails.length === 0) return;

  const mailOptions = {
    from: `"ReelOps Automations" <${process.env.SMTP_USER || "noreply@reelops.com"}>`,
    to: ownerEmails.join(", "),
    subject: `❌ Automation Failed: ${submissionTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #EF4444; margin-top: 0;">Automation Failed</h2>
        <p>An automation failed to publish a video.</p>

        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
          <h3 style="margin-top: 0; color: #991b1b;">${submissionTitle}</h3>

          <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
            <tr>
              <td style="color: #b91c1c; padding-bottom: 10px; width: 140px;">Automation ID:</td>
              <td style="font-weight: bold; color: #7f1d1d; padding-bottom: 10px;">${automationId}</td>
            </tr>
            <tr>
              <td style="color: #b91c1c; padding-bottom: 10px;">Reason:</td>
              <td style="font-weight: bold; color: #7f1d1d; padding-bottom: 10px;">${failureReason}</td>
            </tr>
          </table>
        </div>

        <p style="color: #6B7280; font-size: 14px;">Please check your dashboard for details and try again.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from ReelOps.</p>
      </div>
    `,
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`📧 Automation failure email sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error sending automation failure email:", error);
  }
};

/**
 * Send an email notification when an OAuth connection is revoked.
 * Includes spam protection to prevent sending duplicate emails rapidly.
 * 
 * @param {import("mongoose").Document} channelPlatform - The ChannelPlatform document
 * @param {string[]} ownerEmails - Array of owner email addresses
 */
export const sendOAuthRevokedEmail = async (channelPlatform, ownerEmails) => {
  if (!ownerEmails || ownerEmails.length === 0) return;

  // Spam protection: Don't send if an email was sent in the last 24 hours
  if (channelPlatform.lastRevokedNotificationSentAt) {
    const hoursSinceLastEmail = (new Date() - channelPlatform.lastRevokedNotificationSentAt) / (1000 * 60 * 60);
    if (hoursSinceLastEmail < 24) {
      console.log(`⚠️ Skipping revoked notification email for ${channelPlatform._id} (sent ${hoursSinceLastEmail.toFixed(1)} hours ago)`);
      return;
    }
  }

  const platformName = channelPlatform.platform === "YOUTUBE" ? "YouTube" : channelPlatform.platform;
  const channelName = channelPlatform.youtubeChannelName || "Your Channel";
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const mailOptions = {
    from: `"ReelOps Alerts" <${process.env.SMTP_USER || "noreply@reelops.com"}>`,
    to: ownerEmails.join(", "),
    subject: `${platformName} Connection Requires Reauthentication`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
        <h2 style="color: #ef4444; margin-top: 0;">Connection Revoked</h2>
        <p>Hello,</p>
        <p>Your connected <strong>${platformName}</strong> account for the channel <strong>${channelName}</strong> is no longer authorized.</p>
        <p>This happens if ReelOps access was removed from your Google Account settings, or if the connection expired.</p>
        <p><strong>Future automated uploads cannot be executed until the account is reconnected.</strong></p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clientUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reconnect ${platformName}</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">Please reconnect the account from: <strong>Channel Settings → Platforms</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated security alert from ReelOps.</p>
      </div>
    `,
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`📧 OAuth Revoked email sent: ${info.messageId}`);
    
    if (info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Preview URL: ${previewUrl}`);
      }
    }

    // Update the timestamp after successful send
    channelPlatform.lastRevokedNotificationSentAt = new Date();
    await channelPlatform.save();

  } catch (error) {
    console.error("❌ Error sending OAuth revoked email:", error);
  }
};

