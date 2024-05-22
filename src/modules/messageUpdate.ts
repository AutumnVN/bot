import { client } from '../Client';

client.on('messageUpdate', message => {
    if (message.timestamp.getTime() < Date.now() - 120000) return;

    client.emit('messageCreate', message);
});
