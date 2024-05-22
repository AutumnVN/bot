import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { prisma } from '../Prisma';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.description?.startsWith('More information about a profession with')) return;

    const id = message.embeds[0].author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0];
    if (!id) return;

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
});
