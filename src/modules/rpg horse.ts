import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { prisma } from '../Prisma';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.author?.name?.endsWith(' — horse')) return;

    const id = message.embeds[0].author.iconURL?.match(/(?<=avatars\/)\d+/)?.[0];
    if (!id) return;

    const horseField = message.embeds[0].fields?.[0]?.value;
    if (!horseField) return;

    const tier = Number(horseField.match(/(?<=<:tier)\d+(?=mount:)/)?.[0]);
    const type = horseField.match(/(?<=Type\*\* - ).+?(?=\n)/)?.[0];
    const level = Number(horseField.match(/(?<=Level\*\* - )\d+/)?.[0]);
    const epicness = Number(horseField.match(/(?<=Epicness\*\* - )\d+/)?.[0]);
    if (!tier || !type || !level || !epicness) return;

    const horse = { tier, type, level, epicness };

    await prisma.horse.upsert({
        where: { id },
        update: horse,
        create: {
            ...horse,
            user: {
                connectOrCreate: {
                    where: { id },
                    create: { id }
                }
            }
        }
    });
});
