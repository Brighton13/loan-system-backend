// jobs/loanReminder.job.ts
import cron from 'node-cron';
import { handleOverdueLoans, sendDueDateReminders } from './automated_job/due_loan_reminders';

// Schedule to run daily at 9 AM
export function startLoanReminderJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running automated jobs...');
    await handleOverdueLoans();
    await sendDueDateReminders();
  });
}

