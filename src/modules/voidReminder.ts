import { client } from '../Client';
import { CHECK_INTERVAL } from '../constants';
import { prisma } from '../Prisma';
import { send } from '../utils';

const REMIND_INTERVALS = [
    { label: '1 day', value: 86400000 },
    { label: '12 hours', value: 43200000 },
    { label: '6 hours', value: 21600000 },
    { label: '3 hours', value: 10800000 },
    { label: '1 hour', value: 3600000 },
    { label: '30 minutes', value: 1800000 },
    { label: '15 minutes', value: 900000 },
    { label: '5 minutes', value: 300000 },
    { label: '1 minute', value: 60000 },
    { label: '30 seconds', value: 30000 },
    { label: '15 seconds', value: 15000 },
    { label: '5 seconds', value: 5000 },
    { label: '4 seconds', value: 4000 },
    { label: '3 seconds', value: 3000 },
    { label: '2 seconds', value: 2000 },
    { label: '1 second', value: 1000 },
    { label: 'sealed', value: 0 },
];

const voidReminderChannelIds: string[] = [];

export function addVoidReminderChannel(id: string) {
    if (!voidReminderChannelIds.includes(id) && id !== process.env.VOID_CHANNEL_ID) voidReminderChannelIds.push(id);
}

client.once('ready', async () => {
    const { VOID_CHANNEL_ID } = process.env;

    await (async function reminder() {
        for (const { label, value } of REMIND_INTERVALS) {
            const reminders = await prisma.voidReminder.findMany({
                where: {
                    time: {
                        lte: Date.now() + value + CHECK_INTERVAL,
                        gte: Date.now() + value
                    }
                }
            });

            reminders.forEach(reminder => setTimeout(() => {
                const content = label === 'sealed' ? `**Area ${reminder.area}** is **SEALED**!` : `**Area ${reminder.area}** will be sealed in **${label}**!`;
                [VOID_CHANNEL_ID, ...voidReminderChannelIds].forEach(channelId => channelId && send(channelId, content));
                if (label === 'sealed') voidReminderChannelIds.length = 0;
            }, reminder.time - value - Date.now()));
        }

        setTimeout(reminder, CHECK_INTERVAL);
    })();
});
