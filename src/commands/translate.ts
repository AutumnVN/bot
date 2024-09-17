import { defineCommand } from '../Command';
import { reply } from '../utils';

interface Sentence {
    trans: string;
    orig: string;
    backend: number;
}

interface Ld_result {
    srclangs: string[];
    srclangs_confidences: number[];
    extended_srclangs: string[];
}

interface Response {
    sentences: Sentence[];
    src: string;
    confidence: number;
    spell: object;
    ld_result: Ld_result;
}

defineCommand({
    name: 'translate',
    aliases: ['t'],
    description: 'Translate text to Vietnamese',
    usages: ['<text>'],
    rawContent: true,
    async run(message, [text]) {
        if (!text) return;

        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dj=1&q=${encodeURIComponent(text)}`).then(res => res.json()) as Response;

        await reply(message, res.sentences.map(s => s?.trans).filter(Boolean).join(''));
    }
});
