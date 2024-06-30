import { Reminder } from '@prisma/client';
import { exec } from 'child_process';
import { CreateMessageOptions, Message } from 'oceanic.js';
import { promisify } from 'util';

import { ColorFormatter } from './class/ColorFormatter';
import { client } from './Client';
import { prisma } from './Prisma';

export function codeBlock(content: string, lang = '') {
    if (content === '') content = ' ';

    return `\`\`\`${lang}\n${content.replace(/`{3}/g, '\u200b`\u200b`\u200b`\u200b')}\`\`\``;
}

export function uploadAsFileIfTooLong(options: CreateMessageOptions) {
    if (!options.content) return options;

    if (options.content.length > 2000) {
        const lang = options.content.match(/(?<=^`{3})\w{0,14}(?=\n)/)?.[0];

        if (lang !== undefined && options.content.endsWith('```')) {
            options.content = options.content.slice(3 + lang.length + 1, -3).replace(/\u200b`\u200b`\u200b`\u200b/g, '```');
        }

        options.files ??= [];
        options.files.push({
            name: `message.${lang || 'txt'}`,
            contents: Buffer.from(options.content)
        });
        options.content = '';
    }

    return options;
}

export function reply(message: Message, options: CreateMessageOptions | string) {
    if (typeof options === 'string') options = { content: options };

    const oldReply = message.channel?.messages.toArray().find(m => m.author.id === client.user.id && m.messageReference?.messageID === message.id);
    if (oldReply) return oldReply.edit(uploadAsFileIfTooLong(options));

    options.messageReference = { messageID: message.id };

    return message.channel?.createMessage(uploadAsFileIfTooLong(options));
}

export function send(channelID: string, options: CreateMessageOptions | string) {
    if (typeof options === 'string') options = { content: options };

    return client.rest.channels.createMessage(channelID, uploadAsFileIfTooLong(options));
}

export const color = new ColorFormatter('0');
export const bold = new ColorFormatter('1');
export const underline = new ColorFormatter('4');
export const boldUnderline = new ColorFormatter('14');

const intlNumberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function numberFormat(number: number) {
    return intlNumberFormat.format(number);
}

const intlNumberPercentFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 });

export function percentFormat(number: number) {
    return intlNumberPercentFormat.format(number);
}

export function sanitize(content: string) {
    return content.replace(/[`@*_~]/g, '\\$&');
}

export function scheduleReminder(reminder: Reminder) {
    setTimeout(async () => {
        const isTheReminderStillThere = await prisma.reminder.findFirst({ where: { id: reminder.id } });
        if (!isTheReminderStillThere) return;

        await send(reminder.channelID, `<@${reminder.userID}> Reminder for: **${reminder.message}**`);
        await prisma.reminder.delete({ where: { id: reminder.id } });
    }, reminder.time - Date.now());
}

const promisifiedExec = promisify(exec);

export async function execAsync(command: string) {
    try {
        const { stdout, stderr } = await promisifiedExec(command, { timeout: 30000 });
        return stdout + stderr;
    } catch (error) {
        if (!(error instanceof Error)) return '';
        return error.message;
    }
}
