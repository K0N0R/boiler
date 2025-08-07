import * as PIXI from 'pixi.js';

import { UiContainer } from './containers/ui/uiContainer';

import { Bus } from './systems/bus';
import { UiTime, WorldTime } from './systems/time';
import { EffectsManager } from './systems/effectManager';
import { CoreConfig } from './config/coreConfig';
import { WorldContainer } from './containers/world/worldContainer';
import { GameState } from './systems/gameState';

import { PopupContainer } from './containers/popup/popupContainer';

export class Core {
    app!: PIXI.Application;

    timeScale = 1;
    worldContainer!: WorldContainer;

    uiContainer!: UiContainer;
    scalableContainers: PIXI.Container[] = [];

    update(ticker: PIXI.Ticker) {
        const deltaTargetFrame = ticker.deltaTime;
        const deltaMS = (deltaTargetFrame * 1000) / 60;

        if (deltaMS > 100) {
            return;
        }

        UiTime.update(deltaMS);
        EffectsManager.updateUi(deltaMS);
        this.uiContainer?.update(deltaMS);

        if (GameState.state === 'initialization') {
        } else {
            const scaledDeltaMS = deltaMS * this.timeScale;

            WorldTime.update(scaledDeltaMS);
            EffectsManager.updateGameplay(scaledDeltaMS);
            this.worldContainer?.update(scaledDeltaMS);
        }
    }

    async init() {
        await this.instantiateApp();
        this.instantiateInitialComponents();
        this.watchContainersForResize();
        this.app.ticker.add(this.update.bind(this));
        this.bindEvents();
    }

    async instantiateApp() {
        this.app = new PIXI.Application();
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x000000,
            antialias: false,
        });

        this.app.canvas.addEventListener('contextmenu', (evt) => evt.preventDefault());
        document.body.appendChild(this.app.canvas);
    }

    private instantiateInitialComponents() {
        this.app.stage.addChild(PopupContainer.instance);
        this.scalableContainers.push(PopupContainer.instance);
    }

    public instantiateComponents() {
        this.uiContainer = new UiContainer();
        this.worldContainer = new WorldContainer();
        this.app.stage.addChild(this.worldContainer, this.uiContainer);
        this.scalableContainers.push(this.uiContainer);
    }

    private watchContainersForResize() {
        this.app.renderer.on('resize', (width, height) => {
            Bus.emit('input', { name: 'resize', data: { width, height } });
            this.scalableContainers.forEach((scalable) => {
                this.calculateObjectRatio(scalable, width, height);
            });
        });
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    bindEvents() {
        Bus.subscribe(
            'system',
            (message) => {
                switch (message.name) {
                    case 'time-scale': {
                        EffectsManager.value(this, {
                            value: message.data.timeScale,
                            fieldName: 'timeScale',
                            durationMS: 500,
                        });
                    }
                }
            },
            this,
        );
    }

    calculateObjectRatio(object: PIXI.Container, width: number, height: number) {
        const targetRatio = CoreConfig.ratio.y / CoreConfig.ratio.x;
        const windowRatio = height / width;

        if (windowRatio > targetRatio) {
            const scale = width / CoreConfig.width;
            object.scale.set(scale);
            object.x = 0;
            object.y = (height - CoreConfig.height * scale) / 2;
        } else {
            const scale = height / CoreConfig.height;
            object.scale.set(scale);
            object.y = 0;
            object.x = (width - CoreConfig.width * scale) / 2;
        }
    }
}
