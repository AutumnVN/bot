import { Collection, Message } from 'oceanic.js';

export interface Command {
    name: string;
    aliases?: string[];
    description: string;
    usages?: string[];
    ownerOnly?: boolean;
    rawContent?: boolean;
    run: (message: Message, args: string[]) => void;
}

export const commands = new Collection<string, Command>();

export function defineCommand(command: Command) {
    commands.set(command.name, command);
}
