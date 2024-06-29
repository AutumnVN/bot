import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — profile')) return;

    const id = message.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0];
    if (!id) return;

    const { fields } = message.embeds[0];
    if (!fields) return;

    const packingField = fields.find(field => field.name === 'Packing')?.value;
    if (!packingField) return;

    const pack = Number(packingField.match(/(?<=Lv )\d+/)?.[0]);

    await prisma.idleProfile.upsert({
        where: { id },
        update: { pack },
        create: { id, pack }
    });
});
