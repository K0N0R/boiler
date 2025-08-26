import * as PIXI from 'pixi.js';
export class SoundIcon extends PIXI.Container {
    sprite: PIXI.Sprite;
    constructor() {
        super();
        this.sprite = new PIXI.Sprite(PIXI.Assets.get('sound-enabled.png'));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.06);
        this.addChild(this.sprite);
    }

    setEnabled(enabled: boolean) {
        if (enabled) {
            this.sprite.texture = new PIXI.Texture(PIXI.Assets.get('sound-enabled.png'));
        } else {
            this.sprite.texture = new PIXI.Texture(PIXI.Assets.get('sound-disabled.png'));
        }
    }
}
