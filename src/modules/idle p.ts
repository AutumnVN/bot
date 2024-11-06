import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { prisma } from '../Prisma';
import { reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — profile')) return;

    const id = message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] !== '0' ? message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] : message.guild?.members?.find(member => member.user.username === message.embeds[0]?.author?.name.split(' — ')[0])?.id;
    if (!id) return;

    const packingField = message.embeds[0].fields?.find(field => field.name === 'Packing')?.value;
    if (!packingField) return;

    const pack = Number(packingField.match(/(?<=Lv )\d+/)?.[0]);

    const energyField = message.embeds[0].fields?.find(field => field.name === 'Energy')?.value;
    if (!energyField) return;

    const energy = Number(energyField.match(/(?<=> )\d+(?=\/)/)?.[0]);
    if (energy < 120) return;

    await reply(message, `idle raid ${Math.floor(energy / 40)}`);

    await prisma.idleProfile.upsert({
        where: { id },
        update: { pack },
        create: {
            pack,
            user: {
                connectOrCreate: {
                    where: { id },
                    create: { id }
                }
            }
        }
    });
});
