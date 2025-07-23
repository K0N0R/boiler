import * as PIXI from 'pixi.js';

export type TBoxAnchor = 'leftTop' | 'mid';
export interface IBoxParams {
    width: number;
    height: number;
    alpha?: number;
    tint?: number;
    roundness?: number;
    anchor?: TBoxAnchor;
}

export class Box extends PIXI.Container {
    box!: PIXI.Graphics;
    constructor(public config: IBoxParams) {
        super();
        this.createBox(config);
    }

    createBox(config: IBoxParams) {
        this.box = new PIXI.Graphics();
        const x = config.anchor === 'mid' ? -config.width / 2 : 0;
        const y = config.anchor === 'mid' ? -config.height / 2 : 0;
        const roundness = config.roundness != null ? config.roundness : 50;

        this.box.roundRect(x, y, config.width, config.height, roundness);
        this.box.fill(0xffffff);
        this.box.alpha = config.alpha ?? 0.9;
        this.box.tint = config.tint ?? 0x000000;
        this.addChild(this.box);
    }

    updateBox(config: IBoxParams) {
        this.removeChild(this.box);
        this.createBox(config);
    }
}
