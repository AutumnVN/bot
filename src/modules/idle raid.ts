import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (message.embeds[0]?.fields?.[1]?.name !== 'Raid points') return;

    const username = message.embeds[0].fields[1].value.match(/(?<=\*\*).+?(?=\*\*: )/)?.[0];
    if (!username) return;

    const league = await prisma.idleLeague.findUnique({ where: { username } });
    if (!league) return;

    const point = Number(message.embeds[0].fields[1].value.match(/(?<=\*\*.+?\*\*: )[+-]?\d+/)?.[0]) + league.point;

    await prisma.idleLeague.upsert({
        where: { username },
        update: { point },
        create: { username, point }
    });
});
