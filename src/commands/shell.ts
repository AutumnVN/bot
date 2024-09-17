import { defineCommand } from '../Command';
import { codeBlock, execAsync, reply } from '../utils';

defineCommand({
    name: 'shell',
    aliases: ['$'],
    description: 'Execute shell command',
    usages: ['<command>'],
    ownerOnly: true,
    rawContent: true,
    async run(message, [command]) {
        if (!command) return;

        const content = await execAsync(command);

        await reply(message, codeBlock(content));
    }
});
