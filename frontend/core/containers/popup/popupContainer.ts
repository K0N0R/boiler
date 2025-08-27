import * as PIXI from 'pixi.js';

import { ConfigurationPopup } from './configurationPopup';
import { BasePopup } from './basePopup';
import { WelcomePopup } from './welcomePopup';
import { LoaderPopup } from './loaderPopup';
import { IPromise, JsUtils } from '@common';
import { Bus, TBusMessage } from '@systems/bus';

export type TPopupNames = 'welcome' | 'configuration';

export class PopupContainer extends PIXI.Container {
    static instance: PopupContainer;
    static createInstance() {
        this.instance = new PopupContainer();
    }

    loader: LoaderPopup;
    popups!: Record<TPopupNames, BasePopup>;
    popupPromises!: Record<TPopupNames, IPromise | null>;

    constructor() {
        super();

        this.popupPromises = {
            configuration: null,
            welcome: null,
        };

        this.loader = new LoaderPopup();
        this.loader.visible = false;
        this.addChild(this.loader);

        Bus.subscribe('input', this.handleInputMessages.bind(this), this);
    }

    static instantiatePopups() {
        this.instance.popups = {
            welcome: new WelcomePopup(),
            configuration: new ConfigurationPopup(),
        };
        Object.values(this.instance.popups).forEach((popup) => (popup.visible = false));
        this.instance.addChild(...Object.values(this.instance.popups));
    }

    static async showLoader() {
        this.instance.loader.visible = true;
    }

    static async hideLoader() {
        this.instance.loader.visible = false;
    }

    static async show(popupName: TPopupNames) {
        this.instance.popupPromises[popupName] = JsUtils.createPromise();
        this.instance.popups[popupName].visible = true;
        this.instance.popups[popupName].promise = this.instance.popupPromises[popupName];
        this.instance.popups[popupName].show();
        await this.instance.popupPromises[popupName].promise;
        this.instance.popups[popupName].visible = false;
        this.instance.popupPromises[popupName] = null;
    }

    static async hide(popupName: TPopupNames) {
        this.instance.popupPromises[popupName]?.resolve();
    }

    update(deltaMS: number) {
        if (this.loader.visible) {
            this.loader.update(deltaMS);
        }
        if (!this.popups) return;
        Object.values(this.popups)
            .filter((popup) => popup.visible)
            .forEach((menu) => {
                menu.update(deltaMS);
            });
    }

    private handleInputMessages(message: TBusMessage<'input'>) {
        switch (message.name) {
            case 'keyup':
                this.onButtonPress(message.data);
                break;
        }
    }

    private onButtonPress(buttonString: string) {
        switch (buttonString) {
            case 'escape':
                this.onEsc();
                break;
            default:
                return;
        }
    }

    private onEsc() {
        const activePopups = this.getActivePopups();
        if (activePopups.length) {
            activePopups.forEach((activePopup) => {
                if (!this.isModalPopup(activePopup)) {
                    this.popupPromises[activePopup]?.resolve();
                }
            });
        } else {
            PopupContainer.show('configuration');
        }
    }

    private getActivePopups(): TPopupNames[] {
        const activePopups: TPopupNames[] = [];
        for (let key in this.popupPromises) {
            const popupName = key as TPopupNames;
            if (this.popupPromises[popupName]) {
                activePopups.push(popupName);
            }
        }
        return activePopups;
    }

    private isModalPopup(name: TPopupNames) {
        switch (name) {
            default:
                return false;
        }
    }
}
