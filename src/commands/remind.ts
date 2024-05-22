import { Reminder } from '@prisma/client';

import { defineCommand } from '../Command';
import { CHECK_INTERVAL } from '../constants';
import { prisma } from '../Prisma';
import { reply, sanitize, scheduleReminder } from '../utils';

const regex = /(?=.*\d+[wdhms])(\d+w)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?/i;
const timeUnits = [604800000, 86400000, 3600000, 60000, 1000];

defineCommand({
    name: 'remind',
    aliases: ['rm'],
    description: 'Remind you of something',
    usages: ['<time> [message]', 'delete <index>'],
    async run(message, args) {
        if (!args.length) {
            const reminders = await prisma.reminder.findMany({
                where: { userID: message.author.id },
                orderBy: { id: 'asc' }
            });
            if (!reminders.length) return;

            return reply(message, reminderList(reminders));
        }

        const [delArg, indexArg] = args;
        if (['delete', 'del', 'remove', 'rm'].includes(delArg.toLowerCase())) {
            const index = Number(indexArg);
            if (isNaN(index)) return;

            const reminder = await prisma.reminder.findFirst({
                where: { userID: message.author.id },
                orderBy: { id: 'asc' },
                skip: index - 1
            });
            if (!reminder) return message.createReaction('❌');

            await prisma.reminder.delete({ where: { id: reminder.id } });

            return message.createReaction('✅');
        }

        const [timeArg, ...messageArgs] = args;
        if (!regex.test(timeArg)) return;

        const time = parseTime(timeArg);
        const remindMessage = sanitize(messageArgs.join(' '));
        if (time > 31536000000) return message.createReaction('💀');

        const reminder = await prisma.reminder.create({
            data: {
                id: message.id,
                userID: message.author.id,
                channelID: message.channelID,
                time: Date.now() + time,
                message: remindMessage || 'something idk'
            }
        });

        if (time < CHECK_INTERVAL) scheduleReminder(reminder);

        await message.createReaction('✅');
    }
});

function reminderList(reminders: Reminder[]) {
    return reminders.reduce((acc, { channelID, time, message }, index) => {
        return acc + `${index + 1}. ${message} <t:${Math.floor(time / 1000)}:R> <#${channelID}>\n`;
    }, '');
}

function parseTime(time: string) {
    const matches = time.match(regex)?.slice(1);
    if (!matches) return 0;

    return matches.map((match, index) => {
        if (!match) return 0;
        return Number(match.slice(0, -1)) * timeUnits[index];
    }).reduce((acc, cur) => acc + cur);
}
