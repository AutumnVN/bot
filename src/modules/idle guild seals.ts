import { client } from '../Client';
import { IDLEFARM_ID } from '../constants';
import { reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== IDLEFARM_ID) return;
    if (!message.embeds[0]?.description?.includes('**SEALS CONTRIBUTED THIS WEEK**:')) return;

    const seal = Number(message.embeds[0].description.match(/(?<=\*\*SEALS CONTRIBUTED THIS WEEK\*\*: )\d+/)?.[0]);
    if (!seal || seal < 7800) return;

    await reply(message, '⚠️ **ALREADY REACHED 7800 SEALS. STOP CONTRIBUTING!** ⚠️');
});
