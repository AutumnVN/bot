
import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { itemList, reply, send } from '../utils';

defineCommand({
    name: 'ma',
    aliases: ['market'],
    description: 'Check market price for IDLE FARM',
    async run(message, args) {
        if (args.length) return;

        const today0UTC = new Date().setUTCHours(0, 0, 0, 0);

        const outdated = await prisma.idleItem.findMany({
            where: {
                lastUpdate: { lt: today0UTC }
            }
        });
        if (outdated.length) return reply(message, `Outdated item:\n${outdated.map(item => item.name).join(', ')}`);

        const material = await prisma.idleItem.findMany({
            where: { type: 'material' },
            orderBy: { percent: 'desc' }
        });
        const refined = await prisma.idleItem.findMany({
            where: { type: 'refined' },
            orderBy: { percent: 'desc' }
        });
        const product = await prisma.idleItem.findMany({
            where: { type: 'product' },
            orderBy: { percent: 'desc' }
        });
        const tool = await prisma.idleItem.findMany({
            where: { type: 'tool' },
            orderBy: { percent: 'desc' }
        });
        const assembly = await prisma.idleItem.findMany({
            where: { type: 'assembly' },
            orderBy: { percent: 'desc' }
        });

        try {
            const materialContent = itemList(material);
            const refinedContent = itemList(refined);
            const productContent = itemList(product);
            const toolContent = itemList(tool);
            const assemblyContent = itemList(assembly);

            await reply(message, `**Material**\n${materialContent}`);
            await send(message.channelID, `**Refined**\n${refinedContent}`);
            await send(message.channelID, `**Product**\n${productContent}\n**Tool**\n${toolContent}\n**Assembly**\n${assemblyContent}`);
        } catch (error) {
            if (!(error instanceof Error)) return;
            await reply(message, error.message);
        }
    }
});
