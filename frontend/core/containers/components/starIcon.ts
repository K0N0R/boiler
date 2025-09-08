import * as PIXI from 'pixi.js';

export class StarIcon extends PIXI.Container {
    constructor(amount: number, center?: boolean) {
        super();
        for (let i = 0; i < amount; i++) {
            const shadow = new PIXI.Sprite(PIXI.Assets.get('star.png'));
            shadow.anchor.set(0, 0.5);
            const scale = 25 / Math.max(shadow.width, shadow.height);
            shadow.scale.set(scale);
            shadow.x = i * 21 + 2;
            shadow.y = 2;
            shadow.tint = 0x000000;
            this.addChild(shadow);
            const sprite = new PIXI.Sprite(PIXI.Assets.get('star.png'));
            sprite.anchor.set(0, 0.5);
            sprite.scale.set(scale);
            sprite.x = i * 21;
            this.addChild(sprite);
        }
        if (center) {
            this.pivot.x = this.width / 2;
        }
    }
}
