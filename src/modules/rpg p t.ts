import { awaitMessages } from 'oceanic-collectors';
import { client } from '../Client';
import { EPICRPG_ID } from '../constants';
import { send } from '../utils';
import { Inventory } from '../class/Inventory';
import { Message } from 'oceanic.js';

client.on('messageCreate', async message => {
    if (message.author.id !== EPICRPG_ID) return;
    if (!message.embeds[0]?.author?.name.endsWith(' — profile')) return;

    const id = message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] !== '0' ? message.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] : message.guild?.members?.find(member => member.user.username === message.embeds[0]?.author?.name.split(' — ')[0])?.id;
    if (!id) return;

    const recentUserMessage = await message.channel?.getMessages({ before: message.id, limit: 1, filter: m => (m.author.id === id) && !!m.content.match(/^rpg p/i) });
    const isTrade = recentUserMessage?.[0]?.content.match(/^rpg p t$/i);
    if (!isTrade) return;

    const { fields } = message.embeds[0];
    if (!fields) return;

    const progressField = fields.find(field => field.name === 'PROGRESS')?.value;
    if (!progressField) return;

    const maxArea = progressField.match(/(?<=\(Max: )\w+/)?.[0];
    if (!maxArea) return;

    const { channel, channelID } = message;

    await send(channelID, 'rpg i');

    const [inventoryMessage] = await awaitMessages(client, channel, {
        filter: m => m.author.id === EPICRPG_ID
            && !!m.embeds[0]?.author?.name?.endsWith(' — inventory')
            && id === (m.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] !== '0' ? m.embeds[0]?.author?.iconURL?.match(/(?<=avatars\/)\d+/)?.[0] : m.guild?.members?.find(member => member.user.username === m.embeds[0]?.author?.name.split(' — ')[0])?.id),
        max: 1,
        time: 15000
    });
    if (!inventoryMessage) return await send(channelID, 'Timed out');
    let inventory = parseInventoryMessage(inventoryMessage as Message);

    const craftRegex = /([\d,]+) <:.+:\d+> `(fish|golden fish|EPIC fish|(?:wooden|EPIC|SUPER|MEGA|HYPER|ULTRA) log|apple|banana|ruby)` successfully crafted!(?:\nWOAH!! You got ([\d\.]+)% of the recipe back because of your magnificent crafting skills)?/i;
    const tradeRegex = /<:(.+):\d+> x([\d,]+) \n\*\*EPIC NPC\*\*: <:(.+):\d+> x([\d,]+)/i;

    while (true) {
        await send(channelID, 'Debug:\n```json\n' + JSON.stringify(Object.fromEntries(Object.entries(inventory).filter(([, value]) => value !== 0)), null, 2) + '\n```');

        switch (maxArea) {
            case '1':
            case '2':
                if (inventory.ultraLog > 0) await send(channelID, 'rpg dismantle ultra log all');
                else if (inventory.hyperLog > 0) await send(channelID, 'rpg dismantle hyper log all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e3) await send(channelID, 'rpg trade b all');
                else if (inventory.normieFish > 25e9 - 1e6) await send(channelID, `rpg craft golden fish ${Math.min(500e6, Math.ceil((inventory.normieFish - 25e9 + 1e7) / 15))}`);
                else if (inventory.goldenFish > 25e9 - 1e6) await send(channelID, `rpg craft epic fish ${Math.min(25e6, Math.ceil((inventory.goldenFish - 25e9 + 1e7) / 100))}`);
                else return await send(channelID, 'Done');
                break;
            case '3':
                if (inventory.banana > 0) await send(channelID, 'rpg dismantle banana all');
                else if (inventory.apple > 0) await send(channelID, 'rpg trade c all');
                else if (inventory.ultraLog > 0) await send(channelID, 'rpg dismantle ultra log all');
                else if (inventory.hyperLog > 0) await send(channelID, 'rpg dismantle hyper log all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e3) await send(channelID, 'rpg trade b all');
                else if (inventory.normieFish > 25e9 - 1e6) await send(channelID, `rpg craft golden fish ${Math.min(500e6, Math.ceil((inventory.normieFish - 25e9 + 1e7) / 15))}`);
                else if (inventory.goldenFish > 25e9 - 1e6) await send(channelID, `rpg craft epic fish ${Math.min(25e6, Math.ceil((inventory.goldenFish - 25e9 + 1e7) / 100))}`);
                else return await send(channelID, 'Done');
                break;
            case '4':
                if (inventory.epicFish > 0) await send(channelID, 'rpg dismantle epic fish all');
                else if (inventory.goldenFish > 0) await send(channelID, 'rpg dismantle golden fish all');
                else if (inventory.normieFish > 0) await send(channelID, 'rpg trade a all');
                else if (inventory.ultraLog > 0) await send(channelID, 'rpg dismantle ultra log all');
                else if (inventory.hyperLog > 0) await send(channelID, 'rpg dismantle hyper log all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e3) await send(channelID, 'rpg trade d all');
                else if (inventory.apple > 25e9 - 1e6) await send(channelID, `rpg craft banana ${Math.min(250e6, Math.ceil((inventory.apple - 25e9 + 1e7) / 15))}`);
                else return await send(channelID, 'Done');
                break;
            case '5':
                if (inventory.ruby > 0) await send(channelID, 'rpg trade e all');
                else if (inventory.epicFish > 0) await send(channelID, 'rpg dismantle epic fish all');
                else if (inventory.goldenFish > 0) await send(channelID, 'rpg dismantle golden fish all');
                else if (inventory.normieFish > 0) await send(channelID, 'rpg trade a all');
                else if (inventory.ultraLog > 0) await send(channelID, 'rpg dismantle ultra log all');
                else if (inventory.hyperLog > 0) await send(channelID, 'rpg dismantle hyper log all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e3) await send(channelID, 'rpg trade d all');
                else if (inventory.apple > 25e9 - 1e6) await send(channelID, `rpg craft banana ${Math.min(250e6, Math.ceil((inventory.apple - 25e9 + 1e7) / 15))}`);
                else return await send(channelID, 'Done');
                break;
            case '6':
            case '7':
                if (inventory.epicFish > 0) await send(channelID, 'rpg dismantle epic fish all');
                else if (inventory.goldenFish > 0) await send(channelID, 'rpg dismantle golden fish all');
                else if (inventory.normieFish > 0) await send(channelID, 'rpg trade a all');
                else if (inventory.banana > 0) await send(channelID, 'rpg dismantle banana all');
                else if (inventory.apple > 0) await send(channelID, 'rpg trade c all');
                else if (inventory.woodenLog > 25e9 - 1e6) await send(channelID, 'rpg trade f all');
                else return await send(channelID, 'Done');
                break;
            case '8':
                if (inventory.ruby > 0 && inventory.apple < 25e9 - 1e7 && inventory.banana < 25e9 - 1e7) await send(channelID, 'rpg trade e all');
                else if (inventory.epicFish > 0) await send(channelID, 'rpg dismantle epic fish all');
                else if (inventory.goldenFish > 0) await send(channelID, 'rpg dismantle golden fish all');
                else if (inventory.normieFish > 0) await send(channelID, 'rpg trade a all');
                else if (inventory.ultraLog > 0) await send(channelID, 'rpg dismantle ultra log all');
                else if (inventory.hyperLog > 0) await send(channelID, 'rpg dismantle hyper log all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e3 && inventory.apple < 25e9 - 1e7 && inventory.banana < 25e9 - 1e7) await send(channelID, 'rpg trade d all');
                else if (inventory.apple > 25e9 - 1e6 && inventory.banana < 25e9 - 1e7) await send(channelID, `rpg craft banana ${Math.min(500e6, Math.ceil((inventory.apple - 25e9 + 1e7) / 15))}`);
                else if (inventory.apple > 25e9 - 1e7 && inventory.banana > 25e9 - 1e7) await send(channelID, `rpg trade c ${inventory.apple - 25e9 + 1e7}`);
                else if (inventory.woodenLog > 1e3 && inventory.apple >= 25e9 - 1e7) await send(channelID, 'rpg trade f all');
                else return await send(channelID, 'Done');
                break;
            case '9':
                if (inventory.ruby > 0) await send(channelID, 'rpg trade e all');
                else if (inventory.banana > 0) await send(channelID, 'rpg dismantle banana all');
                else if (inventory.apple > 0) await send(channelID, 'rpg trade c all');
                else if (inventory.megaLog > 0) await send(channelID, 'rpg dismantle mega log all');
                else if (inventory.superLog > 0) await send(channelID, 'rpg dismantle super log all');
                else if (inventory.epicLog > 0) await send(channelID, 'rpg dismantle epic log all');
                else if (inventory.woodenLog > 1e7) await send(channelID, 'rpg trade b all');
                else if (inventory.normieFish > 25e9 - 1e6) await send(channelID, `rpg craft golden fish ${Math.min(2e9, Math.ceil((inventory.normieFish - 25e9 + 1e7) / 15))}`);
                else if (inventory.goldenFish > 25e9 - 1e6) await send(channelID, `rpg craft epic fish ${Math.min(250e6, Math.ceil((inventory.goldenFish - 25e9 + 1e7) / 100))}`);
                else return await send(channelID, 'Done');
                break;
            case '10':
            case '11':
            case '12':
            case '13':
            case '14':
            case '15':
            case 'TOP':
                if (inventory.ruby > 0) await send(channelID, 'rpg trade e all');
                else if (inventory.banana > 0) await send(channelID, 'rpg dismantle banana all');
                else if (inventory.apple > 0) await send(channelID, 'rpg trade c all');
                else if (inventory.epicFish > 0) await send(channelID, 'rpg dismantle epic fish all');
                else if (inventory.goldenFish > 0) await send(channelID, `rpg dismantle golden fish ${inventory.goldenFish > 50e9 ? 50e9 : 'all'}`);
                else if (inventory.normieFish > 0) await send(channelID, 'rpg trade a all');
                else if (inventory.woodenLog > 25e9 - 1e6) await send(channelID, `rpg craft epic log ${Math.min(5e9, Math.ceil((inventory.woodenLog - 25e9 + 1e7) / 25))}`);
                else if (inventory.epicLog > 25e9 - 1e6) await send(channelID, `rpg craft super log ${Math.min(1e9, Math.ceil((inventory.epicLog - 25e9 + 1e7) / 10))}`);
                else if (inventory.superLog > 25e9 - 1e6) await send(channelID, `rpg craft mega log ${Math.min(100e6, Math.ceil((inventory.superLog - 25e9 + 1e7) / 10))}`);
                else return await send(channelID, 'Done');
                break;
        }

        const [epicRpgMessage] = await awaitMessages(client, channel, {
            filter: async m => m.author.id === EPICRPG_ID
                && (!!m.content.match(craftRegex)
                    || m.embeds[0]?.description === '**EPIC NPC**: Alright! Our trade is done then'),
            max: 1,
            time: 15000
        });
        if (!epicRpgMessage) return await send(channelID, 'Timed out');

        if (epicRpgMessage.content.match(craftRegex)) {
            const playerMessage = await message.channel?.getMessages({ before: epicRpgMessage.id, limit: 3, filter: m => m.author.id === id && !!m.content.match(/^rpg (craft|dismantle)/i) });
            if (!playerMessage?.[0]) return await send(channelID, 'Could not find player craft/dismantle message\n```json\n' + JSON.stringify(playerMessage, null, 2) + '\n```');

            if (playerMessage[0].content.match(/^rpg craft/i)) {
                const match = epicRpgMessage.content.match(craftRegex);
                const amount = Number(match?.[1]?.replace(/,/g, '')) || 0;
                const item = match?.[2];
                const refund = Number(match?.[3]) || 0;

                switch (item) {
                    case 'golden fish':
                        inventory.normieFish -= amount * 15 - Math.floor(amount * 15 * refund / 100);
                        inventory.goldenFish += amount;
                        break;
                    case 'EPIC fish':
                        inventory.goldenFish -= amount * 100 - Math.floor(amount * 100 * refund / 100);
                        inventory.epicFish += amount;
                        break;
                    case 'EPIC log':
                        inventory.woodenLog -= amount * 25 - Math.floor(amount * 25 * refund / 100);
                        inventory.epicLog += amount;
                        break;
                    case 'SUPER log':
                        inventory.epicLog -= amount * 10 - Math.floor(amount * 10 * refund / 100);
                        inventory.superLog += amount;
                        break;
                    case 'MEGA log':
                        inventory.superLog -= amount * 10 - Math.floor(amount * 10 * refund / 100);
                        inventory.megaLog += amount;
                        break;
                    case 'HYPER log':
                        inventory.megaLog -= amount * 10 - Math.floor(amount * 10 * refund / 100);
                        inventory.hyperLog += amount;
                        break;
                    case 'ULTRA log':
                        inventory.hyperLog -= amount * 10 - Math.floor(amount * 10 * refund / 100);
                        inventory.ultraLog += amount;
                        break;
                    case 'banana':
                        inventory.apple -= amount * 15 - Math.floor(amount * 15 * refund / 100);
                        inventory.banana += amount;
                        break;
                }
            } else {
                const match = epicRpgMessage.content.match(craftRegex);
                const amount = Number(match?.[1]?.replace(/,/g, '')) || 0;
                const item = match?.[2];

                switch (item) {
                    case 'fish':
                        inventory.normieFish += amount;
                        inventory.goldenFish -= amount / 12;
                        break;
                    case 'golden fish':
                        inventory.goldenFish += amount;
                        inventory.epicFish -= amount / 80;
                        break;
                    case 'wooden log':
                        inventory.woodenLog += amount;
                        inventory.epicLog -= amount / 20;
                        break;
                    case 'EPIC log':
                        inventory.epicLog += amount;
                        inventory.superLog -= amount / 8;
                        break;
                    case 'SUPER log':
                        inventory.superLog += amount;
                        inventory.megaLog -= amount / 8;
                        break;
                    case 'MEGA log':
                        inventory.megaLog += amount;
                        inventory.hyperLog -= amount / 8;
                        break;
                    case 'HYPER log':
                        inventory.hyperLog += amount;
                        inventory.ultraLog -= amount / 8;
                        break;
                    case 'apple':
                        inventory.apple += amount;
                        inventory.banana -= amount / 12;
                        break;
                }
            }
        } else if (epicRpgMessage.embeds[0]?.description === '**EPIC NPC**: Alright! Our trade is done then') {
            const match = epicRpgMessage.embeds[0]?.fields?.[0]?.value?.match(tradeRegex);
            const itemGiven = match?.[1].toLowerCase();
            const amountGiven = Number(match?.[2].replace(/,/g, '')) || 0;
            const itemReceived = match?.[3].toLowerCase();
            const amountReceived = Number(match?.[4].replace(/,/g, '')) || 0;

            switch (itemGiven) {
                case 'normiefish':
                    inventory.normieFish -= amountGiven;
                    break;
                case 'woodenlog':
                    inventory.woodenLog -= amountGiven;
                    break;
                case 'apple':
                    inventory.apple -= amountGiven;
                    break;
                case 'ruby':
                    inventory.ruby -= amountGiven;
                    break;
            }

            switch (itemReceived) {
                case 'normiefish':
                    inventory.normieFish += amountReceived;
                    break;
                case 'woodenlog':
                    inventory.woodenLog += amountReceived;
                    break;
                case 'apple':
                    inventory.apple += amountReceived;
                    break;
                case 'ruby':
                    inventory.ruby += amountReceived;
                    break;
            }
        }
    }
});

function parseInventoryMessage(message: Message) {
    const itemField = message.embeds[0].fields?.[0]?.value;
    if (!itemField) throw new Error('Item field not found');

    const normieFish = Number(itemField.match(/(?<=normie fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const goldenFish = Number(itemField.match(/(?<=golden fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const epicFish = Number(itemField.match(/(?<=EPIC fish\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const woodenLog = Number(itemField.match(/(?<=wooden log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const epicLog = Number(itemField.match(/(?<=EPIC log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const superLog = Number(itemField.match(/(?<=SUPER log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const megaLog = Number(itemField.match(/(?<=MEGA log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const hyperLog = Number(itemField.match(/(?<=HYPER log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const ultraLog = Number(itemField.match(/(?<=ULTRA log\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const apple = Number(itemField.match(/(?<=apple\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const banana = Number(itemField.match(/(?<=banana\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;
    const ruby = Number(itemField.match(/(?<=ruby\*\*: )[\d,]+/)?.[0]?.replace(/,/g, '')) || 0;

    return new Inventory({ normieFish, goldenFish, epicFish, woodenLog, epicLog, superLog, megaLog, hyperLog, ultraLog, apple, banana, ruby });
}
