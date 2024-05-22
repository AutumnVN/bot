import util from 'util';

import { defineCommand } from '../Command';
import { codeBlock, reply } from '../utils';

interface Console {
    lines: string[];
    log: (...args: string[]) => void;
}

defineCommand({
    name: 'eval',
    aliases: ['e'],
    description: 'Evaluate JavaScript code',
    usages: ['<code>'],
    ownerOnly: true,
    rawContent: true,
    async run(message, [code]) {
        if (!code) return;

        const console: Console = {
            lines: [],
            log(...args: string[]) {
                this.lines.push(...args.map(arg => inspect(arg)).join(' ').split('\n'));
            }
        };

        code = code.replace(/^`{3}((js|javascript)\n)?|`{3}$/g, '');

        if (code.includes('await')) {
            code = `(async () => { ${code} })()`;
        }

        try {
            let output = inspect(await eval(code));
            const consoleOutput = console.lines.join('\n');

            if (consoleOutput) {
                output += `\n\n${consoleOutput}`;
            }

            await reply(message, codeBlock(output, 'js'));
        } catch (error) {
            if (!(error instanceof Error)) return;
            await reply(message, codeBlock(error.message));
        }
    }
});

function inspect(obj: unknown) {
    return util.inspect(cloneAndReplace(obj));
}

function cloneAndReplace(obj: unknown) {
    if (obj && typeof obj === 'object') {
        if (Array.isArray(obj) && obj.constructor === Array) {
            const o: unknown[] = [];
            obj.map((el, i) => o[i] = cloneAndReplace(el));
            return o;
        } else if (obj.constructor === Object) {
            const o: Record<string, unknown> = {};
            Object.entries(obj).map(([k, v]) => o[k] = cloneAndReplace(v));
            return o;
        }
    } else if (typeof obj === 'string') {
        if (obj.includes('\n')) {
            return {
                [util.inspect.custom]: () => obj
            };
        }
    }

    return obj;
}
