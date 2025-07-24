import * as PIXI from 'pixi.js';

import { UiContainer } from './containers/ui/uiContainer';

import { Bus } from './systems/bus';
import { UiTime, WorldTime } from './systems/time';
import { EffectsManager } from './systems/effectManager';
import { CoreConfig } from './config/coreConfig';
import { WorldContainer } from './containers/world/worldContainer';
import { LoaderPopup } from './containers/popup/loaderPopup';
import { WelcomePopup } from './containers/popup/welcomePopup';
import { GameState } from './systems/gameState';
import { JsUtils } from 'frontend/common';

export class Core {
    app!: PIXI.Application;

    timeScale = 1;
    worldContainer!: WorldContainer;

    uiContainer!: UiContainer;
    loaderPopup!: LoaderPopup;
    welcomePopup!: WelcomePopup;
    scallableContainers: PIXI.Container[] = [];

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
            if (this.loaderPopup.visible) this.loaderPopup.update(deltaMS);
            if (this.welcomePopup.visible) this.welcomePopup.update(deltaMS);
        } else {
            const scaledDeltaMS = deltaMS * this.timeScale;

            WorldTime.update(scaledDeltaMS);
            EffectsManager.updateGameplay(scaledDeltaMS);
            this.worldContainer?.update(scaledDeltaMS);
        }
    }

    async init() {
        await this.instantinateApp();
        this.instantinateInitialComponents();
        this.watchContainersForResize();
        this.app.ticker.add(this.update.bind(this));
        this.bindEvents();
    }

    async instantinateApp() {
        this.app = new PIXI.Application();
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x000000,
            antialias: false,
        });

        this.app.canvas.addEventListener('contextmenu', (evt) => evt.preventDefault());
        document.body.appendChild(this.app.canvas);
    }

    private instantinateInitialComponents() {
        this.loaderPopup = new LoaderPopup();
        this.welcomePopup = new WelcomePopup();
        this.hideLoader();
        this.hideWelcome();
        this.app.stage.addChild(this.loaderPopup, this.welcomePopup);
        this.scallableContainers.push(this.loaderPopup, this.welcomePopup);
    }

    public instantinateComponents() {
        this.uiContainer = new UiContainer();
        this.worldContainer = new WorldContainer();
        this.app.stage.addChild(this.worldContainer, this.uiContainer);
        this.scallableContainers.push(this.uiContainer);
    }

    private watchContainersForResize() {
        this.app.renderer.on('resize', (width, height) => {
            Bus.emit('input', { name: 'resize', data: { width, height } });
            this.scallableContainers.forEach((scallable) => {
                this.calculateObjectRatio(scallable, width, height);
            });
        });
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    showLoader() {
        this.loaderPopup.visible = true;
    }

    hideLoader() {
        this.loaderPopup.visible = false;
    }

    async showWelcome() {
        const promise = JsUtils.createPromise();

        this.welcomePopup.resolve = promise.resolve;
        this.welcomePopup.visible = true;

        await promise.promise;
        this.welcomePopup.visible = false;
    }

    hideWelcome() {
        this.welcomePopup.visible = false;
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
