import { client, setOwnerID } from '../Client';
import { prisma } from '../Prisma';
import { send } from '../utils';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.rest.oauth.getApplication().then(app => setOwnerID(app.owner.id));

    const restartChannel = await prisma.restartChannel.findFirst();
    if (!restartChannel) return;

    await send(restartChannel.id, 'Restarted!');
    await prisma.restartChannel.deleteMany();
});
