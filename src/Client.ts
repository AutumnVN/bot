import { Client } from 'oceanic.js';

import { logError } from './utils';

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
