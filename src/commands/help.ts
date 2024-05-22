import { Command, commands, defineCommand } from '../Command';
import { bold, codeBlock, color, reply } from '../utils';

defineCommand({
    name: 'help',
    description: 'List all commands or get info about a specific command',
    usages: ['[command]'],
    async run(message, [name]) {
        if (!name) return reply(message, commandList());

        name = name.toLowerCase();
        const command = commands.get(name) || commands.find(({ aliases }) => aliases?.includes(name));
        if (!command) return reply(message, 'That command does not exist');

        await reply(message, commandHelp(command));
    }
});

function commandList() {
    const filteredCommands = commands.filter(({ ownerOnly }) => !ownerOnly);
    const longest = Math.max(...filteredCommands.map(({ name, usages }) => {
        name += usages?.length ? ' ' + usages[0] : '';
        return name.length;
    }));

    let content = bold.blue('Command List\n\n');
    content += filteredCommands.reduce((acc, { name, usages, description }) => {
        name += usages?.length ? ' ' + usages[0] : '';
        const paddedName = name.padEnd(longest, ' ');
        return acc + `${color.teal(paddedName)}  ${description}\n`;
    }, '');

    return codeBlock(content, 'ansi');
}

function commandHelp({ name, aliases, description, usages, ownerOnly }: Command) {
    let content = name;
    content += aliases?.length ? ` (${aliases.join(', ')})` : '';
    content = bold.blue(`${content}\n\n`);
    content += usages?.length ? usages.reduce((acc, usage) => acc + color.teal(`${name} ${usage}\n`), '') : '';
    content += description;
    content += ownerOnly ? '\nThis command is owner-only' : '';

    return codeBlock(content, 'ansi');
}




