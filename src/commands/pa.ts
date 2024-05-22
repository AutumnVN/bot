
import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { itemList, packingProfit, reply } from '../utils';

defineCommand({
    name: 'pa',
    description: 'Check packing profit for IDLE FARM',
    usages: ['[tax] [packing level]'],
    async run(message, args) {
        const today0UTC = new Date().setUTCHours(0, 0, 0, 0);

        const outdated = await prisma.idleItem.findMany({
            where: {
                lastUpdate: { lt: today0UTC },
                type: { in: ['material', 'refined', 'product'] }
            }
        });
        if (outdated.length) return reply(message, `Outdated item:\n${outdated.map(item => item.name).join(', ')}`);

        const profile = await prisma.idleProfile.findUnique({ where: { id: message.author.id } });
        const tax = (Number(args[0]) || 10) / 100;
        const multiplier = 1 + (Number(args[1]) || profile?.pack || 0) / 800;
        const material = await prisma.idleItem.findMany({ where: { type: 'material' } });
        const refined = await prisma.idleItem.findMany({ where: { type: 'refined' } });
        const product = await prisma.idleItem.findMany({ where: { type: 'product' } });

        try {
            const materialProfit = material.map(item => ({ ...item, price: packingProfit(item, tax, multiplier) })).sort((a, b) => b.price - a.price).slice(0, 3);
            const refinedProfit = refined.map(item => ({ ...item, price: packingProfit(item, tax, multiplier) })).sort((a, b) => b.price - a.price).slice(0, 3);
            const productProfit = product.map(item => ({ ...item, price: packingProfit(item, tax, multiplier) })).sort((a, b) => b.price - a.price).slice(0, 3);

            let content = `Tax: **${tax * 100}%**\nMultiplier: **x${multiplier}**\n`;
            content += `\n**Material**\n${itemList(materialProfit)}`;
            content += `**Refined**\n${itemList(refinedProfit)}`;
            content += `**Product**\n${itemList(productProfit)}`;

            await reply(message, content);
        } catch (error) {
            if (!(error instanceof Error)) return;
            await reply(message, error.message);
        }
    }
});
