import { IdleItem } from '@prisma/client';

import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { numberFormat, reply } from '../utils';

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
        const materialProfit = material.map(item => ({ name: item.name, profit: profit(item) })).sort((a, b) => b.profit - a.profit);
        const refinedProfit = refined.map(item => ({ name: item.name, profit: profit(item) })).sort((a, b) => b.profit - a.profit);
        const productProfit = product.map(item => ({ name: item.name, profit: profit(item) })).sort((a, b) => b.profit - a.profit);

        let content = `Tax: **${tax * 100}%**\nMultiplier: **x${multiplier}**\n`;
        content += '\n**Material**:\n';

        for (let i = 0; i < 3; i++) {
            const item = materialProfit[i];
            content += `${i + 1}. **${item.name}**: ${numberFormat(item.profit)}\n`;
        }

        content += '\n**Refined**:\n';

        for (let i = 0; i < 3; i++) {
            const item = refinedProfit[i];
            content += `${i + 1}. **${item.name}**: ${numberFormat(item.profit)}\n`;
        }

        content += '\n**Product**:\n';

        for (let i = 0; i < 3; i++) {
            const item = productProfit[i];
            content += `${i + 1}. **${item.name}**: ${numberFormat(item.profit)}\n`;
        }

        await reply(message, content);

        function profit(item: IdleItem) {
            if (!item.pack || !item.price) throw new Error(`${item.name} has no pack or price`);
            return Math.round(item.pack * multiplier * (1 - tax) - item.price * 100);
        }
    }
});
