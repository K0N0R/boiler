import * as PIXI from 'pixi.js';

import { GameSettings } from './systems/gameSettings';
import { Bus } from './systems/bus';

const preloadConfig = require('../preload-config.json');

export async function preload() {
    const onProgress = (percentage: number) => {
        Bus.emit('input', { name: 'preload', data: percentage });
    };
    let preload = [...preloadConfig];

    if (!GameSettings.soundEnabled) {
        preload = preloadConfig.filter(
            (i: string) => !i.includes('.ogg') && !i.includes('.m4a') && !i.includes('.mp3'),
        );
    }
    await PIXI.Assets.load(preload, onProgress);
}
