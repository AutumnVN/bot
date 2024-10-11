import { Message } from 'oceanic.js';

import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';

client.on('messageCreate', idleMa);
client.on('messageUpdate', idleMa);

async function idleMa(message: Message) {
    if (message.timestamp.getTime() < Date.now() - 120000) return;
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.description?.startsWith('This is the **idle market**')) return;
    if (message.embeds[0].fields?.[0]?.value === 'Raw items of low value') return;

    const { fields } = message.embeds[0];
    if (!fields) return;

    for (const field of fields) {
        const lastUpdate = Date.now();

        if (/ (box|container|ship|spaceship)\*\*/.test(field.name)) {
            const name = field.name.match(/(?<=\*\*).+?(?= (box|container|ship|spaceship)\*\*)/)?.[0];
            if (!name) continue;

            const type = field.name.includes(':box:') ? 'material'
                : field.name.includes(':container:') ? 'refined'
                    : field.name.includes(':ship:') ? 'product'
                        : field.name.includes(':spaceship:') ? 'assembly' : undefined;
            const pack = Number(field.value.match(/(?<=\*\*Price\*\*: )[\d,]+/)?.[0]?.replace(/,/g, ''));

            await prisma.idleItem.upsert({
                where: { name },
                update: { type, pack },
                create: { name, type, pack }
            });
        } else {
            const name = field.name.match(/(?<=\*\*).+?(?=\*\*)/)?.[0];
            if (!name) continue;

            const type = name.endsWith('scythe') ? 'tool' : undefined;
            const note = field.name.match(/⚠️ .+$/)?.[0]?.replace(/\*/g, '') || '';
            const price = Number(field.value.match(/(?<=\*\*Price\*\*: )[\d,]+/)?.[0]?.replace(/,/g, ''));
            const percent = Number(field.value.match(/(?<=`)[+-]?\d+(?=%`)/)?.[0]);

            const today0UTC = new Date().setUTCHours(0, 0, 0, 0);
            const outdated = await prisma.idleItem.findFirst({ where: { name, lastUpdate: { lt: today0UTC } } });
            if (outdated) {
                const { percentHistory } = outdated;
                percentHistory.push(percent);
                if (percentHistory.length > 99) percentHistory.shift();

                await prisma.idleItem.upsert({
                    where: { name },
                    update: { type, price, percent, percentHistory, note, lastUpdate },
                    create: { name, type, price, percent, percentHistory, note, lastUpdate }
                });
            } else {
                await prisma.idleItem.upsert({
                    where: { name },
                    update: { type, price, percent, note, lastUpdate },
                    create: { name, type, price, percent, note, lastUpdate }
                });
            }
        }
    }
}
