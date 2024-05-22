
import { exec } from 'child_process';

import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { codeBlock, reply } from '../utils';

defineCommand({
    name: 'update',
    description: 'Pull changes and restart',
    ownerOnly: true,
    run(message, args) {
        if (args.length) return;

        exec('git pull --rebase', async (error, stdout, stderr) => {
            const content = stdout + stderr;

            await reply(message, codeBlock(content));

            if (content.includes('Already up to date.')) return;

            await prisma.restartChannel.create({ data: { id: message.channelID } });
            await reply(message, codeBlock(content) + '\nRestarting...');
            process.exit(0);
        });
    }
});
