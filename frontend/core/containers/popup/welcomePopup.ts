import * as PIXI from 'pixi.js';
import { Typography } from '../components/typography';
import { EffectsManager } from '../../systems/effectManager';
import { CoreConfig } from '../../config/coreConfig';
import { BasePopup } from './basePopup';

export class WelcomePopup extends BasePopup {
    plane!: PIXI.Sprite;
    text!: Typography;

    constructor() {
        super();

        this.createComponents();
    }

    createComponents() {
        this.createPlane();
        this.createText();

        this.startTextAnimation();

        this.addChild(this.text, this.plane);
    }

    private createPlane() {
        this.plane = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.plane.width = CoreConfig.width;
        this.plane.height = CoreConfig.height;
        this.plane.tint = 0x000000;
        this.plane.alpha = 0;
        this.plane.eventMode = 'static';
        this.plane.on('pointertap', () => {
            this.promise.resolve();
        });
    }

    private createText() {
        this.text = new Typography({
            text: 'Click anywhere to start',
            kind: 'big',
            styleProps: {
                dropShadow: {
                    alpha: 0.5,
                    angle: Math.PI / 6,
                    blur: 2,
                    color: '#000000',
                    distance: 1,
                },
            },
        });
        this.text.x = CoreConfig.centerX;
        this.text.y = CoreConfig.centerY;
    }

    async startTextAnimation() {
        await EffectsManager.alpha(this.text, { alpha: 0, durationMS: 3000 });
        await EffectsManager.alpha(this.text, { alpha: 1, durationMS: 3000 });
        this.startTextAnimation();
    }
}
