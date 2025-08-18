import * as PIXI from 'pixi.js';
import { Typography } from '../components/typography';
import { Box } from '../components/box';
import { Button } from '../components/button';
import { CoreConfig } from 'frontend/core/config/coreConfig';
import { BasePopup } from './basePopup';
import { MessageBox } from '../components/messageBox';
import { Slider } from '../components/slider';
import { ProgressBar } from '../components/progressBar';
import { EffectsManager } from 'frontend/core/systems/effectManager';
import { ListSelect } from '../components/listSelect';
import { ListSelectItem } from '../components/listSelectItem';
import { ScrollArea } from '../components/scrollArea';

export class ConfigurationPopup extends BasePopup {
    box!: Box;
    title!: Typography;
    closeButton!: Button;

    constructor() {
        super();
        this.createBaseComponents();
        this.createAdvancedComponents();
    }

    createBaseComponents(): void {
        this.box = new Box({
            x: CoreConfig.centerX,
            y: CoreConfig.centerY,
            width: CoreConfig.width - CoreConfig.width * 0.1,
            height: CoreConfig.height - CoreConfig.height * 0.1,
            alpha: 0.95,
            anchor: 'mid',
        });
        this.addChild(this.box);

        this.closeButton = new Button({
            x: CoreConfig.width - CoreConfig.width * 0.05 - 50,
            y: CoreConfig.height * 0.05 + 50,
            width: 50,
            height: 50,
            onClick: () => {
                this.progressBarPercent += 0.1;
                this.progressBar.updatePercentage(this.progressBarPercent);
                //this.promise.resolve();
            },
            roundness: 100,
            alpha: 1,
            children: [new Typography({ text: '✖', color: 0x000000 })],
        });

        this.addChild(this.closeButton);

        this.title = new Typography({ text: 'Configuration', color: 0x000000, size: 36 });
        this.title.x = CoreConfig.width / 2;
        this.title.y = CoreConfig.height * 0.1;
        this.addChild(this.title);

        this.title.eventMode = 'dynamic';

        this.title.on('click', async () => {
            const selectList = new ListSelect({
                x: this.title.x,
                y: this.title.y,
                items: [
                    new ListSelectItem(
                        new Button({ width: 100, children: [new Typography({ text: 'first' })] }),
                        'first',
                    ),
                    new ListSelectItem(
                        new Button({ width: 100, children: [new Typography({ text: 'second' })] }),
                        'second',
                    ),
                    new ListSelectItem(
                        new Button({ width: 100, children: [new Typography({ text: 'third' })] }),
                        'third',
                    ),
                ],
                onSelect: (metadata) => {
                    console.log(metadata);
                },
            });
            this.addChild(selectList);

            await EffectsManager.scale(this.title, {
                x: 1.1,
                y: 1.1,
                durationMS: 1000,
            });
            await EffectsManager.scale(this.title, {
                x: 1,
                y: 1,
                durationMS: 1000,
            });
        });
    }

    // testing
    scrollArea!: ScrollArea;
    advancedContainer!: PIXI.Container;
    slider!: Slider;
    progressBar!: ProgressBar;
    progressBarPercent = 0;

    private createAdvancedComponents() {
        this.scrollArea = new ScrollArea({
            width: CoreConfig.width * 0.9,
            height: CoreConfig.height * 0.8,
            verticalPadding: 50,
        });
        this.scrollArea.x = CoreConfig.width * 0.05;
        this.scrollArea.y = CoreConfig.height * 0.15;
        this.addChild(this.scrollArea);

        this.advancedContainer = new PIXI.Container();
        this.scrollArea.contentContainer.addChild(this.advancedContainer);

        const messageBox = new MessageBox({ text: 'Lorem Ipsum les ma nore, a ja nos tre.' });
        messageBox.x = CoreConfig.centerX - CoreConfig.width * 0.1;
        messageBox.y = CoreConfig.centerY - 200;
        this.advancedContainer.addChild(messageBox);

        const slider = new Slider({ sliderWidth: 50 }, 0.5, () => {});
        slider.x = CoreConfig.centerX - CoreConfig.width * 0.1;
        slider.y = CoreConfig.centerY;
        this.advancedContainer.addChild(slider);
        this.slider = slider;

        const progressBar = new ProgressBar({ outlineWidth: 10 });
        progressBar.x = CoreConfig.centerX - CoreConfig.width * 0.1;
        progressBar.y = CoreConfig.centerY + 500;
        this.advancedContainer.addChild(progressBar);
        this.progressBar = progressBar;
    }

    update(deltaMS: number) {
        this.slider.update(deltaMS);
        this.progressBar.update(deltaMS);
        this.scrollArea.update(deltaMS);
    }
}
