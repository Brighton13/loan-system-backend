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
        ${imagePath ? '<img src="cid:unique-image-id" alt="ZICTA Logo" style="height: 60px;">' : '<h1 style="color: #2c3e50; margin: 0;">ZICTA Portal</h1>'}
      </div>

      <!-- Main Content -->
      <div style="padding: 25px 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2>
        
        <p>Dear User,</p>
        
        <p>We received a request to reset your password for the <strong>ZICTA Portal</strong>.</p>
        
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
          <a href="${process.env.FRONTEND_URL}/reset-password" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            Reset Password Now
          </a>
        </div>

        <p>To reset your password, click the button above or visit our <a href="${process.env.FRONTEND_URL}/reset-password" style="color: #3498db;">password reset page</a> and enter this token.</p>
        
        <h3 style="margin-bottom: 10px; color: #2c3e50; font-size: 16px;">🔐 Password Best Practices</h3>
        <ol style="margin-top: 0; padding-left: 20px;">
          <li style="margin-bottom: 5px;">Create a strong, unique password (8+ characters)</li>
          <li style="margin-bottom: 5px;">Include uppercase, lowercase, numbers, and symbols</li>
          <li>Regularly update your password</li>
        </ol>

        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;">
            <strong>Need Help?</strong> Contact our support team at 
            <a href="mailto:support@zicta.zm" style="color: #3498db;">support@zicta.zm</a>
            or call +260 211 378200
          </p>
        </div>
        
        <p style="margin-top: 30px;">Sincerely,</p>
        <p><strong>ZICTA Security Team</strong></p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
        <div style="margin-bottom: 15px;">
          <a href="https://www.zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🌐 Website</a>
          <a href="mailto:support@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">💬 Technical Support</a>
          <a href="mailto:security@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">🔒 Security Team</a>
        </div>
        <p style="margin: 5px 0;">📍 Plot 4909, Corner of Independence Avenue & United Nations Road</p>
        <p style="margin: 5px 0;">📮 P.O. Box 36871, Lusaka, Zambia</p>
        <p style="margin: 5px 0;">📞 Tel: +260 211 378200 / 244424-27</p>
        <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} Quickcash. All rights reserved.</p>
      </div>
    </div>
  `;

  // Create attachments array only if imagePath is provided
  const attachments: EmailAttachment[] | undefined = imagePath ? [
    {
      filename: 'zicta-logo.webp',
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


// export async function sendNewAdminCredentials(
//   to: string,
//   username: string,
//   password: string,
//   mno_name: string,
//   imagePath: string
// ): Promise<boolean> {
//   const subject = `ZICTA Portal Access Credentials for ${mno_name}`;

//   // Text version
//   const text = `Dear ${mno_name} Administrator,\n\n`
//     + `Your administrative access to the ZICTA Tariff Comparator Portal has been successfully configured.\n\n`
//     + `Login Credentials:\n`
//     + `Username: ${username}\n`
//     + `Password: ${password}\n\n`
//     + `Security Instructions:\n`
//     + `1. Please change your password immediately after first login\n`
//     + `2. Keep these credentials confidential\n`
//     + `3. Do not share your login details with unauthorized personnel\n\n`
//     + `Access the portal at: [Portal URL]\n\n`
//     + `Should you require any assistance, please contact our support team at support@zicta.zm.\n\n`
//     + `Sincerely,\n`
//     + `ZICTA Regulatory Compliance Team`;

//   // HTML version
//   const html = `
//     <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
//       <!-- Header -->
//       <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
//         <img src="cid:unique-image-id" alt="ZICTA Logo" style="height: 60px;">
//       </div>

//       <!-- Main Content -->
//       <div style="padding: 25px 20px;">
//         <h2 style="color: #2c3e50; margin-top: 0;">Portal Access Credentials</h2>
        
//         <p>Dear ${mno_name} Administrator,</p>
        
//         <p>Your administrative access to the <strong>ZICTA Tariff Comparator Portal</strong> has been successfully configured.</p>
        
//         <div style="background-color: #f8f9fa; border: 1px solid #e1e1e1; border-radius: 5px; padding: 15px; margin: 20px 0;">
//   <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px;">Login Credentials</h3>
//   <table style="width: 100%; border-collapse: collapse;">
//     <tr>
//       <td style="padding: 8px 0; width: 100px; font-weight: 600;">Username:</td>
//       <td style="padding: 8px 0;"><code style="background: #f1f1f1; padding: 2px 5px; border-radius: 3px;">${username}</code></td>
//     </tr>
//     <tr>
//       <td style="padding: 8px 0; font-weight: 600;">Password:</td>
//       <td style="padding: 8px 0;"><code style="background: #f1f1f1; padding: 2px 5px; border-radius: 3px;">${password}</code></td>
//     </tr>
//     <tr>
//       <td colspan="2" style="text-align: center; padding-top: 15px;">
//         <div style="display: inline-block;">
//           <a href="${url}/auth/provider_login" style="display: block; background-color: #1a2073; color: #ffffff; text-decoration: none; padding: 8px 15px; border-radius: 3px; text-align: center; width: 100%;">
//             Click here to access the portal
//           </a>
//         </div>
//       </td>
//     </tr>
//   </table>
// </div>

//         <h3 style="margin-bottom: 10px; color: #2c3e50; font-size: 16px;">Security Instructions</h3>
//         <ol style="margin-top: 0; padding-left: 20px;">
//           <li style="margin-bottom: 8px;">Change your password immediately after first login</li>
//           <li style="margin-bottom: 8px;">Keep these credentials confidential</li>
//           <li style="margin-bottom: 8px;">Do not share your login details with unauthorized personnel</li>
//         </ol>
        
//         <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0;">
//           <p style="margin: 0; font-weight: 600; color: #ff8f00;">Important:</p>
//           <p style="margin: 5px 0 0;">For security reasons, password must be updated regulary.</p>
//         </div>

//         <p>Should you require any assistance, please contact our support team at <a href="mailto:support@zicta.zm" style="color: #3498db;">support@zicta.zm</a>.</p>
        
//         <p style="margin-top: 30px;">Sincerely,</p>
//         <p><strong>ZICTA Regulatory Compliance Team</strong></p>
//       </div>

//       <!-- Footer -->
//       <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
//         <div style="margin-bottom: 15px;">
//           <a href="https://www.zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Website</a>
//           <a href="mailto:support@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Technical Support</a>
//           <a href="mailto:regulatory@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Regulatory Inquiries</a>
//         </div>
//         <p style="margin: 5px 0;">Plot 4909, Corner of Independence Avenue & United Nations Road</p>
//         <p style="margin: 5px 0;">P.O. Box 36871, Lusaka, Zambia</p>
//         <p style="margin: 5px 0;">Tel: +260 211 378200 / 244424-27</p>
//         <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} ZICTA. All rights reserved.</p>
//       </div>
//     </div>
//   `;

//   const attachments = [
//     {
//       filename: 'zicta-image.webp',
//       path: imagePath,
//       cid: 'unique-image-id',
//     },
//   ];

//   return sendEmail(to, subject, text, html, attachments);
// }

// export async function sendPlanApprovalEmail(
//   to: string,
//   plan: string,
//   approvedAt: string,
//   approvalReason?: string,
//   imagePath?: string
// ): Promise<boolean> {
//   const approvalDate = new Date(approvedAt).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   const subject = `Plan Approval Confirmation: ${plan}`;

//   // Base text version
//   let text = `Dear Service Provider,\n\n`;
//   text += `We are pleased to inform you that your plan "${plan}" has been approved on ${approvalDate}.\n\n`;
//   if (approvalReason) {
//     text += `Approval Note: ${approvalReason}\n\n`;
//   }
//   text += `You can now manage this plan's availability in the Approved Products section of the ZICTA portal.\n\n`;
//   text += `Should you require any assistance, please don't hesitate to contact our support team.\n\n`;
//   text += `Sincerely,\nZICTA Regulatory Team`;

//   let html: string | undefined;
//   let attachments: nodemailer.Attachment[] | undefined;

//   if (imagePath) {
//     html = `
//       <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
//         <!-- Header -->
//         <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
//           <img src="cid:unique-image-id" alt="ZICTA Logo" style="height: 60px;">
//         </div>

//         <!-- Main Content -->
//         <div style="padding: 25px 20px;">
//           <h2 style="color: #28a745; margin-top: 0;">Plan Approval Confirmation</h2>
          
//           <p>Dear Service Provider,</p>
          
//           <p>We are pleased to inform you that your plan <strong>"${plan}"</strong> has been approved on ${approvalDate}.</p>
          
//           ${approvalReason ? `
//           <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 12px 15px; margin: 15px 0;">
//             <h4 style="margin-top: 0; color: #28a745;">Approval Note:</h4>
//             <p style="margin-bottom: 0;">${approvalReason}</p>
//           </div>
//           ` : ''}
          
//           <p>You may now manage this plan's availability through the Approved Products section of the ZICTA portal.</p>
          
//           <p>For any questions regarding your approved plan, please contact our regulatory support team.</p>
          
//           <p style="margin-top: 30px;">Sincerely,</p>
//           <p><strong>Zambia Information and Communications Technology Authority</strong></p>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
//           <div style="margin-bottom: 15px;">
//             <a href="https://www.zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Website</a>
//             <a href="mailto:regulatory@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Regulatory Support</a>
//             <a href="mailto:info@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">General Inquiries</a>
//           </div>
//           <p style="margin: 5px 0;">Plot 4909, Corner of Independence Avenue & United Nations Road</p>
//           <p style="margin: 5px 0;">P.O. Box 36871, Lusaka, Zambia</p>
//           <p style="margin: 5px 0;">Tel: +260 211 378200 / 244424-27</p>
//           <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} ZICTA. All rights reserved.</p>
//         </div>
//       </div>
//     `;

//     attachments = [
//       {
//         filename: 'zicta-image.webp',
//         path: imagePath,
//         cid: 'unique-image-id',
//       },
//     ];
//   }

//   return sendEmail(to, subject, text, html, attachments);
// }


// export async function sendPlanRejectionEmail(
//   to: string,
//   plan: string,
//   rejectedAt: string,
//   reason?: string,
//   imagePath?: string
// ): Promise<boolean> {
//   const rejectionDate = new Date(rejectedAt).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   const subject = `Plan Rejection Notification: ${plan}`;

//   // Base text version
//   let text = `Dear Service Provider,\n\n`;
//   text += `We regret to inform you that your plan "${plan}" has been rejected on ${rejectionDate}.\n\n`;
//   if (reason) {
//     text += `Reason for rejection: ${reason}\n\n`;
//   }
//   text += `Please review the requirements and resubmit your application through the ZICTA portal.\n\n`;
//   text += `For any queries, please contact our support team.\n\n`;
//   text += `Sincerely,\nZICTA Team`;

//   let html: string | undefined;
//   let attachments: nodemailer.Attachment[] | undefined;

//   if (imagePath) {
//     html = `
//       <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
//         <!-- Header -->
//         <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
//           <img src="cid:unique-image-id" alt="ZICTA Logo" style="height: 60px;">
//         </div>

//         <!-- Main Content -->
//         <div style="padding: 25px 20px;">
//           <h2 style="color: #d9534f; margin-top: 0;">Plan Rejection Notification</h2>
          
//           <p>Dear Service Provider,</p>
          
//           <p>We regret to inform you that your plan <strong>"${plan}"</strong> has been rejected on ${rejectionDate}.</p>
          
//           ${reason ? `
//           <div style="background-color: #f8f9fa; border-left: 4px solid #d9534f; padding: 12px 15px; margin: 15px 0;">
//             <h4 style="margin-top: 0; color: #d9534f;">Reason for Rejection:</h4>
//             <p style="margin-bottom: 0;">${reason}</p>
//           </div>
//           ` : ''}
          
//           <p>Please review the regulatory requirements and resubmit your application through the ZICTA portal.</p>
          
//           <p>Should you require any clarification or assistance, please don't hesitate to contact our support team.</p>
          
//           <p style="margin-top: 30px;">Sincerely,</p>
//           <p><strong>Zambia Information and Communications Technology Authority</strong></p>
//         </div>

//         <!-- Footer -->
//         <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
//           <div style="margin-bottom: 15px;">
//             <a href="https://www.zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Website</a>
//             <a href="mailto:info@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Contact Us</a>
//           </div>
//           <p style="margin: 5px 0;">Plot 4909, Corner of Independence Avenue & United Nations Road</p>
//           <p style="margin: 5px 0;">P.O. Box 36871, Lusaka, Zambia</p>
//           <p style="margin: 5px 0;">Tel: +260 211 378200 / 244424-27</p>
//           <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} ZICTA. All rights reserved.</p>
//         </div>
//       </div>
//     `;

//     attachments = [
//       {
//         filename: 'zicta-image.webp',
//         path: imagePath,
//         cid: 'unique-image-id',
//       },
//     ];
//   }

//   return sendEmail(to, subject, text, html, attachments);
// }

// export async function sendAdminInitiatedPasswordReset(
//   to: string,
//   newPassword: string,
//   imagePath?: string
// ): Promise<boolean> {
//   const subject = 'ZICTA Portal: Password Reset by Administrator';
  
//   // Text version
//   const text = `Dear User,\n\n`
//     + `Your password for the ZICTA Portal has been reset by a ZICTA administrator.\n\n`
//     + `Your new password is: ${newPassword}\n\n`
//     + `Important Security Information:\n`
//     + `• Please change your password immediately after logging in\n`
//     + `• Keep your password confidential\n`
//     + `• Do not share your login details with unauthorized personnel\n\n`
//     + `If you need assistance, contact our support team at support@zicta.zm.\n\n`
//     + `Sincerely,\n`
//     + `ZICTA Security Team`;

//   // HTML version
//   const html = `
//     <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
//       <!-- Header -->
//       <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea;">
//         <img src="cid:unique-image-id" alt="ZICTA Logo" style="height: 60px;">
//       </div>

//       <!-- Main Content -->
//       <div style="padding: 25px 20px;">
//         <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Notification</h2>
        
//         <p>Dear User,</p>
        
//         <p>Your password for the <strong>ZICTA Portal</strong> has been reset by a ZICTA administrator.</p>
        
//         <div style="background-color: #f8f9fa; border: 1px solid #e1e1e1; border-radius: 5px; padding: 15px; margin: 20px 0;">
//           <h3 style="margin-top: 0; color: #2c3e50; font-size: 16px;">Your New Password</h3>
//           <div style="font-size: 18px; font-weight: bold; letter-spacing: 1px; margin: 10px 0; padding: 10px; background-color: #f1f1f1; border-radius: 4px; display: inline-block;">
//             ${newPassword}
//           </div>
//         </div>

//         <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0;">
//           <h3 style="margin-top: 0; margin-bottom: 10px; color: #ff8f00;">Important Security Instructions</h3>
//           <ul style="margin-top: 0; padding-left: 20px;">
//             <li style="margin-bottom: 5px;">Change your password immediately after logging in</li>
//             <li style="margin-bottom: 5px;">Keep your password confidential</li>
//             <li>Do not share your login details with unauthorized personnel</li>
//           </ul>
//         </div>

//         <p>If you need assistance, contact our support team at <a href="mailto:support@zicta.zm" style="color: #3498db;">support@zicta.zm</a>.</p>
        
//         <p style="margin-top: 30px;">Sincerely,</p>
//         <p><strong>ZICTA Security Team</strong></p>
//       </div>

//       <!-- Footer -->
//       <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eaeaea;">
//         <div style="margin-bottom: 15px;">
//           <a href="https://www.zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Website</a>
//           <a href="mailto:support@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Technical Support</a>
//           <a href="mailto:security@zicta.zm" style="color: #337ab7; text-decoration: none; margin: 0 10px;">Security Team</a>
//         </div>
//         <p style="margin: 5px 0;">Plot 4909, Corner of Independence Avenue & United Nations Road</p>
//         <p style="margin: 5px 0;">P.O. Box 36871, Lusaka, Zambia</p>
//         <p style="margin: 5px 0;">Tel: +260 211 378200 / 244424-27</p>
//         <p style="margin: 10px 0 0; font-size: 12px;">© ${new Date().getFullYear()} ZICTA. All rights reserved.</p>
//       </div>
//     </div>
//   `;

//   const attachments = imagePath ? [
//     {
//       filename: 'zicta-image.webp',
//       path: imagePath,
//       cid: 'unique-image-id',
//     },
//   ] : undefined;

//   return sendEmail(to, subject, text, html, attachments);
// }