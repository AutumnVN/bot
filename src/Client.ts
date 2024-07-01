import { Client } from 'oceanic.js';

import { codeBlock, send } from './utils';

process.loadEnvFile();
process.on('unhandledRejection', logError);
process.on('uncaughtException', logError);

export const client = new Client({
    auth: `Bot ${process.env.TOKEN}`,
    gateway: {
        intents: ['ALL']
    }
});

client.setMaxListeners(30);

export let ownerID: string;

export function setOwnerID(id: string) {
    ownerID = id;
}

function logError(error: unknown) {
    console.error(error);

    const { ERROR_LOG_CHANNEL_ID } = process.env;
    if (!ERROR_LOG_CHANNEL_ID || !(error instanceof Error)) return;

    send(ERROR_LOG_CHANNEL_ID, codeBlock(error.stack || error.message));
}
