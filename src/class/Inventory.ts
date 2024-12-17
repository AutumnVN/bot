import { TRADE_RATE } from '../constants';
import { prXp } from '../utils';

interface InventoryContent {
    normieFish: number;
    goldenFish: number;
    epicFish: number;
    woodenLog: number;
    epicLog: number;
    superLog: number;
    megaLog: number;
    hyperLog: number;
    ultraLog: number;
    apple: number;
    banana: number;
    ruby: number;
    crafterLevel: number;
}

export class Inventory implements InventoryContent {
    normieFish: number;
    goldenFish: number;
    epicFish: number;
    woodenLog: number;
    epicLog: number;
    superLog: number;
    megaLog: number;
    hyperLog: number;
    ultraLog: number;
    apple: number;
    banana: number;
    ruby: number;
    crafterLevel: number;
    crafterXp = 0;
    logShouldSell = 0;

    constructor(content: InventoryContent) {
        this.normieFish = content.normieFish;
        this.goldenFish = content.goldenFish;
        this.epicFish = content.epicFish;
        this.woodenLog = content.woodenLog;
        this.epicLog = content.epicLog;
        this.superLog = content.superLog;
        this.megaLog = content.megaLog;
        this.hyperLog = content.hyperLog;
        this.ultraLog = content.ultraLog;
        this.apple = content.apple;
        this.banana = content.banana;
        this.ruby = content.ruby;
        this.crafterLevel = content.crafterLevel;
    }

    totalFish() {
        return this.normieFish + this.goldenFish * 12 + this.epicFish * 80 * 12;
    }

    totalLog(woodenLog = true, epicLog = true, superLog = true, megaLog = true, hyperLog = true, ultraLog = true) {
        let logs = 0;
        if (woodenLog) logs += this.woodenLog;
        if (epicLog) logs += this.epicLog * 20;
        if (superLog) logs += this.superLog * 8 * 20;
        if (megaLog) logs += this.megaLog * 8 * 8 * 20;
        if (hyperLog) logs += this.hyperLog * 8 * 8 * 8 * 20;
        if (ultraLog) logs += this.ultraLog * 8 * 8 * 8 * 8 * 20;

        return logs;
    }

    totalApple() {
        return this.apple + this.banana * 12;
    }

    total(area: string) {
        const tradeRate = TRADE_RATE[area];
        const multiplier = tradeRate.best === 'log' ? 1 : tradeRate[tradeRate.best];

        return Math.floor((this.totalFish() * tradeRate.fish + this.totalLog() + this.totalApple() * tradeRate.apple + this.ruby * tradeRate.ruby) / multiplier);
    }

    timePotion() {
        this.normieFish = sevenDotFivePercentOf(this.normieFish);
        this.goldenFish = sevenDotFivePercentOf(this.goldenFish);
        this.epicFish = sevenDotFivePercentOf(this.epicFish);
        this.woodenLog = sevenDotFivePercentOf(this.woodenLog);
        this.epicLog = sevenDotFivePercentOf(this.epicLog);
        this.superLog = sevenDotFivePercentOf(this.superLog);
        this.megaLog = sevenDotFivePercentOf(this.megaLog);
        this.hyperLog = sevenDotFivePercentOf(this.hyperLog);
        this.ultraLog = sevenDotFivePercentOf(this.ultraLog);
        this.apple = sevenDotFivePercentOf(this.apple);
        this.banana = sevenDotFivePercentOf(this.banana);
        this.ruby = sevenDotFivePercentOf(this.ruby);
    }

    tradeToA10(area: string) {
        const areas = ['3', '5', '7', '8', '9', '10'];
        const index = areas.indexOf(area);
        if (index === -1) return this.tradeTo(area);

        areas.slice(index).forEach(area => this.tradeTo(area));
    }

    tradeTo(area: string) {
        const tradeRate = TRADE_RATE[area];

        if (tradeRate.best === 'fish') {
            let logs = this.totalLog(true, true, true, false, false, false) + this.totalApple() * tradeRate.apple;
            this.addCrafterXp(this.epicLog + this.superLog * 4 + this.banana);
            this.woodenLog = this.epicLog = this.superLog = this.apple = this.banana = 0;

            if (area === '3') {
                logs += this.totalLog(false, false, false, true, true, true);
                this.addCrafterXp(this.megaLog * 20 + this.hyperLog * 100 + this.ultraLog * 500);
                this.megaLog = this.hyperLog = this.ultraLog = 0;
            }

            if (area === '9') {
                logs += this.ruby * tradeRate.ruby;
                this.ruby = 0;
            }

            this.normieFish += Math.floor(logs / tradeRate.fish);
            this.woodenLog = logs % tradeRate.fish;
            if (this.normieFish <= 24999999999) return;

            const normieFishExcess = this.normieFish - (24999999999 - 15);
            this.normieFish = 24999999999 - 15;
            const goldenFishGain = Math.floor(normieFishExcess / 15 * craftProfit(this.crafterLevel));
            this.goldenFish += goldenFishGain;
            this.addCrafterXp(goldenFishGain);
            this.normieFish += normieFishExcess % 15;
            if (this.goldenFish <= 24999999999) return;

            const goldenFishExcess = this.goldenFish - (24999999999 - 100);
            this.goldenFish = 24999999999 - 100;
            const epicFishGain = Math.floor(goldenFishExcess / 100 * craftProfit(this.crafterLevel));
            this.epicFish += epicFishGain;
            this.addCrafterXp(epicFishGain * 12);
            this.goldenFish += goldenFishExcess % 100;
            this.epicFish = Math.min(this.epicFish, 24999999999);
        }

        if (tradeRate.best === 'log') {
            const logs = this.totalFish() * tradeRate.fish + this.totalApple() * tradeRate.apple + this.ruby * tradeRate.ruby;
            this.addCrafterXp(this.goldenFish + this.epicFish * 12 + this.banana);
            this.normieFish = this.goldenFish = this.epicFish = this.apple = this.banana = this.ruby = 0;

            this.woodenLog += logs;
            if (this.woodenLog <= 24999999999) return;

            const woodenLogExcess = this.woodenLog - (24999999999 - 25);
            this.woodenLog = 24999999999 - 25;
            const epicLogGain = Math.floor(woodenLogExcess / 25 * craftProfit(this.crafterLevel));
            this.epicLog += epicLogGain;
            this.addCrafterXp(epicLogGain);
            this.woodenLog += woodenLogExcess % 25;
            if (this.epicLog <= 24999999999) return;

            const epicLogExcess = this.epicLog - (24999999999 - 10);
            this.epicLog = 24999999999 - 10;
            const superLogGain = Math.floor(epicLogExcess / 10 * craftProfit(this.crafterLevel));
            this.superLog += superLogGain;
            this.addCrafterXp(superLogGain * 4);
            this.epicLog += epicLogExcess % 10;
            if (this.superLog <= 24999999999) return;

            const superLogExcess = this.superLog - (24999999999 - 10);
            this.superLog = 24999999999 - 10;
            const megaLogGain = Math.floor(superLogExcess / 10 * craftProfit(this.crafterLevel));
            this.megaLog += megaLogGain;
            this.addCrafterXp(megaLogGain * 20);
            this.superLog += superLogExcess % 10;
            this.megaLog = Math.min(this.megaLog, 24999999999);
        }

        if (tradeRate.best === 'apple') {
            let logs = this.totalFish() * tradeRate.fish + this.totalLog(true, true, true, true, true, false) + this.ruby * tradeRate.ruby;
            this.addCrafterXp(this.goldenFish + this.epicFish * 12 + this.epicLog + this.superLog * 4 + this.megaLog * 20 + this.hyperLog * 100);
            this.normieFish = this.goldenFish = this.epicFish = this.woodenLog = this.epicLog = this.superLog = this.megaLog = this.hyperLog = this.ruby = 0;

            if (area === '5') {
                logs += this.totalLog(false, false, false, false, false, true);
                this.addCrafterXp(this.ultraLog * 500);
                this.ultraLog = 0;
            }

            this.apple += Math.floor(logs / tradeRate.apple);
            this.woodenLog = logs % tradeRate.apple;
            if (this.apple <= 24999999999) return;

            const appleExcess = this.apple - (24999999999 - 15);
            this.apple = 24999999999 - 15;
            const bananaGain = Math.floor(appleExcess / 15 * craftProfit(this.crafterLevel));
            this.banana += bananaGain;
            this.addCrafterXp(bananaGain);
            this.apple += appleExcess % 15;
            if (this.banana <= 24999999999) return;

            const bananaExcess = this.banana - 24999999999;

            if (area === '8') {
                this.logShouldSell = Math.floor((bananaExcess / craftProfit(this.crafterLevel) * 15 * 8) / (3.75 * craftProfit(this.crafterLevel) / 1.25) / (2 * (craftProfit(this.crafterLevel) / 1.25) ** 2) / 0.075 / (craftProfit(this.crafterLevel) / 1.25) ** 3);
            }

            this.banana = 24999999999;
            this.ruby += Math.floor(bananaExcess * 12 * tradeRate.apple / tradeRate.ruby);
            this.woodenLog += bananaExcess * 12 * tradeRate.apple % tradeRate.ruby;
            this.ruby = Math.min(this.ruby, 24999999999);
        }

        if (tradeRate.best === 'ruby') {
            const logs = this.totalFish() * tradeRate.fish + this.totalLog(true, true, true, true, true, false) + this.totalApple() * tradeRate.apple;
            this.addCrafterXp(this.goldenFish + this.epicFish * 12 + this.epicLog + this.superLog * 4 + this.megaLog * 20 + this.hyperLog * 100 + this.banana);
            this.normieFish = this.goldenFish = this.epicFish = this.woodenLog = this.epicLog = this.superLog = this.megaLog = this.hyperLog = this.apple = this.banana = 0;
            this.ruby += Math.floor(logs / tradeRate.ruby);
            this.woodenLog += logs % tradeRate.ruby;
        }
    }

    addCrafterXp(xp: number) {
        this.crafterXp += xp;
        while (this.crafterXp >= prXp('crafter', this.crafterLevel)) {
            this.crafterXp -= prXp('crafter', this.crafterLevel);
            this.crafterLevel++;
        }
    }
}

function sevenDotFivePercentOf(item: number) {
    return Math.floor(item * 0.075);
}

function craftProfit(crafterLevel: number) {
    const craftProcChance = Math.min(95, crafterLevel / 1.25) / 100;
    const craftProcReturn = (12.5 + ((crafterLevel > 100 ? 1 : 0) * 225 * (crafterLevel - 100)) ** 0.2) / 100;
    return 1 / (1 - craftProcChance * craftProcReturn);
}
