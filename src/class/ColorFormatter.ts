type ColorFunction = (content: string) => string;

export class ColorFormatter {
    constructor(modifier: string) {
        this.gray = this.format(modifier, '30');
        this.red = this.format(modifier, '31');
        this.chartreuse = this.format(modifier, '32');
        this.gold = this.format(modifier, '33');
        this.blue = this.format(modifier, '34');
        this.pink = this.format(modifier, '35');
        this.teal = this.format(modifier, '36');
        this.white = this.format(modifier, '37');
    }

    private format(modifier: string, color: string): ColorFunction {
        return (content: string) => `\u001b[${modifier};${color}m${content}\u001b[0m`;
    }

    gray: ColorFunction;
    red: ColorFunction;
    chartreuse: ColorFunction;
    gold: ColorFunction;
    blue: ColorFunction;
    pink: ColorFunction;
    teal: ColorFunction;
    white: ColorFunction;
}
