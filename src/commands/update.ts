

import { defineCommand } from '../Command';
import { prisma } from '../Prisma';
import { codeBlock, execAsync, reply, send } from '../utils';

defineCommand({
    name: 'update',
    description: 'Pull changes and restart',
    ownerOnly: true,
    async run(message, args) {
        if (args.length) return;

        const gitReset = await execAsync('git reset --hard @{u}');
        await reply(message, codeBlock(gitReset));

        const gitPull = await execAsync('git pull');
        await send(message.channelID, codeBlock(gitPull));

        if (gitPull.includes('Already up to date.')) return;

        if (gitPull.includes('package.json')) {
            const pnpmI = await execAsync('pnpm i');
            await send(message.channelID, codeBlock(pnpmI));
        }

        if (gitPull.includes('schema.prisma')) {
            const prismaGenerate = await execAsync('pnpm prisma generate');
            await send(message.channelID, codeBlock(prismaGenerate));
        }

        await prisma.restartChannel.create({ data: { id: message.channelID } });
        await send(message.channelID, 'Restarting...');
        process.exit(0);
    }
});
