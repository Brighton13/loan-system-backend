// import nodemailer from 'nodemailer';

// class EmailService {
//     private transporter: nodemailer.Transporter;

//     constructor() {
//         this.transporter = nodemailer.createTransporter({
//             host: process.env.SMTP_HOST,
//             port: parseInt(process.env.SMTP_PORT || '587'),
//             secure: false, // true for 465, false for other ports
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS
//             }
//         });
//     }

//     async sendPasswordResetEmail(email: string, resetToken: string) {
//         const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//         const mailOptions = {
//             from: process.env.FROM_EMAIL,
//             to: email,
//             subject: 'Password Reset Request',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-inline-size: 600px; margin: 0 auto;">
//                     <h2>Password Reset Request</h2>
//                     <p>You requested a password reset for your account.</p>
//                     <p>Click the button below to reset your password:</p>
//                     <a href="${resetLink}" 
//                        style="background-color: #007bff; color: white; padding: 10px 20px; 
//                               text-decoration: none; border-radius: 5px; display: inline-block;">
//                         Reset Password
//                     </a>
//                     <p><strong>This link will expire in 1 hour.</strong></p>
//                     <p>If you didn't request this password reset, please ignore this email.</p>
//                     <p>If the button doesn't work, copy and paste this link into your browser:</p>
//                     <p>${resetLink}</p>
//                 </div>
//             `
//         };

//         try {
//             await this.transporter.sendMail(mailOptions);
//             console.log(`Password reset email sent to ${email}`);
//         } catch (error) {
//             console.error('Error sending email:', error);
//             throw new Error('Failed to send password reset email');
//         }
//     }
// }

// export default new EmailService();

import nodemailer from 'nodemailer';

interface EmailAttachment {
    filename?: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    cid?: string;
    encoding?: string;
    headers?: { [key: string]: string };
    raw?: string | Buffer;
}

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: EmailAttachment[] // Fixed: Use custom interface instead of nodemailer.EmailAttachment
): Promise<boolean> {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email
        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

export async function sendForgotPasswordEmail(
    to: string,
    token: string,
    imagePath?: string
): Promise<boolean> {
    const subject = 'Quickcash Portal: Password Reset Instructions';

    // Text version
    const text = `Dear User,\n\n`
        + `We received a request to reset your password for the Quickcash Portal.\n\n`
        + `Your password reset token is: ${token}\n\n`
        + `Important Security Information:\n`
        + `• This token will expire in 15 minutes\n`
        + `• Do not share this token with anyone\n`
        + `• If you didn't request this, please contact our support team immediately\n\n`
        + `To reset your password, please visit our password reset page and enter this token.\n\n`
        + `For security reasons, we recommend:\n`
        + `1. Creating a strong, unique password\n`
        + `2. Regularly updating your password\n\n`
        + `If you need assistance, contact our support team at bbtechnologies01@gmail.com.\n\n`
        + `Sincerely,\n`
        + `Quickcash Security Team`;

    // HTML version
    const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <!-- Header -->
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
        ${imagePath ? '<img src="cid:unique-image-id" alt="Quickcash Logo" style="height: 60px;">' : '<h1 style="color: #2c3e50; margin: 0;">Quickcash Portal</h1>'}
      </div>

      <!-- Main Content -->
      <div style="padding: 25px 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2>
        
        <p>Dear User,</p>
        
        <p>We received a request to reset your password for the <strong>Quickcash Portal</strong>.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #e1e1e1; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px;">Your Password Reset Token</h3>
          <div style="font-size: 18px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; padding: 10px; background-color: #f1f1f1; border-radius: 4px; display: inline-block; border: 2px dashed #007bff;">
            ${token}
          </div>
          <p style="margin: 5px 0; color: #d9534f; font-size: 14px; font-weight: bold;">⏰ Expires in 15 minutes</p>
        </div>

        <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; margin-bottom: 10px; color: #ff8f00;">🔒 Security Alert</h3>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Do not share this token with anyone</li>
            <li style="margin-bottom: 5px;">If you didn't request this, contact support immediately</li>
            <li>This token will expire after 15 minutes</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Reset Password Now
          </a>
        </div>

        <p>To reset your password, click the button above or visit our <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" style="color: #3498db;">password reset page</a> and enter this token.</p>
        
        <h3 style="margin-bottom: 10px; color: #2c3e50; font-size: 16px;">🔐 Password Best Practices</h3>
        <ol style="margin-top: 0; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Create a strong, unique password (8+ characters)</li>
          <li style="margin-bottom: 5px;">Include uppercase, lowercase, numbers, and symbols</li>
          <li>Regularly update your password</li>
        </ol>

        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Need Help?</strong> Contact our support team at 
            <a href="mailto:bbtechnologies01@gmail.com" style="color: #3498db;">bbtechnologies01@gmail.com</a>
            or call +260973849272
          </p>
        </div>
        
        <p style="margin-top: 30px;">Sincerely,</p>
        <p><strong>QuickCash Security Team</strong></p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
        <div style="margin-bottom: 15px;">
          <a href="https://quickcash.work" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🌐 Website</a>
          <a href="mailto:bbtechnologies01@gmail.com" style="color: #337ab7; text-decoration: none; margin: 0 10px;">💬 Technical Support</a>
          <a href="mailto:bbtechnologies01@gmail.com" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🔒 Security Team</a>
        </div>
        <p style="margin: 5px 0;">📍 Jack Compound Esther Lungu Road</p>
        <p style="margin: 5px 0;">📮 P.O. Box 5323 M/B/E, Lusaka, Zambia</p>
        <p style="margin: 5px 0;">📞 phone: +260973849272</p>
        <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} Quickcash. All rights reserved.</p>
      </div>
    </div>
  `;

    // Create attachments array only if imagePath is provided
    const attachments: EmailAttachment[] | undefined = imagePath ? [
        {
            filename: 'quickcash-logo.webp',
            path: imagePath,
            cid: 'unique-image-id',
            contentType: 'image/webp'
        },
    ] : undefined;

    return sendEmail(to, subject, text, html, attachments);
}

// Additional utility function for sending welcome emails
export async function sendWelcomeEmail(
    to: string,
    firstName: string,
    lastName: string
): Promise<boolean> {
    const subject = 'Welcome to QuickCash Portal!';

    const text = `Dear ${firstName} ${lastName},\n\n`
        + `Welcome to the QuickCash Portal! Your account has been successfully created.\n\n`
        + `You can now access our services and manage your account through the portal.\n\n`
        + `If you have any questions or need assistance, please contact our support team at bbtechnologies01@gmail.com\n\n`
        + `Best regards,\n`
        + `Quickcash Team`;

    const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
        <h1 style="color: #2c3e50; margin: 0;">Quickcash Portal</h1>
      </div>

      <div style="padding: 25px 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">🎉 Welcome to Quickcash Portal!</h2>
        
        <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
        
        <p>Welcome to the Quickcash Portal! Your account has been successfully created and you're ready to get started.</p>
        
        <div style="background-color: #e8f5e8; border: 1px solid #4caf50; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2e7d32;">✅ Account Status: Active</h3>
          <p style="margin-bottom: 0;">You can now access all portal features and services.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #4caf50; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Login to Portal
          </a>
        </div>

        <p>If you have any questions or need assistance, please contact our support team at 
           <a href="mailto:bbtechnologies01@gmail.com" style="color: #3498db;">bbtechnologies01@gmail.com</a>.</p>
        
        <p style="margin-top: 30px;">Best regards,</p>
        <p><strong>Quickcash Team</strong></p>
      </div>

      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
        <p style="margin: 5px 0;">📞 Tel: +260 211 378200 / 244424-27</p>
        <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} Quickcash. All rights reserved.</p>
      </div>
    </div>
  `;

    return sendEmail(to, subject, text, html);
}

// export const sendLoanApplicationEmail = async (loanData: any, userInfo: any) => {
//   try {
//     const mailOptions = {
//       from: EMAIL_USER,
//       to: process.env.ADMIN_MAIL || 'admin@yourcompany.com', // recipient email
//       subject: `New Loan Application - ${loanData.loan_number}`,
//       html: `
//         <h2>New Loan Application Received</h2>
//         <div style="font-family: Arial, sans-serif; line-height: 1.6;">
//           <h3>Application Details:</h3>
//           <p><strong>Loan Number:</strong> ${loanData.loan_number}</p>
//           <p><strong>Applicant:</strong> ${userInfo?.name || 'N/A'} (ID: ${loanData.userId})</p>
//           <p><strong>Amount:</strong> $${loanData.amount.toLocaleString()}</p>
//           <p><strong>Term:</strong> ${loanData.termWeeks} week(s)</p>
//           <p><strong>Interest Rate:</strong> ${(loanData.interestRate * 100).toFixed(1)}%</p>
//           <p><strong>Purpose:</strong> ${loanData.purpose}</p>
//           <p><strong>Status:</strong> ${loanData.status}</p>
//           <p><strong>Applied At:</strong> ${new Date().toLocaleString()}</p>

//           ${loanData.collateralImages && loanData.collateralImages.length > 0 ? 
//             `<p><strong>Collateral Images:</strong> ${loanData.collateralImages.length} file(s) uploaded</p>` : 
//             ''
//           }

//           <hr>
//           <p><em>This is an automated notification from the loan management system.</em></p>
//         </div>
//       `,
//       text: `
//         New Loan Application Received

//         Loan Number: ${loanData.loan_number}
//         Applicant: ${userInfo?.name || 'N/A'} (ID: ${loanData.userId})
//         Amount: $${loanData.amount.toLocaleString()}
//         Term: ${loanData.termWeeks} week(s)
//         Interest Rate: ${(loanData.interestRate * 100).toFixed(1)}%
//         Purpose: ${loanData.purpose}
//         Status: ${loanData.status}
//         Applied At: ${new Date().toLocaleString()}

//         ${loanData.collateralImages && loanData.collateralImages.length > 0 ? 
//           `Collateral Images: ${loanData.collateralImages.length} file(s) uploaded` : 
//           ''
//         }
//       `
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Loan application email sent:', info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('Failed to send loan application email:', error);
//     return { success: false, error };
//   }
// };

export async function sendLoanApplicationEmail(
    loanData: any,
    userInfo: any,
    to: string = process.env.ADMIN_MAIL as any,
    imagePath?: string
): Promise<boolean> {
    const subject = `New Loan Application - ${loanData.loan_number}`;

    // Text version
    const text = `Dear Admin,\n\n`
        + `You have received a new loan application with the following details:\n\n`
        + `Loan Number: ${loanData.loan_number}\n`
        + `Applicant: ${userInfo?.name || userInfo?.firstName + ' ' + userInfo?.lastName || 'N/A'}\n`
        + `Email: ${userInfo?.email || 'N/A'}\n`
        + `Phone: ${userInfo?.phone || 'N/A'}\n`
        + `Amount Requested: ZMW ${loanData.amount?.toLocaleString() || 'N/A'}\n`
        + `Loan Term: ${loanData.termWeeks} week(s)\n`
        + `Interest Rate: ${((loanData.interestRate || 0) * 100).toFixed(1)}%\n`
        + `Purpose: ${loanData.purpose || 'N/A'}\n`
        + `Status: ${loanData.status || 'PENDING'}\n`
        + `Application Date: ${new Date().toLocaleString()}\n`
        + `${loanData.collateralImages && loanData.collateralImages.length > 0 ? `Collateral Images: ${loanData.collateralImages.length} file(s) uploaded\n` : ''}\n`
        + `Important Information:\n`
        + `• Please review this application promptly\n`
        + `• Verify all applicant information before approval\n`
        + `• Check collateral documentation if provided\n\n`
        + `To review this application, please log in to the admin dashboard.\n\n`
        + `Application Review Guidelines:\n`
        + `1. Verify applicant identity and contact information\n`
        + `2. Assess creditworthiness and repayment capacity\n`
        + `3. Evaluate collateral value if applicable\n`
        + `4. Document decision reasoning\n\n`
        + `If you need assistance, contact our technical support team at bbtechnologies01@gmail.com.\n\n`
        + `Sincerely,\n`
        + `Quickcash Loan Management System`;

    // HTML version
    const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      <!-- Header -->
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
        ${imagePath ? '<img src="cid:unique-image-id" alt="Quickcash Logo" style="height: 60px;">' : '<h1 style="color: #2c3e50; margin: 0;">Quickcash Portal</h1>'}
      </div>

      <!-- Main Content -->
      <div style="padding: 25px 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">🏦 New Loan Application Received</h2>
        
        <p>Dear Admin,</p>
        
        <p>A new loan application has been submitted to the <strong>Quickcash Portal</strong> and requires your review.</p>
        
        <!-- Loan Details Card -->
        <div style="background-color: #f8f9fa; border: 1px solid #e1e1e1; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📋 Application Details</h3>
          
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Loan Number:</strong>
              <span style="color: #007bff; font-weight: bold;">${loanData.loan_number}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Amount:</strong>
              <span style="color: #28a745; font-weight: bold; font-size: 16px;">$${loanData.amount?.toLocaleString() || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Term:</strong>
              <span>${loanData.termWeeks} week(s)</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Interest Rate:</strong>
              <span style="color: #ffc107; font-weight: bold;">${((loanData.interestRate || 0) * 100).toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Status:</strong>
              <span style="background-color: #ffc107; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">${loanData.status || 'PENDING'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>Purpose:</strong>
              <span>${loanData.purpose || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <strong>Applied:</strong>
              <span>${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Applicant Information -->
        <div style="background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #17a2b8; padding-bottom: 10px;">👤 Applicant Information</h3>
          
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1ecf1;">
              <strong>Name:</strong>
              <span>${userInfo?.name || userInfo?.firstName + ' ' + userInfo?.lastName || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1ecf1;">
              <strong>Email:</strong>
              <span>${userInfo?.email || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1ecf1;">
              <strong>Phone:</strong>
              <span>${userInfo?.phone || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <strong>User ID:</strong>
              <span>${loanData.userId}</span>
            </div>
          </div>
        </div>

        ${loanData.collateralImages && loanData.collateralImages.length > 0 ? `
        <div style="background-color: #f1f8ff; border: 1px solid #c3d9ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #2c3e50;">📎 Collateral Information</h4>
          <p style="margin: 0;">
            <strong>${loanData.collateralImages.length} collateral image(s)</strong> have been uploaded with this application.
            Please review these files in the admin dashboard.
          </p>
        </div>
        ` : ''}

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; margin-bottom: 10px; color: #856404;">⚠️ Action Required</h3>
          <ul style="margin-top: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">Review application details carefully</li>
            <li style="margin-bottom: 5px;">Verify applicant identity and creditworthiness</li>
            <li style="margin-bottom: 5px;">Assess collateral value if applicable</li>
            <li>Update application status in the system</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL + '/admin'}/loans/${loanData.id}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Review Application
          </a>
        </div>

        <h3 style="margin-bottom: 10px; color: #2c3e50; font-size: 16px;">📋 Review Checklist</h3>
        <ol style="margin-top: 0; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Verify applicant identity and contact information</li>
          <li style="margin-bottom: 5px;">Assess creditworthiness and repayment capacity</li>
          <li style="margin-bottom: 5px;">Evaluate collateral value and documentation</li>
          <li>Document decision reasoning in the system</li>
        </ol>

        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Need Technical Support?</strong> Contact our team at 
            <a href="mailto:bbtechnologies01@gmail.com" style="color: #3498db;">bbtechnologies01@gmail.com</a>
            or call +260973849272
          </p>
        </div>
        
        <p style="margin-top: 30px;">Best regards,</p>
        <p><strong>QuickCash Loan Management System</strong></p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
        <div style="margin-bottom: 15px;">
          <a href="https://quickcash.work" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🌐 Website</a>
          <a href="mailto:bbtechnologies01@gmail.com" style="color: #337ab7; text-decoration: none; margin: 0 10px;">💬 Technical Support</a>
          <a href="${process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL + '/admin'}" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🏦 Admin Dashboard</a>
        </div>
        <p style="margin: 5px 0;">📍 Jack Compound Esther Lungu Road</p>
        <p style="margin: 5px 0;">📮 P.O. Box 5323 M/B/E, Lusaka, Zambia</p>
        <p style="margin: 5px 0;">📞 phone: +260973849272</p>
        <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} Quickcash. All rights reserved.</p>
      </div>
    </div>
  `;

    // Create attachments array only if imagePath is provided
    const attachments: EmailAttachment[] | undefined = imagePath ? [
        {
            filename: 'quickcash-logo.webp',
            path: imagePath,
            cid: 'unique-image-id',
            contentType: 'image/webp'
        },
    ] : undefined;

    return sendEmail(to, subject, text, html, attachments);
}


// Email templates for loan approval and rejection

interface LoanEmailData {
    borrowerName: string;
    borrowerEmail: string;
    loanId: string;
    amount: number;
    interestRate?: number;
    termWeeks?: number;
    totalAmount?: number;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
}


export async function generateApprovalEmail(
    data: LoanEmailData,
): Promise<boolean> {
    const {
        borrowerName,
        borrowerEmail,
        loanId,
        amount,
        interestRate = 0,
        termWeeks = 0,
        totalAmount = 0,
        startDate,
        endDate,
        companyName = 'Quickcash Ltd',
        contactEmail = 'bbtechnologies01@gmail.com',
        contactPhone = '0973849272',
    } = data;

    const formatCurrency = (amount: number) => `ZMW ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const subject = `✅ Loan Approved - Application #${loanId}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .highlight { background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .loan-details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .detail-label { font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .cta-button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Congratulations! Your Loan Has Been Approved</h1>
      </div>
      
      <div class="content">
        <p>Dear ${borrowerName},</p>
        
        <div class="highlight">
          <p><strong>Great news!</strong> Your loan application #${loanId} has been approved and is now active.</p>
        </div>
        
        <div class="loan-details">
          <h3>Loan Details</h3>
          <div class="detail-row">
            <span class="detail-label">Loan Amount:</span>
            <span>${formatCurrency(amount)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Interest Rate:</span>
            <span>${(interestRate * 100).toFixed(2)}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Loan Term:</span>
            <span>${termWeeks} weeks</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Amount Due:</span>
            <span><strong>${formatCurrency(totalAmount)}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span>${startDate ? formatDate(startDate) : 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span>${endDate ? formatDate(endDate) : 'N/A'}</span>
          </div>
        </div>
        
        <h3>What Happens Next?</h3>
        <ul>
          <li>Your loan funds will be disbursed within 1-2 business days</li>
          <li>You'll receive a separate email with repayment instructions</li>
          <li>Your first payment will be due as per the schedule provided</li>
          <li>You can track your loan status in your account dashboard</li>
        </ul>
        
        <p><strong>Important:</strong> Please keep this email for your records. Your loan agreement documents will be sent separately.</p>
        
        <a href="#" class="cta-button">View Loan Details</a>
        
        <p>If you have any questions about your loan or need assistance, please don't hesitate to contact us.</p>
        
        <p>Thank you for choosing ${companyName}!</p>
        
        <p>Best regards,<br>
        The ${companyName} Team</p>
      </div>
      
      <div class="footer">
        <p>Contact us: ${contactEmail} | ${contactPhone}</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

    const text = `
Congratulations! Your Loan Has Been Approved

Dear ${borrowerName},

Great news! Your loan application #${loanId} has been approved and is now active.

LOAN DETAILS:
- Loan Amount: ${formatCurrency(amount)}
- Interest Rate: ${(interestRate * 100).toFixed(2)}%
- Loan Term: ${termWeeks} weeks
- Total Amount Due: ${formatCurrency(totalAmount)}
- Start Date: ${startDate ? formatDate(startDate) : 'N/A'}
- Due Date: ${endDate ? formatDate(endDate) : 'N/A'}

WHAT HAPPENS NEXT:
- Your loan funds will be disbursed within 1-2 business days
- You'll receive a separate email with repayment instructions
- Your first payment will be due as per the schedule provided
- You can track your loan status in your account dashboard

Important: Please keep this email for your records. Your loan agreement documents will be sent separately.

If you have any questions about your loan or need assistance, please contact us at ${contactEmail} or ${contactPhone}.

Thank you for choosing ${companyName}!

Best regards,
The ${companyName} Team
  `;
    return sendEmail(borrowerEmail, subject, text, html);
    //  return { subject, html, text };
    // return { subject, html, text };
};

export const generateRejectionEmail = (data: LoanEmailData): Promise<boolean> => {
    const {
        borrowerName,
        borrowerEmail,
        loanId,
        amount,
        reason = 'Unfortunately, we cannot approve your loan application at this time.',
        companyName = 'Quickcash Ltd',
        contactEmail = 'bbtechnologies01@gmail.com',
        contactPhone = '0973849272',
    } = data;

    const formatCurrency = (amount: number) => `ZMW ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const subject = `Loan Application Update - Application #${loanId}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .application-info { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .reason-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .next-steps { background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .cta-button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Loan Application Decision</h1>
      </div>
      
      <div class="content">
        <p>Dear ${borrowerName},</p>
        
        <p>Thank you for your interest in ${companyName} and for taking the time to submit your loan application.</p>
        
        <div class="application-info">
          <h3>Application Details</h3>
          <p><strong>Application ID:</strong> #${loanId}</p>
          <p><strong>Requested Amount:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Application Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <p>After careful review of your application, we regret to inform you that we are unable to approve your loan request at this time.</p>
        
        <div class="reason-box">
          <h4>Reason for Decision:</h4>
          <p>${reason}</p>
        </div>
        
        <div class="next-steps">
          <h4>What You Can Do Next:</h4>
          <ul>
            <li>You may reapply after addressing the factors that led to this decision</li>
            <li>Consider improving your credit score or income situation</li>
            <li>You may want to apply for a smaller loan amount</li>
            <li>Contact us to discuss alternative lending options</li>
          </ul>
        </div>
        
        <p><strong>This decision does not reflect your worth as a person or borrower.</strong> Many factors are considered in our lending decisions, and circumstances can change over time.</p>
        
        <p>If you have questions about this decision or would like to discuss your options, please don't hesitate to reach out to our customer service team.</p>
        
        <a href="#" class="cta-button">Explore Other Options</a>
        
        <p>We appreciate your interest in ${companyName} and encourage you to consider applying again in the future when your financial situation may have changed.</p>
        
        <p>Best regards,<br>
        The ${companyName} Team</p>
      </div>
      
      <div class="footer">
        <p>Contact us: ${contactEmail} | ${contactPhone}</p>
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>You have the right to receive a copy of your credit report used in this decision. Contact us for details.</p>
      </div>
    </body>
    </html>
  `;

    const text = `
Loan Application Decision

Dear ${borrowerName},

Thank you for your interest in ${companyName} and for taking the time to submit your loan application.

APPLICATION DETAILS:
- Application ID: #${loanId}
- Requested Amount: ${formatCurrency(amount)}
- Application Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

After careful review of your application, we regret to inform you that we are unable to approve your loan request at this time.

REASON FOR DECISION:
${reason}

WHAT YOU CAN DO NEXT:
- You may reapply after addressing the factors that led to this decision
- Consider improving your credit score or income situation
- You may want to apply for a smaller loan amount
- Contact us to discuss alternative lending options

This decision does not reflect your worth as a person or borrower. Many factors are considered in our lending decisions, and circumstances can change over time.

If you have questions about this decision or would like to discuss your options, please contact us at ${contactEmail} or ${contactPhone}.

We appreciate your interest in ${companyName} and encourage you to consider applying again in the future when your financial situation may have changed.

Best regards,
The ${companyName} Team

You have the right to receive a copy of your credit report used in this decision. Contact us for details.
  `;

      return sendEmail(borrowerEmail, subject, text, html);//{ subject, html, text };
};

// Example usage in your approveLoan function:
/*
// Add this after the loan.update() calls:

import { generateApprovalEmail, generateRejectionEmail } from './emailTemplates';
import { sendEmail } from './emailService'; // Your email sending service

// After successful loan update:
if (status === LoanStatus.APPROVED) {
  const emailData = {
    borrowerName: loan.borrowerName, // Assuming you have this field
    borrowerEmail: loan.borrowerEmail, // Assuming you have this field
    loanId: loan.id,
    amount: Number(loan.amount),
    interestRate: Number(loan.interestRate),
    termWeeks: loan.termWeeks,
    totalAmount: Math.round(totalAmount * 100) / 100,
    startDate,
    endDate,
    companyName: 'Your Company Name',
    contactEmail: 'support@yourcompany.com',
    contactPhone: '1-800-123-4567'
  };
  
  const email = generateApprovalEmail(emailData);
  await sendEmail(loan.borrowerEmail, email.subject, email.html, email.text);
} else {
  const emailData = {
    borrowerName: loan.borrowerName,
    borrowerEmail: loan.borrowerEmail,
    loanId: loan.id,
    amount: Number(loan.amount),
    reason: value.reason || 'We cannot approve your loan application at this time.',
    companyName: 'Your Company Name',
    contactEmail: 'support@yourcompany.com',
    contactPhone: '1-800-123-4567'
  };
  
  const email = generateRejectionEmail(emailData);
  await sendEmail(loan.borrowerEmail, email.subject, email.html, email.text);
}
*/