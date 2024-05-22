import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.fields?.[0]?.value?.startsWith('**Raid points**:')) return;

    const username = message.embeds[0].author?.name;
    const point = Number(message.embeds[0].fields[0].value.match(/(?<=\*\*Raid points\*\*: )\d+/)?.[0]);
    if (!username || !point) return;

    const league = await prisma.idleLeague.findUnique({ where: { username } });
    const oldPoint = league?.point;
    if (oldPoint === point) return;

    if (message.embeds[0].description?.startsWith('You were raided') && oldPoint) {
        let content = `**${username}** `;
        content += oldPoint >= point ? 'lost ' : 'gained ';
        content += `${Math.abs(oldPoint - point)} RP`;

        await reply(message, content);
    }

    await prisma.idleLeague.upsert({
        where: { username },
        update: { point },
        create: { username, point }
    });
});
