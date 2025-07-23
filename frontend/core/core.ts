import * as PIXI from 'pixi.js';

import { UiContainer } from './containers/ui/uiContainer';

import { Bus } from './systems/bus';
import { Time } from './systems/time';
import { EffectsManager } from './systems/effectManager';
import { CoreConfig } from './config/coreConfig';
import { WorldContainer } from './containers/world/worldContainer';
import { LoaderPopup } from './containers/popup/loaderPopup';
import { WelcomePopup } from './containers/popup/welcomePopup';

export class Core {
    app!: PIXI.Application;

    timeScale = 1;
    worldContainer!: WorldContainer;

    uiContainer!: UiContainer;
    loaderPopup!: LoaderPopup;
    welcomePopup!: WelcomePopup;

    update(ticker: PIXI.Ticker) {
        const deltaTargetFrame = ticker.deltaTime;
        const deltaMS = (deltaTargetFrame * 1000) / 60;

        if (deltaMS > 100) {
            return;
        }

        EffectsManager.updateNonFreezable(deltaMS);

        if (this.loaderPopup.visible) this.loaderPopup.update(deltaMS);
        if (this.uiContainer) this.uiContainer.update(deltaMS);

        const scaledDeltaMS = deltaMS * this.timeScale;

        EffectsManager.updateFreezable(scaledDeltaMS);
        Time.update(scaledDeltaMS);
        this.worldContainer.update(scaledDeltaMS);
    }

    async init() {
        await this.instantinateApp();
        this.instantinateInitialComponents();
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
        this.app.stage.addChild(this.loaderPopup, this.welcomePopup);
        this.watchLoaderForResize();
    }

    public instantinateComponents() {
        this.uiContainer = new UiContainer();
        this.worldContainer = new WorldContainer();
        this.app.stage.addChild(this.worldContainer, this.uiContainer);

        this.watchContainersForResize();
    }

    private watchLoaderForResize() {
        this.app.renderer.on('resize', (width, height) => {
            this.calculateObjectRatio(this.loaderPopup, width, height);
        });
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    private watchContainersForResize() {
        const scallableToRatio = [this.uiContainer];

        this.app.renderer.on('resize', (width, height) => {
            Bus.emit('input', { name: 'resize', data: { width, height } });
            scallableToRatio.forEach((scallable) => {
                this.calculateObjectRatio(scallable, width, height);
            });
        });
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    async showLoader() {
        this.loaderPopup.visible = true;
    }

    async hideLoader() {
        this.loaderPopup.visible = false;
    }

    async showWelcome() {
        this.welcomePopup.visible = true;
    }

    async hideWelcome() {
        this.welcomePopup.visible = false;
    }

    bindEvents() {
        Bus.subscribe(
            'effects',
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
