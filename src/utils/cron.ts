import cron from 'node-cron';
import { prisma } from '../config/db';

// Schedule a job to run every day at midnight to delete logs older than 15 days
cron.schedule('0 0 * * *', async () => {
  const fifteenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 15));
  
  try {
    const result = await prisma.apiLog.deleteMany({
      where: {
        createdAt: {
          lt: fifteenDaysAgo,
        },
      },
    });
    console.log(`Deleted ${result.count} old API logs.`);
  } catch (error) {
    console.error('Error deleting old API logs:', error);
  }
});
