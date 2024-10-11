import { IdleItem, Reminder } from '@prisma/client';
import { exec } from 'child_process';
import { CreateMessageOptions, Message } from 'oceanic.js';
import { promisify } from 'util';

import { client } from './Client';
import { prisma } from './Prisma';

export function codeBlock(content: string, lang = '') {
    if (content === '') content = ' ';

    if (lang === 'ansi') content = removeUselessFormat(content);

    return `\`\`\`${lang}\n${content.replace(/`{3}/g, '\u200b`\u200b`\u200b`\u200b')}\`\`\``;
}

function uploadAsFileIfTooLong(options: CreateMessageOptions) {
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

function ansiFormat(modifier: string) {
    return (content: string) => `\u001b[${modifier}m${content}\u001b[0m`;
}

export const bold = ansiFormat('1');
export const underline = ansiFormat('4');
export const gray = ansiFormat('30');
export const red = ansiFormat('31');
export const green = ansiFormat('32');
export const gold = ansiFormat('33');
export const blue = ansiFormat('34');
export const pink = ansiFormat('35');
export const teal = ansiFormat('36');
export const white = ansiFormat('37');

function removeUselessFormat(content: string) {
    return content.replace(/\u001b\[0m(?=\s*\u001b\[\d{1,2}m|$)/g, '')
        .replace(/(?<=\u001b\[1m.*)\u001b\[1m/g, '')
        .replace(/(?<=\u001b\[4m.*)\u001b\[4m/g, '')
        .replace(/(?<=\u001b\[30m.*)\u001b\[30m/g, '')
        .replace(/(?<=\u001b\[31m.*)\u001b\[31m/g, '')
        .replace(/(?<=\u001b\[32m.*)\u001b\[32m/g, '')
        .replace(/(?<=\u001b\[33m.*)\u001b\[33m/g, '')
        .replace(/(?<=\u001b\[34m.*)\u001b\[34m/g, '')
        .replace(/(?<=\u001b\[35m.*)\u001b\[35m/g, '')
        .replace(/(?<=\u001b\[36m.*)\u001b\[36m/g, '')
        .replace(/(?<=\u001b\[37m.*)\u001b\[37m/g, '');
}

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

export function itemList(items: IdleItem[]) {
    const [longestName, longestPrice, longestPercent] = items.reduce((acc, item) => {
        if (item.price === null || item.percent === null) throw new Error(`${item.name} has no price or percent`);
        const name = item.name.length;
        const price = numberFormat(item.price).length;
        const plus = item.percent > 0 ? '+' : '';
        const percent = (plus + percentFormat(item.percent / 100)).length;

        acc[0] = Math.max(acc[0], name);
        acc[1] = Math.max(acc[1], price);
        acc[2] = Math.max(acc[2], percent);

        return acc;
    }, [0, 0, 0]);

    const content = items.map(item => {
        if (item.price === null || item.percent === null) throw new Error(`${item.name} has no price or percent`);
        const paddedName = item.name.padEnd(longestName, ' ');
        const paddedPrice = numberFormat(item.price).padStart(longestPrice, ' ');
        const plus = item.percent > 0 ? '+' : '';
        const paddedPercent = (plus + percentFormat(item.percent / 100)).padStart(longestPercent, ' ');
        let extremaInLastXDays = '    ';
        if (item.percentHistory.length > 0) {
            const reversedPercentHistory = item.percentHistory.reverse();
            const uniquePercent = reversedPercentHistory.find(percent => percent !== item.percent);
            if (uniquePercent) {
                const isPeak = item.percent > uniquePercent;
                const nextExtremaPercent = reversedPercentHistory.find(percent => item.percent && (isPeak ? percent > item.percent : percent < item.percent));
                const days = nextExtremaPercent ? reversedPercentHistory.indexOf(nextExtremaPercent) + 1 : reversedPercentHistory.length;
                const paddedDays = days.toString().padStart(2, ' ');
                extremaInLastXDays = isPeak ? green(`↑${paddedDays}d`) : red(`↓${paddedDays}d`);
            }
        }

        return `${bold(blue(paddedName))}  ${paddedPrice}  ${colorPrice(item.percent, paddedPercent)}  ${extremaInLastXDays}  ${item.note ?? ''}`.trim();
    }).join('\n');

    return codeBlock(content, 'ansi');
}

function colorPrice(percent: number, paddedPercent: string) {
    if (percent > 0) return green(paddedPercent);
    if (percent < 0) return red(paddedPercent);
    return gray(paddedPercent);
}

export function packingProfit(item: IdleItem, tax: number, multiplier: number) {
    if (!item.pack || !item.price) throw new Error(`${item.name} has no pack or price`);
    return Math.round(item.pack * multiplier * (1 - tax) - item.price * 100);
}

export function logError(error: unknown) {
    console.error(error);

    const { ERROR_LOG_CHANNEL_ID } = process.env;
    if (!ERROR_LOG_CHANNEL_ID || !(error instanceof Error)) return;

    send(ERROR_LOG_CHANNEL_ID, codeBlock(error.stack || error.message));
}
