import { defineCommand } from '../Command';
import { reply } from '../utils';

interface Response {
    translation: string;
    sourceLanguage: string;
}

defineCommand({
    name: 'translate',
    aliases: ['t'],
    description: 'Translate text to Vietnamese',
    usages: ['<text>'],
    rawContent: true,
    async run(message, [text]) {
        if (!text) return;

        const url = 'https://translate-pa.googleapis.com/v1/translate?' + new URLSearchParams({
            'params.client': 'gtx',
            'dataTypes': 'TRANSLATION',
            'key': 'AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA',
            'query.sourceLanguage': 'auto',
            'query.targetLanguage': 'vi',
            'query.text': text,
        });
        const res = await fetch(url).then(res => res.json()) as Response;
        await reply(message, res.translation);
    }
});
