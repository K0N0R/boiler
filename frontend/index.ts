import * as PIXI from 'pixi.js';
import { Core } from './core/core';
import { preload } from './core/preload';

import { InputHandler } from './core/systems/inputHandler';
import { MusicManager } from './core/systems/musicManager';
import { SoundManager } from './core/systems/soundManager';
import { prepreload } from './core/prepreload';
import { GameSettings } from './core/systems/gameSettings';
import { GameState } from './core/systems/gameState';
import { PopupContainer } from './core/containers/popup/popupContainer';

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
    await prepreload();
    await core.init();
    globalThis.__PIXI_APP__ = core.app; // for pixi chrome plugin to work, can be behind DEBUG flag
    PopupContainer.showLoader();
    await preload();
    core.instantiateComponents();
    PopupContainer.instantiatePopups();
    PopupContainer.hideLoader();
    await PopupContainer.show('welcome');
    GameState.goToLobby();
};
init();
