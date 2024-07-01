import { Message } from 'oceanic.js';

import { client, ownerID } from '../Client';
import { commands } from '../Command';
import { PREFIX } from '../constants';

client.on('messageCreate', command);
client.on('messageUpdate', command);

function command(message: Message) {
    if (message.timestamp.getTime() < Date.now() - 120000) return;
    if (message.author.bot) return;
    if (!message.content.toLowerCase().startsWith(PREFIX)) return;

    const commandText = message.content.slice(PREFIX.length).trim();
    const [name, ...args] = commandText.split(/\s+/);
    if (!name) return;

    const command = commands.get(name) ?? commands.find(({ aliases }) => aliases?.includes(name));
    if (!command) return;
    if (command.ownerOnly && message.author.id !== ownerID) return;

    if (command.rawContent) {
        const argsText = commandText.slice(name.length).trim();
        command.run(message, [argsText]);
    } else {
        command.run(message, args);
    }
}
