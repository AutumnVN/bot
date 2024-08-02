
import { Message } from 'oceanic.js';

import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { itemList, numberFormat, reply } from '../utils';

client.on('messageCreate', idleI);
client.on('messageUpdate', idleI);

async function idleI(message: Message) {
    if (message.timestamp.getTime() < Date.now() - 120000) return;
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — inventory')) return;

    const invField = message.embeds[0].fields?.find(field => field.name === '')?.value;
    if (!invField) return;

    const invItems = invField.match(/(?<=\*\*).+?(?=\*\*:)/g);
    if (!invItems) return;

    const today0UTC = new Date().setUTCHours(0, 0, 0, 0);

    const outdated = await prisma.idleItem.findMany({ where: { lastUpdate: { lt: today0UTC } } });
    if (outdated.length) return reply(message, `Outdated item:\n${outdated.map(item => item.name).join(', ')}`);

    const idleItems = await prisma.idleItem.findMany({
        where: { name: { in: invItems } },
        orderBy: { percent: 'desc' }
    });
    if (!idleItems.length) return;

    try {
        let totalDebt = '';

        if (message.embeds[0].fields?.[0]?.name === '⚠️ Debt items') {
            const invAmounts = invField.match(/(?<=\*\*.+?\*\*: -)[\d,]+/g)?.map(a => Number(a.replace(/,/g, '')));
            if (!invAmounts) return;

            const invDebt = invAmounts.map((amount, i) => {
                const price = idleItems.find(item => item.name === invItems[i])?.price;
                if (!price) throw new Error(`${invItems[i]} has no price`);
                return amount * price;
            });

            totalDebt = `Total debt: ${numberFormat(invDebt.reduce((acc, debt) => acc + debt, 0))}\n`;

            const longestDebt = Math.max(...invDebt.map(debt => numberFormat(debt).length));

            idleItems.forEach(item => {
                const index = invItems.indexOf(item.name);
                item.note = `${numberFormat(invDebt[index]).padStart(longestDebt, ' ')}  ${item.note ?? ''}`;
            });
        }

        await reply(message, totalDebt + itemList(idleItems));
    } catch (error) {
        if (!(error instanceof Error)) return;
        await reply(message, error.message);
    }
}
