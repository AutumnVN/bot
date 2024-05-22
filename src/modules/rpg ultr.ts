import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { reply } from '../utils';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.description?.startsWith("**EPIC NPC**: Alright, this time i'm going to use")) return;

    const ultrainingField = message.embeds[0].fields?.find(field => field.name.startsWith('ULTRAining'));
    if (!ultrainingField) return;

    const [playerText, epicNpcText] = ultrainingField.value.split('\n');
    if (!playerText || !epicNpcText) return;

    const playerAtk = Number(playerText.match(/(?<=~-~ )\d+(?= <:epicrpgsword:)/)?.[0]);
    const playerDef = Number(playerText.match(/(?<=\| )\d+(?= <:epicrpgshield:)/)?.[0]);
    const epicNpcAtk = Number(epicNpcText.match(/(?<=~-~ )\d+(?= <:epicrpgsword:)/)?.[0]);
    const epicNpcDef = Number(epicNpcText.match(/(?<=\| )\d+(?= <:epicrpgshield:)/)?.[0]);
    if (!playerAtk || !playerDef || !epicNpcAtk || !epicNpcDef) return;

    const ratio = (playerAtk / epicNpcAtk) * (playerDef / epicNpcDef);
    const doubleRatio = (playerAtk / (epicNpcDef * 1.2)) * (playerDef / (epicNpcAtk * 1.2));
    const hasDoubleButton = message.components[0].components.length === 4

    if (!hasDoubleButton) return reply(message, chance(ratio));

    if (doubleRatio > 1) return reply(message, `${chance(doubleRatio)} DOUBLE`);

    await reply(message, `${chance(ratio)}\n${chance(doubleRatio)} DOUBLE`);
});

function chance(ratio: number) {
    if (ratio > 1) return '🟦 100%';
    if (0.9 < ratio && ratio <= 1) return '🟩 50%';
    if (0.8 < ratio && ratio <= 0.9) return '🟨 <50%';
    if (0.7 < ratio && ratio <= 0.8) return '🟧 <10%';
    return '🟥 0%';
}
