import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { prisma } from '../Prisma';
import { blue, bold, codeBlock, reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;

    const id = message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] !== '0' ? message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] : message.guild?.members?.find(member => member.user.username === message.embeds[0]?.author?.name.split(' — ')[0])?.id;
    if (!id) return;

    if (message.embeds[0]?.description?.startsWith('More information about a profession with')) {

        const { fields } = message.embeds[0];
        if (!fields) return;

        const worker = Number(fields[0].name.match(/(?<=Worker Lv )\d+/)?.[0]);
        const crafter = Number(fields[1].name.match(/(?<=Crafter Lv )\d+/)?.[0]);
        const lootboxer = Number(fields[2].name.match(/(?<=Lootboxer Lv )\d+/)?.[0]);
        const merchant = Number(fields[3].name.match(/(?<=Merchant Lv )\d+/)?.[0]);
        const enchanter = Number(fields[4].name.match(/(?<=Enchanter Lv )\d+/)?.[0]);
        if (!worker || !crafter || !lootboxer || !merchant || !enchanter) return;

        const profession = { worker, crafter, lootboxer, merchant, enchanter };

        await prisma.profession.upsert({
            where: { id },
            update: profession,
            create: {
                ...profession,
                user: {
                    connectOrCreate: {
                        where: { id },
                        create: { id }
                    }
                }
            }
        });
    } else if (message.embeds[0]?.fields?.[1]?.name === 'About this profession') {
        const type = message.embeds[0].fields[0].name.split(' ')[1].toLowerCase();
        const level = Number(message.embeds[0].fields[0].value.match(/(?<=Level\*\*: )\d+/)?.[0]);
        const xp = Number(message.embeds[0].fields[0].value.match(/(?<=XP\*\*: )[\d,]+/)?.[0].replace(/,/g, ''));
        if (!type || !level || !xp) return;

        const recentUserMessage = await message.channel?.getMessages({ before: message.id, limit: 1, filter: m => m.author.id === id && m.content.startsWith('rpg pr') });
        const targetLevel = Number(recentUserMessage?.[0]?.content.match(/(?<=rpg pr \w+ )\d+/)?.[0]);

        if (targetLevel && targetLevel <= level) return reply(message, 'Target level must be higher than current level');
        if (targetLevel > 69420) return reply(message, 'Target level must not higher than 69420');

        await reply(message, prXpList(type, level, xp, targetLevel));
    }
});

function prXpList(type: string, level: number, xp: number, targetLevel?: number) {
    if (!targetLevel) targetLevel = level + 10;

    let content = '';
    let totalXp = 0;

    for (let i = 0; i < targetLevel - level; i++) {
        const xpToNextLevel = prXp(type, level + i) - (i === 0 ? xp : 0);
        totalXp += xpToNextLevel;
        if (i < 35) content += `${bold(blue(`Level ${level + i}-${level + i + 1}`))}  ${xpToNextLevel.toLocaleString()} XP\n`;
    }

    content += `\n${bold(blue(`Total ${level}-${targetLevel}`))}  ${totalXp.toLocaleString()} XP\n`;

    if (type === 'worker') {
        content += `${bold(blue('25% boost        '))}  ${Math.ceil(totalXp / 100 / 1.25).toLocaleString()} banana pickaxes\n`;
        content += `${bold(blue('25% & world boost'))}  ${Math.ceil(totalXp / 100 / 1.25 / 1.1).toLocaleString()} banana pickaxes`;
    }

    if (type === 'merchant') {
        content += `${bold(blue('25% boost        '))}  ${(5 * Math.ceil(totalXp / 1.25)).toLocaleString()} logs\n`;
        content += `${bold(blue('25% & world boost'))}  ${(5 * Math.ceil(totalXp / 1.25 / 1.1)).toLocaleString()} logs`;
    }

    return codeBlock(content, 'ansi');
}

function prXp(type: string, level: number) {
    let e = 1;
    let m = 10;
    let d = 1;

    if (level >= 100) {
        level -= 99;
        m = 100;
        d = 10;

        switch (type) {
            case 'worker': e = 1.75; break;
            case 'crafter': e = 1.85; break;
            case 'lootboxer': e = 1.9; break;
            case 'merchant': e = 1.75; break;
            case 'enchanter': e = 1.95; break;
        }
    }

    switch (type) {
        case 'worker': return Math.ceil((level ** (1.8 ** e) - (level - 1) ** (1.8 ** e)) * m ** (1.8 ** e) / d);
        case 'crafter': return Math.ceil((level ** (2 ** e) - (level - 1) ** (2 ** e)) * m ** (2 ** e) / d);
        case 'lootboxer': return Math.ceil((level ** (1.7 ** e) - (level - 1) ** (1.7 ** e)) * m ** (1.7 ** e) / d);
        case 'merchant': return Math.ceil((level ** (2.05 ** e) - (level - 1) ** (2.05 ** e)) * m ** (2.05 ** e) / d);
        case 'enchanter': return Math.ceil((level ** (2 ** e) - (level - 1) ** (2 ** e)) * m ** (2 ** e) / d);
        default: return NaN;
    }

}
