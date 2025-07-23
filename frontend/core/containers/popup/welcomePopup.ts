import * as PIXI from 'pixi.js';
import { BasePopup } from './basePopup';
import { Typography } from '../components/typography';
import { EffectsManager } from '../../systems/effectManager';
import { CoreConfig } from '../../config/coreConfig';
import { GameState } from '../../systems/gameState';

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
            GameState.lobby();
        });
    }

    private createText() {
        this.text = new Typography({
            text: 'Click anywhere to start',
            kind: 'big',
            horizontalAlign: 'center',
            verticalAlign: 'center',
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
    }

    async startTextAnimation() {
        await EffectsManager.alpha(this.text, { alpha: 0, durationMS: 3000 });
        await EffectsManager.alpha(this.text, { alpha: 1, durationMS: 3000 });
        this.startTextAnimation();
    }

    update(deltaMS: number) {}
}
