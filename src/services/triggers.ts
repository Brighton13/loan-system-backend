// jobs/loanReminder.job.ts
import cron from 'node-cron';
import { sendDueDateReminders } from './automated_job/due_loan_reminders';

// Schedule to run daily at 9 AM
export function startLoanReminderJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running loan reminder job...');
    await sendDueDateReminders();
  });
}