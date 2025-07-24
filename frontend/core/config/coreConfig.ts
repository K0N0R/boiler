export class CoreConfigBase {
    ratio = {
        x: 16,
        y: 9,
    };
    width = 1600;
    height = 900;
    centerX = 800;
    centerY = 450;

    primaryColor = 0x3481b4; // #3481b4
    primaryContrastColor = 0xffffff; // #ffffff
    roundness = 15;
}

export const CoreConfig = new CoreConfigBase();
