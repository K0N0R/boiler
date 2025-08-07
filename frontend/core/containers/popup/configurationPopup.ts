import { Typography } from '../components/typography';
import { Box } from '../components/box';
import { Button } from '../components/button';

import { CoreConfig } from 'frontend/core/config/coreConfig';
import { BasePopup } from './basePopup';

export class ConfigurationPopup extends BasePopup {
    box!: Box;
    title!: Typography;
    closeButton!: Button;

    constructor() {
        super();
        this.createBaseComponents();
    }

    createBaseComponents(): void {
        this.box = new Box({
            x: CoreConfig.width / 2,
            y: CoreConfig.height / 2,
            width: CoreConfig.width - CoreConfig.width * 0.1,
            height: CoreConfig.height - CoreConfig.height * 0.1,
            alpha: 0.95,
            anchor: 'mid',
        });
        this.addChild(this.box);

        this.closeButton = new Button({
            x: CoreConfig.width - CoreConfig.width * 0.1,
            y: CoreConfig.height * 0.1,
            width: 50,
            height: 50,
            onClick: () => {
                this.promise.resolve();
            },
            roundness: 100,
            alpha: 1,
            children: [new Typography({ text: '✖', color: 0x000000 })],
        });

        this.addChild(this.closeButton);

        this.title = new Typography({ text: 'Configuration', color: 0x000000 });
        this.title.x = CoreConfig.width / 2;
        this.title.y = CoreConfig.height * 0.1;
        this.addChild(this.title);
    }
}
