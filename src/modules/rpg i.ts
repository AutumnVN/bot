import { InventoryCalc } from '../class/InventoryCalc';
import { client } from '../Client';
import { EMOJI, EPICRPG_ID, TRADE_RATE } from '../constants';
import { prisma } from '../Prisma';
import { numberFormat, percentFormat, reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.author?.name?.endsWith(' — inventory')) return;

    const id = message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] !== '0' ? message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] : message.guild?.members?.find(member => member.user.username === message.embeds[0]?.author?.name.split(' — ')[0])?.id;
    if (!id) return;

    const recentUserMessage = await message.channel?.getMessages({ before: message.id, limit: 1, filter: m => (m.author.id === id || m.content.includes(id)) && !!m.content.match(/^rpg i/i) });
    const isPredictTimePotion = recentUserMessage?.[0]?.content.match(/^rpg i.+t$/i);

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            profile: true,
            profession: true
        }
    });
    if (!user || !user.profile || !user.profession) return;

    const maxArea = getMaxArea(user.profile.maxArea);
    const crafterLevel = user.profession.crafter;

    const itemField = message.embeds[0].fields?.[0]?.value;
    if (!itemField) return;

    const normieFish = Number(itemField.match(/(?<=\*\*normie fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const goldenFish = Number(itemField.match(/(?<=\*\*golden fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const epicFish = Number(itemField.match(/(?<=\*\*EPIC fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const woodenLog = Number(itemField.match(/(?<=\*\*wooden log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const epicLog = Number(itemField.match(/(?<=\*\*EPIC log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const superLog = Number(itemField.match(/(?<=\*\*SUPER log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const megaLog = Number(itemField.match(/(?<=\*\*MEGA log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const hyperLog = Number(itemField.match(/(?<=\*\*HYPER log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const ultraLog = Number(itemField.match(/(?<=\*\*ULTRA log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const apple = Number(itemField.match(/(?<=\*\*apple\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const banana = Number(itemField.match(/(?<=\*\*banana\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const ruby = Number(itemField.match(/(?<=\*\*ruby\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    if (!normieFish && !goldenFish && !epicFish && !woodenLog && !epicLog && !superLog && !megaLog && !hyperLog && !ultraLog && !apple && !banana && !ruby) return;

    const inventory = new InventoryCalc({ normieFish, goldenFish, epicFish, woodenLog, epicLog, superLog, megaLog, hyperLog, ultraLog, apple, banana, ruby, crafterLevel });

    let content = `${EMOJI.blank} `;

    if (Number(maxArea) < 10) {
        inventory.tradeTo(maxArea);
        const materials = inventory.total(maxArea);
        content += `**${numberFormat(materials)}** ${EMOJI[TRADE_RATE[maxArea].best]}  ➜  `;
    }

    inventory.tradeToA10(maxArea);
    let a10Log = inventory.total('10');
    content += `**${numberFormat(a10Log)}** ${EMOJI.log}`;

    if (user.profile.timeTravel >= 25) {
        if (!isPredictTimePotion) {
            inventory.timePotion();
            inventory.tradeToA10('3');
            const timePotionLog = inventory.total('10');
            const timePotionProfit = timePotionLog - a10Log;
            const plus = timePotionProfit > 0 ? '+' : '';
            content += `\n${EMOJI.potion_time} **${numberFormat(timePotionLog)}** ${EMOJI.log}`;
            content += ` ${EMOJI.blank} **${plus}${numberFormat(timePotionProfit)}** ${EMOJI.log} (${plus}${percentFormat(timePotionProfit / a10Log)})`;
            content += inventory.logShouldSell > 0 ? ` ⚠️\n${EMOJI.blank} Could sell approximately **${numberFormat(inventory.logShouldSell)}** ${EMOJI.log} at a10+ to avoid a8 banana cap next tt` : '';
            a10Log = timePotionLog;
        } else {
            for (let i = 0; i < 30; i++) {
                inventory.timePotion();
                inventory.tradeToA10('3');
                const timePotionLog = inventory.total('10');
                const timePotionProfit = timePotionLog - a10Log;
                if (timePotionProfit / a10Log < 0.01) break;
                const plus = timePotionProfit > 0 ? '+' : '';
                content += `\n${i + 1}. ${numberFormat(timePotionLog)} log`;
                content += `   ${plus}${numberFormat(timePotionProfit)} log (${plus}${percentFormat(timePotionProfit / a10Log)})`;
                content += inventory.logShouldSell > 0 ? ' ⚠️' : '';
                a10Log = timePotionLog;
            }
        }
    }

    await reply(message, content);
});

function getMaxArea(maxArea: string) {
    const maxAreaNumber = Number(maxArea);
    if (isNaN(maxAreaNumber)) return 'TOP';
    if (maxAreaNumber <= 3) return '3';
    if (maxAreaNumber <= 5) return '5';
    if (maxAreaNumber <= 7) return '7';
    if (maxAreaNumber <= 11) return maxArea;
    if (maxAreaNumber <= 15) return '15';
    return 'TOP';
}


