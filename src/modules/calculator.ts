import { Message } from 'oceanic.js';

import { client } from '../Client';
import { reply } from '../utils';

client.on('messageCreate', calculator);
client.on('messageUpdate', calculator);

async function calculator(message: Message) {
    if (message.timestamp.getTime() < Date.now() - 120000) return;
    if (message.author.bot) return;
    if (!/^[ ,\d+*/^().-]+$/.test(message.content)) return;

    const expression = message.content.replace(/[ ,]/g, '');
    if (!isNaN(Number(expression))) return;
    if (/\.\D/.test(expression)) return;
    if (/\.\d+\./.test(expression)) return;
    if (/[+*/^-]([^(\d.]|$)/.test(expression)) return;
    if (/(^|[^)\d])[*/^]/.test(expression)) return;
    if (/[\d.)]\(/.test(expression)) return;
    if (/\)[\d.(]/.test(expression)) return;

    const result = plus(expression);
    if (isNaN(result)) return;

    await reply(message, result.toString());
}

function plus(expression: string): number {
    const numbers = split(expression, '+').map(minus);
    return numbers.reduce((a, b) => a + b, 0);
}

function minus(expression: string) {
    const numbers = split(expression, '-').map(multiply);
    return numbers.reduce((a, b) => a - b);
}

function multiply(expression: string) {
    const numbers = split(expression, '*').map(divide);
    return numbers.reduce((a, b) => a * b, 1);
}

function divide(expression: string) {
    const numbers = split(expression, '/').map(power);
    return numbers.reduce((a, b) => a / b);
}

function power(expression: string) {
    const numbers = split(expression, '^').map(trimParentheses);
    return numbers.reduce((a, b) => a ** b);
}

function trimParentheses(expression: string) {
    if (/^\(.*\)$/.test(expression)) return plus(expression.replace(/^\(|\)$/g, ''));
    return Number(expression);
}

function split(expression: string, operator: string) {
    const result = [];
    let current = '';
    let parentheses = 0;

    for (const char of expression) {
        if (char === '(') parentheses++;
        if (char === ')') parentheses--;
        if (parentheses === 0 && char === operator) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);

    return result;
}
