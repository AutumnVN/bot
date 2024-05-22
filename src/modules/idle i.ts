
import { Message } from 'oceanic.js';

import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { itemList, reply } from '../utils';

client.on('messageCreate', idleI);
client.on('messageUpdate', idleI);

async function idleI(message: Message) {
    if (message.timestamp.getTime() < Date.now() - 120000) return;
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — inventory')) return;

    const packingField = message.embeds[0].fields?.find(field => field.name === '')?.value;
    if (!packingField) return;

    const invItems = packingField.match(/(?<=\*\*).+?(?=\*\*:)/g);
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
        await reply(message, itemList(idleItems));
    } catch (error) {
        if (!(error instanceof Error)) return;
        await reply(message, error.message);
    }
}
