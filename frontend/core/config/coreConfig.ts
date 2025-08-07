export class CoreConfigBase {
    ratio = {
        x: 16,
        y: 9,
    };
    width = this.ratio.x * 100;
    height = this.ratio.y * 100;
    centerX = this.width / 2;
    centerY = this.height / 2;

    primaryColor = 0x3481b4; // #3481b4
    primaryContrastColor = 0xffffff; // #ffffff
    roundness = 15;
}

export const CoreConfig = new CoreConfigBase();
