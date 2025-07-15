import { Request, Response } from 'express';
import { Op } from "sequelize";
import { AuthRequest } from "../../controllers/loanController";
import Loan from "../../models/Loan";
import User from "../../models/User";
import { generateLoanReminderTemplate, sendEmail } from '../email';

// services/loanReminder.service.ts

// export async function sendDueDateReminders() {
//     try {
//         // Calculate date 2 days from now
//         const twoDaysFromNow = new Date();
//         twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

//         // Set time to beginning of the day (00:00:00)
//         const startOfDueDate = new Date(twoDaysFromNow);
//         startOfDueDate.setHours(0, 0, 0, 0);

//         // Set time to end of the day (23:59:59)
//         const endOfDueDate = new Date(twoDaysFromNow);
//         endOfDueDate.setHours(23, 59, 59, 999);

//         // Find loans due in 2 days that haven't been reminded yet
//         const loans = await Loan.findAll({
//             where: {
//                 endDate: {
//                     [Op.between]: [startOfDueDate, endOfDueDate]
//                 },
//                 reminderSent: false, // Assuming you have this field
//                 status: 'active' // Only active loans
//             },
//             include: [{
//                 model: User,
//                 as: 'user',
//                 attributes: ['id', 'email', 'phone', 'firstName', 'lastName']
//             }]
//         });

//         // Send reminders
//         for (const loan of loans) {
//             const user = loan?.user;
//             const template = `
// <!DOCTYPE html>
// <html>
// <head>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { color: #2c3e50; border-bottom: 2px solid #f1c40f; padding-bottom: 10px; }
//         .content { margin: 20px 0; }
//         .footer { font-size: 12px; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 10px; }
//         .button { background-color: #f1c40f; color: #2c3e50; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; }
//         .highlight { font-weight: bold; color: #e74c3c; }
//     </style>
// </head>
// <body>
//     <div class="header">
//         <h2>QuickCash Loan Reminder</h2>
//     </div>
    
//     <div class="content">
//         <p>Dear ${user.firstName} ${user.lastName},</p>
        
//         <p>This is a friendly reminder that your QuickCash loan of <span class="highlight">$${loan.amount}</span> 
//         is due in <span class="highlight">2 days</span> (${new Date(loan.endDate!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).</p>
        
//         <p>To ensure uninterrupted service and avoid any late fees, please make your payment before the due date.</p>
        
//         // <p style="text-align: center;">
//         //     <a href="https://quickcash.example.com/repay" class="button">Make Payment Now</a>
//         // </p>
        
//         <p>If you've already made this payment, please disregard this reminder.</p>
//     </div>
    
//     <div class="footer">
//         <p>© ${new Date().getFullYear()} QuickCash Loan Services. All rights reserved.</p>
//         <p>This is an automated message. Please do not reply directly to this email.</p>
//         <p>QuickCash LLC | 123 Financial Street | Suite 100 | Anytown, ST 12345</p>
//     </div>
// </body>
// </html>
// `;            // Email reminder




//             await sendEmail(
//                 user.email,
//                 'Loan Due Date Reminder',
//                 `${template}`
//                 // 
//             );

//             // SMS reminder (optional)
//             //   if (user.phone) {
//             //     await sendSMS({
//             //       to: user.phone,
//             //       body: `Reminder: Loan due in 2 days. Amount: ${loan.amount}`
//             //     });
//             //   }

//             // Mark as reminded
//             await loan.update({ reminderSent: true });
//         }

//         console.log(`Sent ${loans.length} reminders for loans due`);
//     } catch (error) {
//         console.error('Error sending loan reminders:', error);
//     }
// }

export async function sendDueDateReminders() {
    try {
        // Calculate date 2 days from now
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        // Set time to beginning of the day (00:00:00)
        const startOfDueDate = new Date(twoDaysFromNow);
        startOfDueDate.setHours(0, 0, 0, 0);

        // Set time to end of the day (23:59:59)
        const endOfDueDate = new Date(twoDaysFromNow);
        endOfDueDate.setHours(23, 59, 59, 999);

        // Find loans due in 2 days that haven't been reminded yet
        const loans = await Loan.findAll({
            where: {
                endDate: {
                    [Op.between]: [startOfDueDate, endOfDueDate]
                },
                reminderSent: false,
                status: 'active'
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'phone', 'firstName', 'lastName']
            }]
        });

        // Send reminders
        for (const loan of loans) {
            const user = loan.user;
            if (!user) continue;

            const { subject, html, text } = generateLoanReminderTemplate(user, loan, 2);
            
            await sendEmail(
                user.email,
                subject,
                text,
                html
            );

            // Mark as reminded
            await loan.update({ reminderSent: true });
        }

        console.log(`Sent ${loans.length} reminders for loans due`);
    } catch (error) {
        console.error('Error sending loan reminders:', error);
    }
}
