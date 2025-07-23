import * as PIXI from 'pixi.js';
import { Typography } from '../components/typography';
import { IPosition } from 'frontend/common';
import { Bus } from '../../systems/bus';

export class MouseCoordinates extends PIXI.Container {
    text!: Typography;
    pointerPosition: IPosition = { x: 0, y: 0 };
    constructor() {
        super();
        if (DEBUG) {
            this.createComponents();
            this.bindEvents();
        }
    }

    private createComponents() {
        this.text = new Typography({
            text: '',
            kind: 'big',
            horizontalAlign: 'left',
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
    }

    private bindEvents() {
        Bus.subscribe(
            'input',
            (message) => {
                switch (message.name) {
                    case 'pointermove':
                        this.pointerPosition = (window as any)['devApi'].core.lobbyWorld.toLocal(
                            message.data,
                        );
                        this.text.setText(
                            `x:${Math.round(this.pointerPosition.x)}, y: ${Math.round(this.pointerPosition.y)}`,
                        );

                        break;
                }
            },
            this,
        );
    }
}
