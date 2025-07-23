import * as PIXI from 'pixi.js';
import { Core } from './core/core';
import { preload } from './core/preload';

import { InputHandler } from './core/systems/inputHandler';
import { MusicManager } from './core/systems/musicManager';
import { SoundManager } from './core/systems/soundManager';
import { Time } from './core/systems/time';
import { prepreload } from './core/prepreload';
import { GameSettings } from './core/systems/gameSettings';

const init = async () => {
    const core = new Core();

    if (DEBUG) {
        console.log('debug build');
        (window as any).devApi = {
            PIXI,
            Assets: PIXI.Assets,
            SoundManager,
            core,
            textures: () => Object.fromEntries((PIXI.Assets.cache as any)._cache.entries()),
        };
    } else {
        console.log('production build');
    }
    GameSettings.init();
    InputHandler.init();
    SoundManager.init();
    MusicManager.init();
    Time.init();
    await prepreload();
    await core.init();
    core.showLoader();
    await preload();
    core.instantinateComponents();
    core.hideLoader();
    core.showWelcome();
};
init();
