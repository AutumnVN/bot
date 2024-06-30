
import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { itemList, reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — inventory')) return;

    const id = message.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0];
    if (!id) return;

    const { fields } = message.embeds[0];
    if (!fields) return;

    const packingField = fields.find(field => field.name === '')?.value;
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

    await reply(message, itemList(idleItems));
});
