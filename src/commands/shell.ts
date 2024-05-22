import { exec } from 'child_process';

import { defineCommand } from '../Command';
import { reply } from '../utils';

defineCommand({
    name: 'shell',
    aliases: ['$'],
    description: 'Execute shell command',
    usages: ['<command>'],
    ownerOnly: true,
    rawContent: true,
    run(message, [command]) {
        if (!command) return;

        exec(command, async (error, stdout, stderr) => {
            const content = stdout + stderr;
            await reply(message, content);
        });
    }
});
