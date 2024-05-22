import { inspect } from 'util';

import { defineCommand } from '../Command';
import { codeBlock, reply } from '../utils';

defineCommand({
    name: 'eval',
    aliases: ['e'],
    description: 'Evaluate JavaScript code',
    usages: ['<code>'],
    ownerOnly: true,
    rawContent: true,
    async run(message, [code]) {
        if (!code) return;

        code = code.replace(/^`{3}((js|javascript)\n)?|`{3}$/g, '');

        if (code.includes('await')) {
            code = `(async () => { ${code} })()`;
        }

        try {
            const output = inspect(await eval(code));
            await reply(message, codeBlock(output, 'js'));
        } catch (error) {
            if (!(error instanceof Error)) return;
            await reply(message, codeBlock(error.stack || error.message));
        }
    }
});
