import * as PIXI from 'pixi.js';
import { Box } from './box';

interface IProgressBarParams {
    width: number;
    height: number;
    oulineWidth: number;
    outlineColor: number;
    fillColor: number;
    roundness: number;
}

export class ProgressBar extends PIXI.Container {
    boxOutline!: Box;
    boxMask!: Box;
    boxFill!: Box;
    fillPercentage = 0;
    config: IProgressBarParams;

    constructor(config: Partial<IProgressBarParams>) {
        super();
        const defaultConfig = {
            width: 200,
            height: 50,
            oulineWidth: 6,
            outlineColor: 0xffffff,
            fillColor: 0x42b0ff,
            roundness: 15,
        };

        const mergedConfig = {
            ...defaultConfig,
            ...config,
        };
        this.config = mergedConfig;
        this.createComponents(mergedConfig);
    }

    createComponents(config: IProgressBarParams) {
        this.boxOutline = new Box({
            width: config.width + config.oulineWidth,
            height: config.height + config.oulineWidth,
            tint: config.outlineColor,
            alpha: 1,
            roundness: config.roundness,
        });
        this.boxFill = new Box({
            width: config.width,
            height: config.height,
            tint: config.fillColor,
            alpha: 1,
            roundness: 0,
        });
        this.boxMask = new Box({
            width: config.width,
            height: config.height,
            tint: 0xffffff,
            alpha: 1,
            roundness: config.roundness,
        });
        this.boxFill.mask = this.boxMask;
        this.boxFill.width = 0;
        this.updatePercentage(0);
        this.boxOutline.x = -config.oulineWidth / 2;
        this.boxOutline.y = -config.oulineWidth / 2;
        this.addChild(this.boxOutline, this.boxMask, this.boxFill);
    }

    updatePercentage(value: number) {
        this.fillPercentage = value;
    }

    update(deltaMS: number) {
        const deltaWidth = this.config.width * this.fillPercentage - this.boxFill.width;
        this.boxFill.width = this.boxFill.width + deltaWidth / 50;
    }
}
