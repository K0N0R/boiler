import * as PIXI from 'pixi.js';
import { EffectsManager, TEffectConfigGroup } from '../../systems/effectManager';
import { PixiUtils, TExtendedDisplayObject } from 'frontend/common';
import { CoreConfig } from '../../config/coreConfig';
import { Box, IBoxParams } from './box';

export interface IButtonParams extends IBoxParams {
    x: number;
    y: number;
    onClick: () => void;
    onHover: () => void;
    onHoverEnd: () => void;
    metadata: any;
    children: TExtendedDisplayObject[];
    group: TEffectConfigGroup;
}

export class Button extends PIXI.Container {
    public box: Box;
    public config: IButtonParams;

    constructor(config: Partial<IButtonParams>) {
        super();

        this.config = {
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            tint: CoreConfig.primaryColor,
            alpha: 1,
            roundness: CoreConfig.roundness,
            onClick: () => {},
            onHover: () => {},
            onHoverEnd: () => {},
            metadata: null,
            children: [],
            group: 'ui',
            anchor: 'mid',
            ...config,
        };

        this.position.set(config.x, config.y);
        this.box = new Box({
            ...this.config,
            x: 0,
            y: 0,
        });
        this.box.eventMode = 'static';

        const onHover = () => {
            EffectsManager.scale(this, {
                x: 1.1,
                y: 1.1,
                durationMS: 200,
                group: config.group,
            });
            if (config.onHover) config.onHover();
        };
        const onHoverEnd = () => {
            EffectsManager.scale(this, {
                x: 1,
                y: 1,
                durationMS: 200,
                group: config.group,
            });
            if (config.onHoverEnd) config.onHoverEnd();
        };
        const onClick = () => {
            if (config.onClick) {
                config.onClick();
            }
        };

        this.box.on('pointerenter', onHover);
        this.box.on('pointerleave', onHoverEnd);
        this.box.on('pointercancel', onHoverEnd);
        this.box.on('pointercancelcapture', onHoverEnd);

        this.box.on('pointertap', onClick);

        this.addChild(this.box);

        if (Array.isArray(config.children) && config.children.length > 0) {
            this.addChild(...config.children.map(PixiUtils.applyExtendedDisplayObjectParams));
        }
        this.x = this.config.x;
        this.y = this.config.y;
    }
}
