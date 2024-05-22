export const PREFIX = 'c';
export const EPICRPG_ID = '555955826880413696';
export const IDLEFARM_ID = '1085406806492319784';
export const CHECK_INTERVAL = 60000;

export const EMOJI: Record<string, string> = {
    'blank': '<:blank:1242292384679596113>',
    'fish': '<:fish:1203287470750441502>',
    'log': '<:log:1203287481789976746>',
    'apple': '<:apple:1216213406852317184>',
    'ruby': '<:ruby:1203287520020930600>',
    'potion_time': '<:potion_time:1203282298674487306>'
};

export const ENCHANT_MULTIPLIER: Record<string, number> = {
    'Not enchanted': 0,
    'NORMIE': 0.05,
    'GOOD': 0.15,
    'GREAT': 0.25,
    'MEGA': 0.4,
    'EPIC': 0.6,
    'HYPER': 0.7,
    'ULTIMATE': 0.8,
    'PERFECT': 0.9,
    'EDGY': 0.95,
    'ULTRA-EDGY': 1,
    'OMEGA': 1.25,
    'ULTRA-OMEGA': 1.5,
    'GODLY': 2,
    'VOID': 3,
    'ETERNAL': 3.05
};

export const EQUIPMENT_STATS: Record<string, number> = {
    'No sword': 0,
    'No armor': 0,
    'basicarmor': 2,
    'basicsword': 1,
    'woodensword': 4,
    'fisharmor': 9,
    'fishsword': 13,
    'wolfarmor': 20,
    'applesword': 32,
    'eyearmor': 26,
    'zombiesword': 43,
    'bananaarmor': 36,
    'rubysword': 63,
    'EPICarmor': 42,
    'unicornsword': 82,
    'rubyarmor': 54,
    'hairsword': 89,
    'coinarmor': 68,
    'coinsword': 96,
    'mermaidarmor': 83,
    'electronicalsword': 100,
    'electronicalarmor': 100,
    'EDGYsword': 200,
    'EDGYarmor': 200,
    'bananasword': 19,
    'scaledarmor': 23,
    'scaledsword': 61,
    'watermelonarmor': 40,
    'watermelonsword': 99,
    'SUPERarmor': 86,
    'EPICsword': 130,
    'lootboxarmor': 124,
    'lotterysword': 186,
    'woodenarmor': 177,
    'ULTRAEDGYsword': 300,
    'ULTRAEDGYarmor': 300,
    'OMEGAsword': 400,
    'OMEGAarmor': 400,
    'ULTRAOMEGAsword': 500,
    'ULTRAOMEGAarmor': 500,
    'GODLYsword': 0,
    'VOIDsword': 750,
    'VOIDarmor': 750,
    'ABYSSsword': 1000,
    'ABYSSarmor': 1000,
    'CORRUPTEDsword': 2500,
    'CORRUPTEDarmor': 2500,
    'SPACEsword': 5000,
    'SPACEarmor': 5000,
    'TIMEsword': 10000,
    'TIMEarmor': 10000,
    'mecha': 10001
};

interface VoidStatCap {
    level: number;
    atk: number;
    def: number;
    life: number;
}

export const VOID_STAT_CAP: Record<string, VoidStatCap> = {
    '16': {
        'level': 1500,
        'atk': 2250,
        'def': 1250,
        'life': 25000
    },
    '17': {
        'level': 2500,
        'atk': 11500,
        'def': 8000,
        'life': 60000
    },
    '18': {
        'level': 4000,
        'atk': 47500,
        'def': 37500,
        'life': 300000
    },
    '19': {
        'level': 6500,
        'atk': 245000,
        'def': 245000,
        'life': 1450000
    },
    '20': {
        'level': 10000,
        'atk': 740000,
        'def': 740000,
        'life': 10000000
    }
};

interface TradeRate {
    fish: number;
    apple: number;
    ruby: number;
    best: 'fish' | 'apple' | 'ruby' | 'log';
}

export const TRADE_RATE: Record<string, TradeRate> = {
    '3': {
        'fish': 1,
        'apple': 3,
        'ruby': 225,
        'best': 'fish'
    },
    '5': {
        'fish': 2,
        'apple': 4,
        'ruby': 450,
        'best': 'apple'
    },
    '7': {
        'fish': 3,
        'apple': 15,
        'ruby': 675,
        'best': 'ruby'
    },
    '8': {
        'fish': 3,
        'apple': 8,
        'ruby': 675,
        'best': 'apple'
    },
    '9': {
        'fish': 2,
        'apple': 12,
        'ruby': 850,
        'best': 'fish'
    },
    '10': {
        'fish': 3,
        'apple': 12,
        'ruby': 500,
        'best': 'log'
    },
    '11': {
        'fish': 3,
        'apple': 8,
        'ruby': 500,
        'best': 'log'
    },
    '15': {
        'fish': 3,
        'apple': 8,
        'ruby': 350,
        'best': 'log'
    },
    'TOP': {
        'fish': 2,
        'apple': 4,
        'ruby': 250,
        'best': 'log'
    }
};

