import * as PIXI from 'pixi.js';
import { IPromise } from '@common/*';

export class BasePopup extends PIXI.Container {
    promise!: IPromise;

    show() {}

    createBaseComponents() {}

    update(deltaMS: number) {}
}
