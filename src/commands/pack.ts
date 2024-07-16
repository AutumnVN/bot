
import { awaitMessages } from 'oceanic-collectors';

import { client } from '../Client';
import { defineCommand } from '../Command';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { numberFormat, packingProfit, reply, send } from '../utils';

defineCommand({
    name: 'pack',
    aliases: ['packing'],
    description: 'Packing helper for IDLE FARM',
    usages: ['<idlon goal> <item>'],
    async run(message, args) {
        const { channel, channelID } = message;
        const idlonGoal = Number(args[0]);
        const itemName = args.slice(1).join(' ').toLowerCase();
        if (!idlonGoal || !itemName) return;

        const item = await prisma.idleItem.findUnique({ where: { name: itemName } });
        const today0UTC = new Date().setUTCHours(0, 0, 0, 0);
        if (!item) return reply(message, `Unknown item: ${itemName}`);
        if (!item.price || !item.lastUpdate) return reply(message, `**${itemName}** has no price or lastUpdate`);
        if (!item.pack) return reply(message, `**${itemName}** is not a packable item`);
        if (item.lastUpdate < today0UTC) return reply(message, `Outdated item: **${itemName}**`);

        const workerTokenType = item.type === 'material' ? 'worker tokens' : item.type === 'refined' ? 'rare worker tokens' : 'epic worker tokens';
        let workerToken = 0;
        let idlon = 0;

        await send(channelID, 'idle i');
        await send(channelID, `show **${workerTokenType}**`);

        const [idleInvMessage] = await awaitMessages(client, channel, {
            filter: m => m.author.id === IDLEFARM_ID
                && !!m.embeds[0]?.author?.name.endsWith(' — inventory')
                && m.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] === message.author.id
                && !!m.embeds[0].fields?.[1]?.value?.includes(`**${workerTokenType}**:`),
            max: 1,
            time: 60000
        });
        if (!idleInvMessage) return;

        workerToken = Number(idleInvMessage.embeds[0].fields?.[1]?.value?.match(new RegExp(`(?<=\\*\\*${workerTokenType}\\*\\*: )[\\d,]+`))?.[0]?.replace(/,/g, ''));
        if (workerToken === 0) return send(channelID, `Out of **${workerTokenType}**`);

        await send(channelID, 'idle p');

        const [idleProfileMessage] = await awaitMessages(client, channel, {
            filter: m => m.author.id === IDLEFARM_ID
                && !!m.embeds[0]?.author?.name.endsWith(' — profile')
                && m.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] === message.author.id,
            max: 1,
            time: 60000
        });
        if (!idleProfileMessage) return;

        const currencyField = idleProfileMessage.embeds[0].fields?.find(field => field.name === 'Currencies')?.value;
        if (!currencyField) return;

        idlon = Number(currencyField.match(/(?<=\*\*Idlons\*\*: )[\d,]+/)?.[0]?.replace(/,/g, ''));
        if (idlon >= idlonGoal) return send(channelID, 'Current idlons are already greater than the goal');

        const packingField = idleProfileMessage.embeds[0].fields?.find(field => field.name === 'Packing')?.value;
        if (!packingField) return;

        const packingLevel = Number(packingField.match(/(?<=Lv )\d+/)?.[0]);
        const multiplier = 1 + packingLevel / 800;
        const profitPerToken = packingProfit(item, 0.1, multiplier);
        if (profitPerToken <= 0) return send(channelID, `Packing **${itemName}** is not profitable`);

        while (idlon < idlonGoal && workerToken > 0) {
            let buyAmount = 0;

            try {
                buyAmount = 100 * Math.min(500000, workerToken, Math.ceil((idlonGoal - idlon) / profitPerToken), Math.floor(idlon / item.price / 100));
            } catch (error) {
                if (!(error instanceof Error)) return;
                return send(channelID, error.message);
            }

            await send(channelID, `idle buy ${item.name} ${buyAmount}`);

            const [idleBuyMessage] = await awaitMessages(client, channel, {
                filter: m => m.author.id === IDLEFARM_ID
                    && m.content.startsWith(`<@${message.author.id}>, ${numberFormat(buyAmount)}`)
                    && m.content.includes(`**${item.name}** successfully bought for`),
                max: 1,
                time: 60000
            });
            if (!idleBuyMessage) return;

            const cost = Number(idleBuyMessage.content.match(/(?<=successfully bought for )[\d,]+/)?.[0]?.replace(/,/g, ''));
            idlon -= cost;

            await send(channelID, `idle pa ${item.name} ${buyAmount / 100}`);

            const [idlePaMessage] = await awaitMessages(client, channel, {
                filter: m => m.author.id === IDLEFARM_ID
                    && m.content.startsWith(`<@${message.author.id}>, ${numberFormat(buyAmount)}`)
                    && m.content.includes(`**${item.name}** successfully converted into`),
                max: 1,
                time: 60000
            });
            if (!idlePaMessage) return;

            const boxName = idlePaMessage.content.match(/(?<=successfully converted into .+? \*\*).+?(?=\*\*!)/)?.[0];
            workerToken -= buyAmount / 100;

            await send(channelID, `idle sell ${boxName} all`);

            const [idleSellMessage] = await awaitMessages(client, channel, {
                filter: m => m.author.id === IDLEFARM_ID
                    && m.content.startsWith(`<@${message.author.id}>`)
                    && m.content.includes(`**${boxName}** successfully sold for`),
                max: 1,
                time: 60000
            });
            if (!idleSellMessage) return;

            const profit = Number(idleSellMessage.content.match(/(?<=successfully sold for )[\d,]+/)?.[0]?.replace(/,/g, ''));
            idlon += profit;

            if (idlon >= idlonGoal) return send(channelID, `Goal reached: **${numberFormat(idlon)}** idlons`);
            if (workerToken === 0) return send(channelID, `Out of **${workerTokenType}**`);
        }
    }
});
