import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { prisma } from '../Prisma';

const regex = /(\d+)d (\d+)h (\d+)m (\d+)s/;
const timeUnits = [86400000, 3600000, 60000, 1000];

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.description?.includes('Help us unseal the next areas!')) return;

    const voidAreasField = message.embeds[0].fields;
    if (!voidAreasField) return;

    for (const { name, value } of voidAreasField) {
        if (!value.includes('Unsealed')) continue;

        const area = name.match(/\d+/)?.[0];
        if (!area) continue;

        const time = parseTime(value);

        await prisma.voidReminder.upsert({
            where: { area },
            create: {
                area,
                time: Date.now() + time
            },
            update: {
                time: Date.now() + time
            }
        });
    }
});

function parseTime(time: string) {
    const matches = time.match(regex)?.slice(1);
    if (!matches) return 0;

    return matches.reduce((acc, match, index) => {
        if (!match) return acc;
        return acc + Number(match) * timeUnits[index];
    }, 0);
}
