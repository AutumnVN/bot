import { Client } from 'oceanic.js';

process.loadEnvFile();
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

export const client = new Client({
    auth: `Bot ${process.env.TOKEN}`,
    gateway: {
        intents: ['ALL']
    }
});

export let ownerID: string;

export function setOwnerID(id: string) {
    ownerID = id;
}
