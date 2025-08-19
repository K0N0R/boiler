import * as PIXI from 'pixi.js';
import { Bus } from '../../systems/bus';
import { MouseCoordinates } from './mouseCoordinates';

export class UiContainer extends PIXI.Container {
    mouseCoordinates: MouseCoordinates;

    constructor() {
        super();

        this.mouseCoordinates = new MouseCoordinates(); // for debug purposes

        this.addChild(this.mouseCoordinates);
        this.bindEvents();
    }

    bindEvents() {
        Bus.subscribe(
            'input',
            (message) => {
                switch (message.name) {
                    case 'resize':
                        this.onResize(message.data.width, message.data.height);
                        break;
                }
            },
            this,
        );
    }

    update(deltaMS: number) {}

    onResize(width: number, height: number) {}
}
