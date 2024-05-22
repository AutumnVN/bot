import { client } from '../Client';
import { CHECK_INTERVAL } from '../constants';
import { prisma } from '../Prisma';
import { scheduleReminder } from '../utils';

client.once('ready', async () => {
    await (async function reminder() {
        await prisma.reminder.deleteMany({ where: { time: { lte: Date.now() } } });

        const reminders = await prisma.reminder.findMany({ where: { time: { lte: Date.now() + CHECK_INTERVAL } } });
        reminders.forEach(scheduleReminder);

        setTimeout(reminder, CHECK_INTERVAL);
    })();
});
