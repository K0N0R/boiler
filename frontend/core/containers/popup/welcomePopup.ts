import { BasePopup } from './basePopup';
import { Typography } from '../components/typography';
import { EffectsManager } from 'frontend/core/systems/effectManager';

export class WelcomePopup extends BasePopup {
    text!: Typography;

    constructor() {
        super();

        this.createComponents();
    }

    createComponents() {
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
        this.addChild(this.text);

        this.startTextAnimation();
    }

    async startTextAnimation() {
        await EffectsManager.alpha(this.text, { alpha: 0, durationMS: 3000 });
        await EffectsManager.alpha(this.text, { alpha: 1, durationMS: 3000 });
        this.startTextAnimation();
    }

    update(deltaMS: number) {}
}
