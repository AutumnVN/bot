import { client } from '../Client';
import { logError } from '../utils';

client.on('error', logError);
