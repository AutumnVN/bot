import { Horse } from '@prisma/client';

import { client } from '../Client';
import { ENCHANT_MULTIPLIER, EPICRPG_ID, EQUIPMENT_STATS, VOID_STAT_CAP } from '../constants';
import { prisma } from '../Prisma';
import { reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — profile')) return;

    const id = message.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0];
    if (!id) return;

    const { fields } = message.embeds[0];
    if (!fields) return;

    const progressField = fields.find(field => field.name === 'PROGRESS')?.value;
    if (!progressField) return;

    const level = Number(progressField.match(/(?<=Level\*\*: )\d+/)?.[0]);
    const area = progressField.match(/(?<=Area\*\*: )\w+/)?.[0];
    const maxArea = progressField.match(/(?<=\(Max: )\w+/)?.[0];
    const timeTravel = Number(progressField.match(/(?<=Time travels\*\*: )\d+/)?.[0]);
    const coolness = Number(progressField.match(/(?<=Coolness\*\*: )\d+/)?.[0]);
    if (!level || !area || !maxArea || !timeTravel || !coolness) return;

    const profile = { level, area, maxArea, timeTravel, coolness };

    await prisma.profile.upsert({
        where: { id },
        update: profile,
        create: {
            ...profile,
            user: {
                connectOrCreate: {
                    where: { id },
                    create: { id }
                }
            }
        }
    });

    const horse = await prisma.horse.findUnique({ where: { id } });
    if (!horse) return;
    if (!(area in VOID_STAT_CAP) || horse.type !== 'MAGIC') return;

    const statsField = fields.find(field => field.name === 'STATS')?.value;
    if (!statsField) return;

    const atk = Number(statsField.match(/(?<=AT\*\*: )\d+/)?.[0]);
    const def = Number(statsField.match(/(?<=DEF\*\*: )\d+/)?.[0]);
    const life = Number(statsField.match(/(?<=LIFE\*\*: \d+\/)\d+/)?.[0]);
    if (!atk || !def || !life) return;

    const equipmentField = fields.find(field => field.name === 'EQUIPMENT')?.value;
    if (!equipmentField) return;

    const [swordText, armorText] = equipmentField.split('\n');
    const swordName = swordText === 'No sword' ? swordText : swordText.match(/(?<=<:).+?(?=:)/)?.[0];
    const swordEnchant = swordText === 'No sword' ? swordText : swordText.match(/(?<=\[).+?(?=\])/)?.[0];
    const armorName = armorText === 'No armor' ? armorText : armorText.match(/(?<=<:).+?(?=:)/)?.[0];
    const armorEnchant = armorText === 'No armor' ? armorText : armorText.match(/(?<=\[).+?(?=\])/)?.[0];
    if (!swordName || !swordEnchant || !armorName || !armorEnchant) return;

    const content = calculateMissingStats(area, level, atk, def, life, swordName, swordEnchant, armorName, armorEnchant, horse);
    if (!content) return;

    await reply(message, content);
});

function getBaseStats(value: number, equipment: string, enchant: string, area: string, horse: Horse) {
    const equipmentStats = EQUIPMENT_STATS[equipment];
    const enchantMultiplier = ENCHANT_MULTIPLIER[enchant];
    const horseBonus = area === '19' ? 0 : 0.002 * (0.8 + 0.2 * horse.tier) * horse.level * (1 + horse.epicness / 200);

    return Math.round(value / (1 + enchantMultiplier * (1 + horseBonus)) - equipmentStats);
}

function calculateMissingStats(area: string, level: number, atk: number, def: number, life: number, swordName: string, swordEnchant: string, armorName: string, armorEnchant: string, horse: Horse) {
    const cap = VOID_STAT_CAP[area];
    const missingAtk = cap.atk - getBaseStats(atk, swordName, swordEnchant, area, horse);
    const missingDef = cap.def - getBaseStats(def, armorName, armorEnchant, area, horse);
    const missingStats = {
        level: cap.level - level,
        atk: missingAtk,
        def: missingDef,
        apple_juice: Math.ceil(Math.max(missingAtk, missingDef) / 2),
        life: cap.life - life
    };
    let content = '';

    for (const stat in missingStats) {
        if (stat === 'level') continue;

        const missing = missingStats[stat as keyof typeof missingStats];
        if (missing <= 0) continue;

        content += `Need **${missing}** more ${stat.replace(/_/g, ' ').toUpperCase()}`;

        if (missingStats.level <= 0) {
            content += '\n';
            continue;
        }

        const multiplier = stat === 'life' ? 5 : stat === 'apple_juice' ? 0.5 : 1;

        if (missing > missingStats.level * multiplier) {
            content += ` (only **${Math.ceil(missing - missingStats.level * multiplier)}** more ${stat.replace(/_/g, ' ').toUpperCase()} if reach level ${cap.level})\n`;
        } else {
            content += ` (capped after reaching level ${level + Math.ceil(missing / multiplier)})\n`;
        }
    }

    return content;
}
