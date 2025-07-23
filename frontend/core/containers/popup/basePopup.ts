import * as PIXI from 'pixi.js';
import { JsUtils } from 'frontend/common';

export class BasePopup extends PIXI.Container {
    resolveMenu = JsUtils.noop;

    update(deltaMS: number) {}

    show() {
        const { promise, resolve, reject } = JsUtils.createPromise();
        this.resolveMenu = resolve;
        return promise;
    }

    createBaseComponents() {}
}
