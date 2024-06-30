import { IdleItem } from '@prisma/client';

import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { itemList, reply } from '../utils';

defineCommand({
    name: 'pa',
    aliases: ['pack', 'packing'],
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
        const materialProfit = material.map(item => ({ ...item, price: profit(item) })).sort((a, b) => b.price - a.price).slice(0, 3);
        const refinedProfit = refined.map(item => ({ ...item, price: profit(item) })).sort((a, b) => b.price - a.price).slice(0, 3);
        const productProfit = product.map(item => ({ ...item, price: profit(item) })).sort((a, b) => b.price - a.price).slice(0, 3);

        let content = `Tax: **${tax * 100}%**\nMultiplier: **x${multiplier}**\n`;
        content += `\n**Material**\n${itemList(materialProfit)}`;
        content += `**Refined**\n${itemList(refinedProfit)}`;
        content += `**Product**\n${itemList(productProfit)}`;

        await reply(message, content);

        function profit(item: IdleItem) {
            if (!item.pack || !item.price) throw new Error(`${item.name} has no pack or price`);
            return Math.round(item.pack * multiplier * (1 - tax) - item.price * 100);
        }
    }
});
