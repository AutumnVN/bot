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
    }
}

